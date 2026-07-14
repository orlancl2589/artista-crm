import { NextRequest } from 'next/server'
import { requireArtist } from '@/lib/auth/require-artist'
import { prisma } from '@/lib/db/prisma'
import { withRateLimit, rateLimiters } from '@/lib/security/rate-limit'
import { handleApiError, ApiError } from '@/lib/utils/api-error'
import { CreateEventSchema } from '@/lib/validations/event.schema'
import type { Prisma } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const limited = await withRateLimit(req, rateLimiters.api)
    if (limited) return limited

    const artist = await requireArtist()

    const { searchParams } = req.nextUrl
    const status = searchParams.get('status') ?? ''
    const clientId = searchParams.get('clientId') ?? ''
    const month = searchParams.get('month') ?? '' // formato YYYY-MM
    const upcoming = searchParams.get('upcoming') === 'true'
    const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? '20')))
    const skip = (page - 1) * limit

    const where: Prisma.EventWhereInput = {
      artistId: artist.id,
      ...(status && { status: status as 'pending' | 'confirmed' | 'completed' | 'cancelled' }),
      ...(clientId && { clientId }),
      ...(upcoming && { startDate: { gte: new Date() }, status: { not: 'cancelled' } }),
      ...(month && {
        startDate: {
          gte: new Date(`${month}-01T00:00:00`),
          lt: new Date(`${month}-01T00:00:00`),
        },
      }),
    }

    // Si viene mes, ajustar el rango correctamente
    if (month) {
      const [year, m] = month.split('-').map(Number) as [number, number]
      const from = new Date(year, m - 1, 1)
      const to = new Date(year, m, 1)
      where.startDate = { gte: from, lt: to }
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        orderBy: { startDate: upcoming ? 'asc' : 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          eventType: true,
          status: true,
          startDate: true,
          endDate: true,
          timezone: true,
          venue: true,
          city: true,
          price: true,
          paidAmount: true,
          currency: true,
          clientId: true,
          client: { select: { id: true, name: true } },
        },
      }),
      prisma.event.count({ where }),
    ])

    const serialized = events.map((e) => ({
      ...e,
      startDate: e.startDate.toISOString(),
      endDate: e.endDate.toISOString(),
      price: e.price?.toString() ?? null,
      paidAmount: e.paidAmount.toString(),
    }))

    return Response.json({
      data: serialized,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const limited = await withRateLimit(req, rateLimiters.api)
    if (limited) return limited

    const artist = await requireArtist()

    const body = await req.json()
    const parsed = CreateEventSchema.safeParse(body)
    if (!parsed.success) {
      throw new ApiError(parsed.error.errors[0]?.message ?? 'Datos inválidos', 400)
    }

    const { clientId, price, startDate, endDate, ...rest } = parsed.data

    if (new Date(startDate) >= new Date(endDate)) {
      throw new ApiError('La fecha de fin debe ser posterior a la de inicio', 400)
    }

    // Verificar que el clientId pertenece al artista
    if (clientId) {
      const client = await prisma.client.findUnique({ where: { id: clientId } })
      if (!client || client.artistId !== artist.id) {
        throw new ApiError('Cliente no válido', 400)
      }
    }

    const event = await prisma.event.create({
      data: {
        ...rest,
        rider: rest.rider as object ?? null,
        artistId: artist.id,
        clientId: clientId ?? null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        price: price ?? null,
      } as Parameters<typeof prisma.event.create>[0]['data'],
      include: { client: { select: { id: true, name: true } } },
    })

    // Registrar contacto al crear evento para un cliente
    if (clientId) {
      await prisma.client.update({
        where: { id: clientId },
        data: { lastContact: new Date() },
      })
    }

    return Response.json(
      {
        data: {
          ...event,
          startDate: event.startDate.toISOString(),
          endDate: event.endDate.toISOString(),
          price: event.price?.toString() ?? null,
          paidAmount: event.paidAmount.toString(),
        },
      },
      { status: 201 }
    )
  } catch (err) {
    return handleApiError(err)
  }
}
