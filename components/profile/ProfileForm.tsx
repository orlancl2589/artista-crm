'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

const ARTIST_TYPE_LABELS: Record<string, string> = {
  dj: 'DJ', band: 'Banda', mariachi: 'Mariachi',
  soloist: 'Solista', agency: 'Agencia', other: 'Otro',
}

const PLAN_LABELS: Record<string, string> = {
  free: 'Free', starter: 'Starter', pro: 'Pro', agency: 'Agency',
}

interface Artist {
  id: string
  name: string
  slug: string
  artistType: string
  plan: string
  tagline: string | null
  bio: string | null
  location: string | null
  basePrice: string | null
  currency: string
  experienceYears: number | null
  whatsappNumber: string | null
  createdAt: string
  email: string
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: 'var(--radius)',
  background: 'var(--bg3)',
  border: '1px solid var(--border)',
  color: 'var(--text)',
  fontSize: '13px',
  outline: 'none',
}

export default function ProfileForm({ artist }: { artist: Artist }) {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [form, setForm] = useState({
    name: artist.name,
    tagline: artist.tagline ?? '',
    bio: artist.bio ?? '',
    location: artist.location ?? '',
    basePrice: artist.basePrice ?? '',
    currency: artist.currency,
    experienceYears: artist.experienceYears?.toString() ?? '',
    whatsappNumber: artist.whatsappNumber ?? '',
    artistType: artist.artistType,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
    setSaved(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          basePrice: form.basePrice ? Number(form.basePrice) : null,
          experienceYears: form.experienceYears ? Number(form.experienceYears) : null,
          tagline: form.tagline || null,
          bio: form.bio || null,
          location: form.location || null,
          whatsappNumber: form.whatsappNumber || null,
        }),
      })
      if (!res.ok) {
        const json = await res.json()
        setError(json.error ?? 'Error al guardar')
      } else {
        setSaved(true)
        router.refresh()
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="max-w-[680px] flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-extrabold tracking-[-0.5px]" style={{ color: 'var(--text)' }}>
            Mi Perfil
          </h1>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--muted2)' }}>
            {artist.email}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide"
            style={{ background: 'var(--accent)20', color: 'var(--accent)', border: '1px solid var(--accent)40' }}
          >
            {PLAN_LABELS[artist.plan] ?? artist.plan}
          </span>
          <button
            onClick={handleSignOut}
            className="text-[12px] px-3 py-1.5 rounded-[var(--radius)]"
            style={{ background: 'var(--bg3)', color: 'var(--muted2)', border: '1px solid var(--border)' }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Tipo', value: ARTIST_TYPE_LABELS[artist.artistType] ?? artist.artistType },
          { label: 'Slug', value: `@${artist.slug}` },
          { label: 'Miembro desde', value: new Date(artist.createdAt).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }) },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
            <div className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--muted2)' }}>{s.label}</div>
            <div className="text-[14px] font-bold" style={{ color: 'var(--text)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="rounded-xl p-6 flex flex-col gap-4" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
        <h2 className="text-[14px] font-bold" style={{ color: 'var(--text)' }}>Información general</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium" style={{ color: 'var(--muted2)' }}>Nombre artístico *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} required style={inputStyle} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium" style={{ color: 'var(--muted2)' }}>Tipo de artista</label>
            <select value={form.artistType} onChange={e => set('artistType', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              {Object.entries(ARTIST_TYPE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium" style={{ color: 'var(--muted2)' }}>Tagline</label>
          <input value={form.tagline} onChange={e => set('tagline', e.target.value)} placeholder="DJ para bodas y eventos corporativos en CDMX" style={inputStyle} />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium" style={{ color: 'var(--muted2)' }}>Bio</label>
          <textarea
            value={form.bio}
            onChange={e => set('bio', e.target.value)}
            rows={3}
            placeholder="Cuéntale a tus clientes quién eres..."
            style={{ ...inputStyle, resize: 'none' }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium" style={{ color: 'var(--muted2)' }}>Ciudad / Ubicación</label>
            <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="Ciudad de México" style={inputStyle} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium" style={{ color: 'var(--muted2)' }}>Años de experiencia</label>
            <input value={form.experienceYears} onChange={e => set('experienceYears', e.target.value)} type="number" min="0" max="99" placeholder="5" style={inputStyle} />
          </div>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium" style={{ color: 'var(--muted2)' }}>Precio base</label>
            <input value={form.basePrice} onChange={e => set('basePrice', e.target.value)} type="number" min="0" step="500" placeholder="15000" style={inputStyle} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium" style={{ color: 'var(--muted2)' }}>Moneda</label>
            <select value={form.currency} onChange={e => set('currency', e.target.value)} style={{ ...inputStyle, width: '80px', cursor: 'pointer' }}>
              <option value="MXN">MXN</option>
              <option value="USD">USD</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium" style={{ color: 'var(--muted2)' }}>WhatsApp</label>
            <input value={form.whatsappNumber} onChange={e => set('whatsappNumber', e.target.value)} placeholder="+52 55 1234 5678" style={inputStyle} />
          </div>
        </div>

        {error && (
          <div className="text-[12px] px-3 py-2 rounded-[var(--radius)]" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-[9px] rounded-[var(--radius)] text-[13px] font-bold disabled:opacity-50 transition-opacity hover:opacity-90"
            style={{ background: 'var(--accent)', color: 'var(--bg)' }}
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
          {saved && (
            <span className="text-[12px]" style={{ color: '#22c55e' }}>
              ✓ Guardado
            </span>
          )}
        </div>
      </form>
    </div>
  )
}
