import { NextRequest } from 'next/server'
import { requireArtist } from '@/lib/auth/require-artist'
import { prisma } from '@/lib/db/prisma'
import { withRateLimit, rateLimiters } from '@/lib/security/rate-limit'
import { handleApiError, ApiError } from '@/lib/utils/api-error'
import { UpdateEventSchema } from '@/lib/validations/event.schema'
import { updateGCalEvent, deleteGCalEvent } from '@/lib/integrations/google-calendar'

async function getOwnedEvent(eventId: string, artistId: string) {
  const event = await prisma.event.findUnique({ where: { id: eventId } })
  if (!event) throw new ApiError('Evento no encontrado', 404)
  if (event.artistId !== artistId) throw new ApiError('Sin autorización', 403)
  return event
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const limited = await withRateLimit(req, rateLimiters.api)
    if (limited) return limited

    const artist = await requireArtist()
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        client: { select: { id: true, name: true, phone: true } },
        quotes: {
          select: { id: true, quoteNumber: true, status: true, total: true, currency: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    })

    if (!event || event.artistId !== artist.id) throw new ApiError('Evento no encontrado', 404)

    return Response.json({
      data: {
        ...event,
        startDate: event.startDate.toISOString(),
        endDate: event.endDate.toISOString(),
        price: event.price?.toString() ?? null,
        paidAmount: event.paidAmount.toString(),
        quotes: event.quotes.map((q) => ({ ...q, total: q.total.toString() })),
      },
    })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const limited = await withRateLimit(req, rateLimiters.api)
    if (limited) return limited

    const artist = await requireArtist()
    await getOwnedEvent(params.id, artist.id)

    const body = await req.json()
    const parsed = UpdateEventSchema.safeParse(body)
    if (!parsed.success) {
      throw new ApiError(parsed.error.errors[0]?.message ?? 'Datos inválidos', 400)
    }

    const { startDate, endDate, price, clientId, ...rest } = parsed.data

    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      throw new ApiError('La fecha de fin debe ser posterior a la de inicio', 400)
    }

    if (clientId) {
      const client = await prisma.client.findUnique({ where: { id: clientId } })
      if (!client || client.artistId !== artist.id) {
        throw new ApiError('Cliente no válido', 400)
      }
    }

    const updated = await prisma.event.update({
      where: { id: params.id },
      data: {
        ...rest,
        ...(clientId !== undefined && { clientId: clientId ?? null }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(price !== undefined && { price: price ?? null }),
      } as Parameters<typeof prisma.event.update>[0]['data'],
      include: { client: { select: { id: true, name: true } } },
    })

    // Sincronizar con Google Calendar si el evento ya tenía un googleEventId
    if (updated.googleEventId) {
      updateGCalEvent(artist.id, updated.googleEventId, {
        title: updated.title,
        startDate: updated.startDate,
        endDate: updated.endDate,
        timezone: updated.timezone,
        venue: updated.venue,
        venueAddress: updated.venueAddress,
        internalNotes: updated.internalNotes,
        clientName: updated.client?.name ?? null,
      }).catch(() => {})
    }

    return Response.json({
      data: {
        ...updated,
        startDate: updated.startDate.toISOString(),
        endDate: updated.endDate.toISOString(),
        price: updated.price?.toString() ?? null,
        paidAmount: updated.paidAmount.toString(),
      },
    })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const limited = await withRateLimit(req, rateLimiters.api)
    if (limited) return limited

    const artist = await requireArtist()
    const event = await getOwnedEvent(params.id, artist.id)

    // Eliminar de Google Calendar antes de borrar de DB
    if (event.googleEventId) {
      deleteGCalEvent(artist.id, event.googleEventId).catch(() => {})
    }

    await prisma.event.delete({ where: { id: params.id } })

    return new Response(null, { status: 204 })
  } catch (err) {
    return handleApiError(err)
  }
}
