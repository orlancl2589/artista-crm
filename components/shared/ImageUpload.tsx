'use client'

import { useRef, useState } from 'react'

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

    try {
      const form = new FormData()
      form.append('file', file)
      form.append('path', path)

      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? 'Error al subir imagen')
        setPreview(currentUrl)
        return
      }

      // add cache-busting so browser reloads new image
      const publicUrl = `${json.url}?t=${Date.now()}`
      await onUploaded(publicUrl)
      setPreview(publicUrl)
    } catch {
      setError('Error de conexión')
      setPreview(currentUrl)
    } finally {
      setUploading(false)
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
          padding: 0,
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

        {/* Overlay */}
        <span
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            color: '#fff',
            fontWeight: 600,
            opacity: uploading ? 1 : 0,
            transition: 'opacity 0.15s',
            pointerEvents: 'none',
          }}
          className="hover-overlay"
        >
          {uploading ? '...' : '✏️'}
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
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