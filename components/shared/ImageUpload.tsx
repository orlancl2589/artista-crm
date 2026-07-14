'use client'

import { useRef, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface Props {
  currentUrl: string | null
  storagePath: string        // e.g. "logos/cuid" — filename will be appended
  onUploaded: (url: string) => Promise<void>
  shape?: 'circle' | 'rounded'
  size?: number
  placeholder?: string       // emoji or text shown when no image
  label?: string
}

export default function ImageUpload({
  currentUrl,
  storagePath,
  onUploaded,
  shape = 'circle',
  size = 80,
  placeholder = '📷',
  label,
}: Props) {
  const supabase = createClientComponentClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<string | null>(currentUrl)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Máximo 5 MB')
      return
    }

    setError('')
    setUploading(true)

    // optimistic local preview
    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)

    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${storagePath}/photo.${ext}`

    const { error: upErr } = await supabase.storage
      .from('uploads')
      .upload(path, file, { upsert: true, contentType: file.type })

    if (upErr) {
      setError('Error al subir imagen')
      setPreview(currentUrl)
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from('uploads').getPublicUrl(path)
    // add cache-busting param so the browser reloads the new image
    const publicUrl = `${data.publicUrl}?t=${Date.now()}`

    try {
      await onUploaded(publicUrl)
      setPreview(publicUrl)
    } catch {
      setError('Error al guardar')
    } finally {
      setUploading(false)
      // reset input so same file can be re-selected
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const radius = shape === 'circle' ? '50%' : '10px'

  return (
    <div className="flex flex-col items-center gap-2">
      {label && (
        <span className="text-[11px] font-medium" style={{ color: 'var(--muted2)' }}>
          {label}
        </span>
      )}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        title="Cambiar imagen"
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          background: 'var(--bg3)',
          border: '2px dashed var(--border)',
          cursor: uploading ? 'wait' : 'pointer',
          overflow: 'hidden',
          position: 'relative',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'border-color 0.15s',
        }}
        onMouseEnter={(e) => { if (!uploading) e.currentTarget.style.borderColor = 'var(--accent)' }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Imagen"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span style={{ fontSize: size * 0.35 }}>{placeholder}</span>
        )}
        {/* overlay on hover */}
        <span
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            color: '#fff',
            fontWeight: 600,
            opacity: uploading ? 1 : 0,
            transition: 'opacity 0.15s',
          }}
          className="hover:opacity-100"
        >
          {uploading ? '...' : '✏️'}
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      {error && (
        <span className="text-[11px]" style={{ color: '#ef4444' }}>
          {error}
        </span>
      )}
    </div>
  )
}