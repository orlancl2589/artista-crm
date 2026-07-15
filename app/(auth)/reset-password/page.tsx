'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function ResetPasswordPage() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Las contraseñas no coinciden'); return }
    if (password.length < 8) { setError('Mínimo 8 caracteres'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) {
      setError('No pudimos actualizar tu contraseña. El enlace puede haber expirado.')
    } else {
      router.push('/dashboard')
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
          <div className="font-bold text-[15px] leading-tight" style={{ color: 'var(--text)' }}>R-TIST</div>
          <div className="font-mono text-[10px] tracking-wide" style={{ color: 'var(--muted2)' }}>Nueva contraseña</div>
        </div>
      </div>

      <div className="rounded-xl p-7 border" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
        {!ready ? (
          <div className="text-center py-6">
            <p className="text-[13px]" style={{ color: 'var(--muted2)' }}>Verificando enlace...</p>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-extrabold mb-1" style={{ color: 'var(--text)' }}>Nueva contraseña</h1>
            <p className="font-mono text-[12px] mb-6" style={{ color: 'var(--muted2)' }}>Elige una contraseña segura</p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block font-mono text-[11px] font-semibold uppercase tracking-wide mb-[6px]" style={{ color: 'var(--muted2)' }}>
                  Nueva contraseña
                </label>
                <input type="password" required value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres" style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--border2)')}
                />
              </div>
              <div>
                <label className="block font-mono text-[11px] font-semibold uppercase tracking-wide mb-[6px]" style={{ color: 'var(--muted2)' }}>
                  Confirmar contraseña
                </label>
                <input type="password" required value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repite tu contraseña" style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--border2)')}
                />
              </div>
              {error && (
                <div className="rounded-[var(--radius)] px-4 py-3 text-[12px] font-mono"
                  style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {error}
                </div>
              )}
              <button type="submit" disabled={loading}
                className="w-full rounded-[var(--radius)] py-[10px] text-[13px] font-bold disabled:opacity-50"
                style={{ background: 'var(--accent)', color: 'var(--bg)' }}
              >
                {loading ? 'Guardando...' : 'Guardar contraseña'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}