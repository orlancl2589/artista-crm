import { NextRequest } from 'next/server'
import { requireArtist } from '@/lib/auth/require-artist'
import { exchangeCodeForTokens, saveGoogleTokens } from '@/lib/integrations/google-calendar'

export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const { searchParams } = req.nextUrl
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return Response.redirect(`${appUrl}/settings?cal=error`)
  }

  try {
    const artist = await requireArtist()
    const tokens = await exchangeCodeForTokens(code)

    if (!tokens.refresh_token) {
      // Ocurre cuando Google no devuelve refresh_token (ya autorizado antes).
      // Redirect con error para que el usuario desconecte y vuelva a conectar.
      return Response.redirect(`${appUrl}/settings?cal=no_refresh_token`)
    }

    await saveGoogleTokens(artist.id, tokens.refresh_token)
    return Response.redirect(`${appUrl}/settings?cal=connected`)
  } catch {
    return Response.redirect(`${appUrl}/settings?cal=error`)
  }
}