'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const ARTIST_TYPES = [
  { value: 'dj', label: '🎧 DJ' },
  { value: 'band', label: '🎸 Banda' },
  { value: 'soloist', label: '🎤 Solista' },
  { value: 'mariachi', label: '🎺 Mariachi/Trío' },
  { value: 'agency', label: '🏢 Agencia' },
] as const

type ArtistType = (typeof ARTIST_TYPES)[number]['value']

export default function RegisterPage() {
  const supabase = createClientComponentClient()

  const [artistType, setArtistType] = useState<ArtistType>('dj')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'form' | 'verify'>('form')

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { artist_name: name, artist_type: artistType },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setStep('verify')
    setLoading(false)
  }

  if (step === 'verify') {
    return (
      <div className="w-full max-w-[400px]">
        <div
          className="rounded-xl p-8 border text-center"
          style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}
        >
          <div className="text-4xl mb-4">📬</div>
          <h1 className="text-xl font-extrabold mb-2" style={{ color: 'var(--text)' }}>
            Revisa tu email
          </h1>
          <p className="text-[13px] mb-1" style={{ color: 'var(--muted2)' }}>
            Enviamos un link de verificación a
          </p>
          <p className="font-mono text-[13px] font-semibold mb-5" style={{ color: 'var(--accent)' }}>
            {email}
          </p>
          <p className="text-[12px]" style={{ color: 'var(--muted2)' }}>
            Haz clic en el link para activar tu cuenta y comenzar.
          </p>
        </div>
        <p className="text-center mt-5 text-[13px]" style={{ color: 'var(--muted2)' }}>
          ¿Ya verificaste?{' '}
          <Link href="/login" className="font-semibold" style={{ color: 'var(--accent)' }}>
            Iniciar sesión
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[440px]">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div
          style={{ background: 'var(--accent)' }}
          className="w-9 h-9 rounded-[8px] flex items-center justify-center text-bg font-bold text-lg"
        >
          🎵
        </div>
        <div>
          <div className="font-bold text-[15px] leading-tight" style={{ color: 'var(--text)' }}>
            Artista CRM
          </div>
          <div className="font-mono text-[10px] tracking-wide" style={{ color: 'var(--muted2)' }}>
            Crea tu cuenta gratis
          </div>
        </div>
      </div>

      <div
        className="rounded-xl p-7 border"
        style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}
      >
        <h1 className="text-xl font-extrabold mb-1" style={{ color: 'var(--text)' }}>
          Crear cuenta
        </h1>
        <p className="font-mono text-[12px] mb-6" style={{ color: 'var(--muted2)' }}>
          Plan Free — sin tarjeta de crédito
        </p>

        <form onSubmit={handleRegister} noValidate>
          {/* Tipo de artista */}
          <div className="mb-5">
            <div
              className="font-mono text-[11px] font-semibold uppercase tracking-wide mb-2"
              style={{ color: 'var(--muted2)' }}
            >
              ¿Qué eres?
            </div>
            <div className="flex flex-wrap gap-2">
              {ARTIST_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setArtistType(type.value)}
                  className="px-3 py-[6px] rounded-[20px] text-[12px] font-semibold transition-all duration-150 border"
                  style={{
                    background:
                      artistType === type.value ? 'rgba(200,255,0,0.08)' : 'transparent',
                    borderColor:
                      artistType === type.value ? 'var(--accent)' : 'var(--border)',
                    color:
                      artistType === type.value ? 'var(--accent)' : 'var(--muted2)',
                    fontFamily: 'var(--font-syne)',
                  }}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Nombre artístico */}
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block font-mono text-[11px] font-semibold uppercase tracking-wide mb-[6px]"
              style={{ color: 'var(--muted2)' }}
            >
              Nombre artístico
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="DJ Kross / Banda XYZ"
              className="w-full rounded-[var(--radius)] px-4 py-[10px] text-[13px] outline-none transition-colors duration-150"
              style={{
                background: 'var(--bg3)',
                border: '1px solid var(--border2)',
                color: 'var(--text)',
                fontFamily: 'var(--font-syne)',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border2)')}
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block font-mono text-[11px] font-semibold uppercase tracking-wide mb-[6px]"
              style={{ color: 'var(--muted2)' }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full rounded-[var(--radius)] px-4 py-[10px] text-[13px] outline-none transition-colors duration-150"
              style={{
                background: 'var(--bg3)',
                border: '1px solid var(--border2)',
                color: 'var(--text)',
                fontFamily: 'var(--font-syne)',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border2)')}
            />
          </div>

          {/* Password */}
          <div className="mb-5">
            <label
              htmlFor="password"
              className="block font-mono text-[11px] font-semibold uppercase tracking-wide mb-[6px]"
              style={{ color: 'var(--muted2)' }}
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="w-full rounded-[var(--radius)] px-4 py-[10px] text-[13px] outline-none transition-colors duration-150"
              style={{
                background: 'var(--bg3)',
                border: '1px solid var(--border2)',
                color: 'var(--text)',
                fontFamily: 'var(--font-syne)',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border2)')}
            />
          </div>

          {/* Error */}
          {error && (
            <div
              className="rounded-[var(--radius)] px-4 py-3 mb-4 text-[12px] font-mono"
              style={{
                background: 'rgba(239,68,68,0.1)',
                color: 'var(--red)',
                border: '1px solid rgba(239,68,68,0.2)',
              }}
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-[var(--radius)] py-[10px] text-[13px] font-bold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: loading ? 'var(--accent2)' : 'var(--accent)',
              color: 'var(--bg)',
              fontFamily: 'var(--font-syne)',
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = 'var(--accent3)' }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = 'var(--accent)' }}
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta gratis →'}
          </button>
        </form>
      </div>

      <p className="text-center mt-5 text-[13px]" style={{ color: 'var(--muted2)' }}>
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="font-semibold" style={{ color: 'var(--accent)' }}>
          Iniciar sesión
        </Link>
      </p>
    </div>
  )
}
