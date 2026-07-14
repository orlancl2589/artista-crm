import { NextRequest } from 'next/server'
import { requireArtist } from '@/lib/auth/require-artist'
import { prisma } from '@/lib/db/prisma'
import { handleApiError, ApiError } from '@/lib/utils/api-error'
import { z } from 'zod'
import type { Prisma } from '@prisma/client'

const UpdateProfileSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  tagline: z.string().max(160).optional().nullable(),
  bio: z.string().max(1000).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  basePrice: z.number().min(0).optional().nullable(),
  currency: z.enum(['MXN', 'USD']).optional(),
  experienceYears: z.number().int().min(0).max(99).optional().nullable(),
  whatsappNumber: z.string().max(20).optional().nullable(),
  artistType: z.enum(['dj', 'band', 'mariachi', 'soloist', 'agency', 'other']).optional(),
  logoUrl: z.string().url().optional().nullable(),
})

export async function PATCH(req: NextRequest) {
  try {
    const artist = await requireArtist()
    const body = await req.json()
    const parsed = UpdateProfileSchema.safeParse(body)
    if (!parsed.success) {
      throw new ApiError(parsed.error.errors[0]?.message ?? 'Datos inválidos', 400)
    }

    const { basePrice, artistType, ...rest } = parsed.data

    const data: Prisma.ArtistUpdateInput = {
      ...rest,
      basePrice: basePrice ?? null,
      ...(artistType && { artistType: artistType as Prisma.EnumArtistTypeFieldUpdateOperationsInput['set'] }),
    }

    const updated = await prisma.artist.update({
      where: { id: artist.id },
      data,
    })

    return Response.json({
      data: {
        ...updated,
        basePrice: updated.basePrice?.toString() ?? null,
        rating: updated.rating?.toString() ?? null,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    })
  } catch (err) {
    return handleApiError(err)
  }
}
