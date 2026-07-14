import { NextRequest } from 'next/server'
import { requireArtist } from '@/lib/auth/require-artist'
import { prisma } from '@/lib/db/prisma'
import { withRateLimit, rateLimiters } from '@/lib/security/rate-limit'
import { handleApiError, ApiError } from '@/lib/utils/api-error'
import { encrypt, decrypt } from '@/lib/security/encrypt'
import { normalizePhone } from '@/lib/utils/phone'
import { UpdateClientSchema } from '@/lib/validations/client.schema'

async function getOwnedClient(clientId: string, artistId: string) {
  const client = await prisma.client.findUnique({ where: { id: clientId } })
  if (!client) throw new ApiError('Cliente no encontrado', 404)
  if (client.artistId !== artistId) throw new ApiError('Sin autorización', 403)
  return client
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const limited = await withRateLimit(req, rateLimiters.api)
    if (limited) return limited

    const artist = await requireArtist()
    const client = await getOwnedClient(params.id, artist.id)

    return Response.json({
      data: {
        ...client,
        phone: decrypt(client.phone),
        totalSpent: client.totalSpent.toString(),
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
    await getOwnedClient(params.id, artist.id)

    const body = await req.json()
    const parsed = UpdateClientSchema.safeParse(body)
    if (!parsed.success) {
      throw new ApiError(parsed.error.errors[0]?.message ?? 'Datos inválidos', 400)
    }

    const { phone, email, birthdate, photoUrl, ...rest } = parsed.data

    const updated = await prisma.client.update({
      where: { id: params.id },
      data: {
        ...rest,
        ...(phone && { phone: encrypt(normalizePhone(phone)) }),
        ...(email !== undefined && { email: email || null }),
        ...(birthdate !== undefined && { birthdate: birthdate ? new Date(birthdate) : null }),
        ...(photoUrl !== undefined && { photoUrl }),
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        preferredChannel: true,
        tags: true,
        notes: true,
        isActive: true,
        photoUrl: true,
        updatedAt: true,
      },
    })

    return Response.json({ data: { ...updated, phone: decrypt(updated.phone) } })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const limited = await withRateLimit(req, rateLimiters.api)
    if (limited) return limited

    const artist = await requireArtist()
    await getOwnedClient(params.id, artist.id)

    // Soft delete — preserva historial de eventos y cotizaciones
    await prisma.client.update({
      where: { id: params.id },
      data: { isActive: false },
    })

    return new Response(null, { status: 204 })
  } catch (err) {
    return handleApiError(err)
  }
}
