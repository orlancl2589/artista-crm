import { requireArtist } from '@/lib/auth/require-artist'
import { handleApiError } from '@/lib/utils/api-error'

export async function GET() {
  try {
    const artist = await requireArtist()
    return Response.json({ connected: !!artist.googleRefreshToken })
  } catch (err) {
    return handleApiError(err)
  }
}