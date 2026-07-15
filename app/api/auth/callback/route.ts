import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Sincroniza nombre y tipo del artista desde los metadatos del registro
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const artistName = user.user_metadata?.artist_name as string | undefined
        const artistType = user.user_metadata?.artist_type as string | undefined
        if (artistName) {
          await prisma.artist.updateMany({
            where: { userId: user.id },
            data: {
              name: artistName,
              ...(artistType && { artistType: artistType as 'dj' | 'band' | 'soloist' | 'mariachi' | 'agency' }),
            },
          }).catch(() => {})
        }
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
