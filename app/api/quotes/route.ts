import { NextRequest } from 'next/server'
import { requireArtist } from '@/lib/auth/require-artist'
import { prisma } from '@/lib/db/prisma'
import { withRateLimit, rateLimiters } from '@/lib/security/rate-limit'
import { handleApiError, ApiError } from '@/lib/utils/api-error'
import { CreateQuoteSchema } from '@/lib/validations/quote.schema'
import type { Prisma } from '@prisma/client'

async function generateQuoteNumber(artistId: string): Promise<string> {
  const count = await prisma.quote.count({ where: { artistId } })
  return `COT-${String(count + 1).padStart(4, '0')}`
}

export async function GET(req: NextRequest) {
  try {
    const limited = await withRateLimit(req, rateLimiters.api)
    if (limited) return limited

    const artist = await requireArtist()
    const { searchParams } = req.nextUrl
    const status = searchParams.get('status') ?? ''
    const clientId = searchParams.get('clientId') ?? ''
    const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
    const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') ?? '20')))
    const skip = (page - 1) * limit

    const where: Prisma.QuoteWhereInput = {
      artistId: artist.id,
      ...(status && { status: status as 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' }),
      ...(clientId && { clientId }),
    }

    const [quotes, total] = await Promise.all([
      prisma.quote.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          quoteNumber: true,
          status: true,
          subtotal: true,
          tax: true,
          total: true,
          currency: true,
          validUntil: true,
          generatedByAI: true,
          createdAt: true,
          client: { select: { id: true, name: true } },
          event: { select: { id: true, title: true } },
        },
      }),
      prisma.quote.count({ where }),
    ])

    return Response.json({
      data: quotes.map((q) => ({
        ...q,
        subtotal: q.subtotal.toString(),
        tax: q.tax.toString(),
        total: q.total.toString(),
        validUntil: q.validUntil?.toISOString() ?? null,
        createdAt: q.createdAt.toISOString(),
      })),
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
    const parsed = CreateQuoteSchema.safeParse(body)
    if (!parsed.success) {
      throw new ApiError(parsed.error.errors[0]?.message ?? 'Datos inválidos', 400)
    }

    const { clientId, eventId, lineItems, tax, validUntil, ...rest } = parsed.data

    // Verificar ownership de cliente y evento
    if (clientId) {
      const client = await prisma.client.findUnique({ where: { id: clientId } })
      if (!client || client.artistId !== artist.id) throw new ApiError('Cliente no válido', 400)
    }
    if (eventId) {
      const event = await prisma.event.findUnique({ where: { id: eventId } })
      if (!event || event.artistId !== artist.id) throw new ApiError('Evento no válido', 400)
    }

    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0)
    const taxAmount = tax ?? 0
    const total = subtotal + taxAmount

    const quoteNumber = await generateQuoteNumber(artist.id)

    const quote = await prisma.quote.create({
      data: {
        ...rest,
        artistId: artist.id,
        clientId: clientId ?? null,
        eventId: eventId ?? null,
        quoteNumber,
        lineItems: lineItems as Prisma.InputJsonValue,
        subtotal,
        tax: taxAmount,
        total,
        validUntil: validUntil ? new Date(validUntil) : null,
      },
      include: {
        client: { select: { id: true, name: true } },
        event: { select: { id: true, title: true } },
      },
    })

    // Registrar contacto al crear cotización
    if (clientId) {
      prisma.client.update({
        where: { id: clientId },
        data: { lastContact: new Date() },
      }).catch(() => {})
    }

    return Response.json(
      {
        data: {
          ...quote,
          subtotal: quote.subtotal.toString(),
          tax: quote.tax.toString(),
          total: quote.total.toString(),
          validUntil: quote.validUntil?.toISOString() ?? null,
          createdAt: quote.createdAt.toISOString(),
          updatedAt: quote.updatedAt.toISOString(),
        },
      },
      { status: 201 }
    )
  } catch (err) {
    return handleApiError(err)
  }
}
