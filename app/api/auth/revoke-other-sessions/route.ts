import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const access_token: string | undefined = body.access_token
    if (!access_token) return Response.json({ error: 'No token' }, { status: 401 })

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    await admin.auth.admin.signOut(access_token, 'others')
    return Response.json({ ok: true })
  } catch {
    return Response.json({ ok: true })
  }
}