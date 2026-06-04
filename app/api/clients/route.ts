import { NextRequest } from 'next/server'
import { requireArtist } from '@/lib/auth/require-artist'
import { prisma } from '@/lib/db/prisma'
import { withRateLimit, rateLimiters } from '@/lib/security/rate-limit'
import { handleApiError, ApiError } from '@/lib/utils/api-error'
import { encrypt, decrypt } from '@/lib/security/encrypt'
import { normalizePhone } from '@/lib/utils/phone'
import { CreateClientSchema } from '@/lib/validations/client.schema'
import type { Prisma } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const limited = await withRateLimit(req, rateLimiters.api)
    if (limited) return limited

    const artist = await requireArtist()

    const { searchParams } = req.nextUrl
    const search = searchParams.get('search')?.trim() ?? ''
    const channel = searchParams.get('channel') ?? ''
    const tag = searchParams.get('tag') ?? ''
    const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
    const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') ?? '20')))
    const skip = (page - 1) * limit

    const where: Prisma.ClientWhereInput = {
      artistId: artist.id,
      isActive: true,
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
      ...(channel && { preferredChannel: channel as 'whatsapp' | 'instagram' | 'facebook' }),
      ...(tag && { tags: { has: tag } }),
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        orderBy: [{ lastContact: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }],
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          birthdate: true,
          preferredChannel: true,
          tags: true,
          notes: true,
          isActive: true,
          totalSpent: true,
          totalEvents: true,
          lastContact: true,
          createdAt: true,
        },
      }),
      prisma.client.count({ where }),
    ])

    const decrypted = clients.map((c) => ({
      ...c,
      phone: decrypt(c.phone),
      totalSpent: c.totalSpent.toString(),
    }))

    return Response.json({
      data: decrypted,
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
    const parsed = CreateClientSchema.safeParse(body)
    if (!parsed.success) {
      throw new ApiError(parsed.error.errors[0]?.message ?? 'Datos inválidos', 400)
    }

    const { phone, email, birthdate, ...rest } = parsed.data

    const existing = await prisma.client.findFirst({
      where: { artistId: artist.id, phone: encrypt(normalizePhone(phone)) },
    })
    if (existing) throw new ApiError('Ya existe un cliente con ese teléfono', 409)

    const client = await prisma.client.create({
      data: {
        ...rest,
        artistId: artist.id,
        phone: encrypt(normalizePhone(phone)),
        email: email || null,
        birthdate: birthdate ? new Date(birthdate) : null,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        preferredChannel: true,
        tags: true,
        createdAt: true,
      },
    })

    return Response.json({ data: { ...client, phone: decrypt(client.phone) } }, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
