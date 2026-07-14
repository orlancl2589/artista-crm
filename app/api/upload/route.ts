import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireArtist } from '@/lib/auth/require-artist'
import { handleApiError, ApiError } from '@/lib/utils/api-error'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_BYTES = 5 * 1024 * 1024  // 5 MB

// Admin client with service role — bypasses RLS, safe because this is server-only
function adminStorage() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  ).storage
}

export async function POST(req: NextRequest) {
  try {
    await requireArtist()

    const form = await req.formData()
    const file = form.get('file') as File | null
    const path = form.get('path') as string | null

    if (!file || !path) throw new ApiError('Faltan campos: file, path', 400)
    if (!ALLOWED_TYPES.includes(file.type)) throw new ApiError('Tipo de archivo no permitido', 400)
    if (file.size > MAX_BYTES) throw new ApiError('Máximo 5 MB', 400)

    // Sanitize path — only alphanumeric, hyphens, underscores, slashes, dots
    if (!/^[\w\-./]+$/.test(path)) throw new ApiError('Path inválido', 400)

    const buffer = await file.arrayBuffer()
    const { error } = await adminStorage()
      .from('uploads')
      .upload(path, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (error) throw new ApiError(`Error al subir: ${error.message}`, 500)

    const { data } = adminStorage().from('uploads').getPublicUrl(path)

    return Response.json({ url: data.publicUrl })
  } catch (err) {
    return handleApiError(err)
  }
}