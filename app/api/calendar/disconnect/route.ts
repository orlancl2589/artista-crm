import { requireArtist } from '@/lib/auth/require-artist'
import { revokeGoogleCalendar } from '@/lib/integrations/google-calendar'
import { handleApiError } from '@/lib/utils/api-error'

export async function POST() {
  try {
    const artist = await requireArtist()
    await revokeGoogleCalendar(artist.id)
    return Response.json({ ok: true })
  } catch (err) {
    return handleApiError(err)
  }
}