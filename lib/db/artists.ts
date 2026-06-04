import { prisma } from './prisma'
import type { Artist } from '@prisma/client'

export async function getArtistFromSession(userId: string): Promise<Artist | null> {
  return prisma.artist.findUnique({ where: { userId } })
}

export async function getArtistBySlug(slug: string): Promise<Artist | null> {
  return prisma.artist.findUnique({ where: { slug } })
}
