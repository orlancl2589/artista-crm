import { NextRequest } from 'next/server'
import { requireArtist, requireArtistWithEmail } from '@/lib/auth/require-artist'
import { prisma } from '@/lib/db/prisma'
import { withRateLimit, rateLimiters } from '@/lib/security/rate-limit'
import { handleApiError, ApiError } from '@/lib/utils/api-error'
import { UpdateQuoteSchema } from '@/lib/validations/quote.schema'
import { sendQuoteNotification } from '@/lib/email/send-quote-notification'
import type { Prisma } from '@prisma/client'

async function getOwnedQuote(quoteId: string, artistId: string) {
  const quote = await prisma.quote.findUnique({ where: { id: quoteId } })
  if (!quote) throw new ApiError('Cotización no encontrada', 404)
  if (quote.artistId !== artistId) throw new ApiError('Sin autorización', 403)
  return quote
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const limited = await withRateLimit(req, rateLimiters.api)
    if (limited) return limited

    const artist = await requireArtist()
    const quote = await prisma.quote.findUnique({
      where: { id: params.id },
      include: {
        client: { select: { id: true, name: true } },
        event: { select: { id: true, title: true, startDate: true } },
      },
    })

    if (!quote || quote.artistId !== artist.id) throw new ApiError('Cotización no encontrada', 404)

    return Response.json({
      data: {
        ...quote,
        subtotal: quote.subtotal.toString(),
        tax: quote.tax.toString(),
        total: quote.total.toString(),
        validUntil: quote.validUntil?.toISOString() ?? null,
        signedAt: quote.signedAt?.toISOString() ?? null,
        createdAt: quote.createdAt.toISOString(),
        updatedAt: quote.updatedAt.toISOString(),
        event: quote.event
          ? { ...quote.event, startDate: quote.event.startDate.toISOString() }
          : null,
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

    const { artist, email: artistEmail } = await requireArtistWithEmail()
    const existing = await getOwnedQuote(params.id, artist.id)

    // No permitir editar cotizaciones aceptadas o firmadas
    if (existing.status === 'accepted' && existing.signedAt) {
      throw new ApiError('No se puede editar una cotización ya aceptada y firmada', 409)
    }

    const body = await req.json()
    const parsed = UpdateQuoteSchema.safeParse(body)
    if (!parsed.success) {
      throw new ApiError(parsed.error.errors[0]?.message ?? 'Datos inválidos', 400)
    }

    const { lineItems, tax, validUntil, clientId, eventId, ...rest } = parsed.data

    // Recalcular totales si cambian los line items
    let subtotal = Number(existing.subtotal)
    let taxAmount = Number(existing.tax)
    let total = Number(existing.total)

    if (lineItems) {
      subtotal = lineItems.reduce((sum, item) => sum + item.total, 0)
      taxAmount = tax ?? taxAmount
      total = subtotal + taxAmount
    } else if (tax !== undefined) {
      taxAmount = tax
      total = subtotal + taxAmount
    }

    const updated = await prisma.quote.update({
      where: { id: params.id },
      data: {
        ...rest,
        ...(lineItems && { lineItems: lineItems as Prisma.InputJsonValue }),
        ...(lineItems && { subtotal, tax: taxAmount, total }),
        ...(tax !== undefined && !lineItems && { tax: taxAmount, total }),
        ...(validUntil !== undefined && { validUntil: validUntil ? new Date(validUntil) : null }),
        ...(clientId !== undefined && { clientId: clientId ?? null }),
        ...(eventId !== undefined && { eventId: eventId ?? null }),
      },
      include: {
        client: { select: { id: true, name: true } },
        event: { select: { id: true, title: true } },
      },
    })

    // Registrar contacto cuando se envía la cotización al cliente
    const newStatus = parsed.data.status
    if (newStatus === 'sent' && newStatus !== existing.status && updated.clientId) {
      prisma.client.update({
        where: { id: updated.clientId },
        data: { lastContact: new Date() },
      }).catch(() => {})
    }

    // Email de notificación cuando cambia el status (fire-and-forget)
    if (newStatus && newStatus !== existing.status && artistEmail) {
      sendQuoteNotification({
        toEmail: artistEmail,
        toName: artist.name,
        quoteId: updated.id,
        quoteNumber: updated.quoteNumber,
        clientName: updated.client?.name ?? null,
        total: updated.total.toString(),
        currency: updated.currency,
        newStatus,
      })
    }

    return Response.json({
      data: {
        ...updated,
        subtotal: updated.subtotal.toString(),
        tax: updated.tax.toString(),
        total: updated.total.toString(),
        validUntil: updated.validUntil?.toISOString() ?? null,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
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
    const quote = await getOwnedQuote(params.id, artist.id)

    if (quote.status === 'accepted') {
      throw new ApiError('No se puede eliminar una cotización aceptada', 409)
    }

    await prisma.quote.delete({ where: { id: params.id } })
    return new Response(null, { status: 204 })
  } catch (err) {
    return handleApiError(err)
  }
}
