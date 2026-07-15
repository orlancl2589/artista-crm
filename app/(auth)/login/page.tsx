'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
export default function LoginPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email o contraseña incorrectos.')
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="w-full max-w-[400px]">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-[44px] h-[34px] rounded-[8px] overflow-hidden flex-shrink-0">
          <Image src="/Logo.png" alt="R-TIST" width={44} height={34} className="w-full h-full object-contain" />
        </div>
        <div>
          <div className="font-bold text-[15px] leading-tight" style={{ color: 'var(--text)' }}>
            R-TIST
          </div>
          <div
            className="font-mono text-[10px] tracking-wide"
            style={{ color: 'var(--muted2)', letterSpacing: '0.5px' }}
          >
            v1.0 · beta
          </div>
        </div>
      </div>

      {/* Card */}
      <div
        className="rounded-xl p-7 border"
        style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}
      >
        <h1 className="text-xl font-extrabold mb-1" style={{ color: 'var(--text)' }}>
          Iniciar sesión
        </h1>
        <p className="font-mono text-[12px] mb-6" style={{ color: 'var(--muted2)' }}>
          Accede a tu panel de artista
        </p>

        <form onSubmit={handleLogin} noValidate>
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
            <div className="flex justify-between items-center mb-[6px]">
              <label
                htmlFor="password"
                className="font-mono text-[11px] font-semibold uppercase tracking-wide"
                style={{ color: 'var(--muted2)' }}
              >
                Contraseña
              </label>
              <Link
                href="/forgot-password"
                className="font-mono text-[11px] transition-colors"
                style={{ color: 'var(--muted2)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted2)')}
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
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
              style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.2)' }}
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
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>

      {/* Register link */}
      <p className="text-center mt-5 text-[13px]" style={{ color: 'var(--muted2)' }}>
        ¿No tienes cuenta?{' '}
        <Link href="/register" className="font-semibold" style={{ color: 'var(--accent)' }}>
          Regístrate gratis
        </Link>
      </p>
      <p className="text-center mt-3 text-[11px]" style={{ color: 'var(--muted)' }}>
        <Link href="/terms" className="hover:underline">Términos</Link>
        {' · '}
        <Link href="/privacy" className="hover:underline">Privacidad</Link>
      </p>
    </div>
  )
}
