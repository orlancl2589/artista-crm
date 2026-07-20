import { requireArtist } from '@/lib/auth/require-artist'
import { getGoogleAuthUrl } from '@/lib/integrations/google-calendar'
import { handleApiError } from '@/lib/utils/api-error'

export async function GET() {
  try {
    await requireArtist() // verifica que el usuario esté autenticado
    const url = getGoogleAuthUrl()
    return Response.redirect(url)
  } catch (err) {
    return handleApiError(err)
  }
}