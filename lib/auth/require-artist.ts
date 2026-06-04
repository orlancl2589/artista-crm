import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getArtistFromSession } from '@/lib/db/artists'
import { ApiError } from '@/lib/utils/api-error'
import type { Artist } from '@prisma/client'

export async function requireArtist(): Promise<Artist> {
  const supabase = createRouteHandlerClient({ cookies })
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new ApiError('No autenticado', 401)

  const artist = await getArtistFromSession(user.id)
  if (!artist) throw new ApiError('Perfil de artista no encontrado', 404)

  return artist
}
