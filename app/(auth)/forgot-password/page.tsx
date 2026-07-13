'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function ForgotPasswordPage() {
  const supabase = createClientComponentClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)
    if (error) {
      setError('No pudimos enviar el correo. Verifica tu email e intenta de nuevo.')
    } else {
      setSent(true)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: 'var(--radius)',
    background: 'var(--bg3)', border: '1px solid var(--border2)',
    color: 'var(--text)', fontSize: '13px', outline: 'none',
  }

  return (
    <div className="w-full max-w-[400px]">
      <div className="flex items-center gap-3 mb-8">
        <div style={{ background: 'var(--accent)' }} className="w-9 h-9 rounded-[8px] flex items-center justify-center text-bg font-bold text-lg">
          🎵
        </div>
        <div>
          <div className="font-bold text-[15px] leading-tight" style={{ color: 'var(--text)' }}>Artista CRM</div>
          <div className="font-mono text-[10px] tracking-wide" style={{ color: 'var(--muted2)' }}>Recuperar contraseña</div>
        </div>
      </div>

      <div className="rounded-xl p-7 border" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
        {sent ? (
          <div className="flex flex-col items-center gap-4 text-center py-4">
            <div className="text-[40px]">📬</div>
            <div>
              <h2 className="text-[16px] font-bold mb-1" style={{ color: 'var(--text)' }}>Revisa tu correo</h2>
              <p className="text-[13px]" style={{ color: 'var(--muted2)' }}>
                Enviamos un enlace de recuperación a <strong>{email}</strong>. Puede tardar unos minutos.
              </p>
            </div>
            <Link href="/login" className="text-[13px] font-medium" style={{ color: 'var(--accent)' }}>
              Volver al login
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-extrabold mb-1" style={{ color: 'var(--text)' }}>
              ¿Olvidaste tu contraseña?
            </h1>
            <p className="font-mono text-[12px] mb-6" style={{ color: 'var(--muted2)' }}>
              Te enviamos un enlace para recuperarla
            </p>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block font-mono text-[11px] font-semibold uppercase tracking-wide mb-[6px]" style={{ color: 'var(--muted2)' }}>
                  Email
                </label>
                <input
                  type="email" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@email.com" style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--border2)')}
                />
              </div>
              {error && (
                <div className="rounded-[var(--radius)] px-4 py-3 mb-4 text-[12px] font-mono"
                  style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {error}
                </div>
              )}
              <button type="submit" disabled={loading}
                className="w-full rounded-[var(--radius)] py-[10px] text-[13px] font-bold disabled:opacity-50"
                style={{ background: 'var(--accent)', color: 'var(--bg)' }}
              >
                {loading ? 'Enviando...' : 'Enviar enlace'}
              </button>
            </form>
          </>
        )}
      </div>

      <p className="text-center mt-5 text-[13px]" style={{ color: 'var(--muted2)' }}>
        <Link href="/login" className="font-semibold" style={{ color: 'var(--accent)' }}>
          ← Volver al login
        </Link>
      </p>
    </div>
  )
}