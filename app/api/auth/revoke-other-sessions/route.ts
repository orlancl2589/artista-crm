import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

export async function POST(_req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return Response.json({ error: 'No session' }, { status: 401 })

    // Admin client con service role para revocar otras sesiones
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Revoca todos los refresh tokens del usuario EXCEPTO el de la sesión actual
    await admin.auth.admin.signOut(session.access_token, 'others')

    return Response.json({ ok: true })
  } catch {
    // No bloquear el login si falla la revocación
    return Response.json({ ok: true })
  }
}