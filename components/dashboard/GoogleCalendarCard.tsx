'use client'

import { useState, useEffect } from 'react'

export default function GoogleCalendarCard() {
  const [connected, setConnected] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  useEffect(() => {
    fetch('/api/calendar/status')
      .then((r) => r.json())
      .then((d) => setConnected(d.connected))
      .catch(() => setConnected(false))

    // Leer parámetro ?cal= de la URL para mostrar feedback post-OAuth
    const params = new URLSearchParams(window.location.search)
    const cal = params.get('cal')
    if (cal === 'connected') {
      setMessage({ type: 'ok', text: 'Google Calendar conectado correctamente.' })
      setConnected(true)
    } else if (cal === 'error') {
      setMessage({ type: 'err', text: 'Error al conectar. Intenta de nuevo.' })
    } else if (cal === 'no_refresh_token') {
      setMessage({
        type: 'err',
        text: 'Google no devolvió el token. Desconecta tu cuenta en Google y vuelve a intentar.',
      })
    }
    // Limpiar el parámetro de la URL
    if (cal) {
      const url = new URL(window.location.href)
      url.searchParams.delete('cal')
      window.history.replaceState({}, '', url.toString())
    }
  }, [])

  async function handleDisconnect() {
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/calendar/disconnect', { method: 'POST' })
      if (res.ok) {
        setConnected(false)
        setMessage({ type: 'ok', text: 'Google Calendar desconectado.' })
      } else {
        setMessage({ type: 'err', text: 'Error al desconectar.' })
      }
    } catch {
      setMessage({ type: 'err', text: 'Error de red. Intenta de nuevo.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="rounded-xl p-5 border"
      style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
          style={{ background: 'var(--bg3)' }}
        >
          📅
        </div>
        <div>
          <div className="font-bold text-[14px]" style={{ color: 'var(--text)' }}>
            Google Calendar
          </div>
          <div className="font-mono text-[11px]" style={{ color: 'var(--muted2)' }}>
            Sincroniza eventos automáticamente
          </div>
        </div>
        {/* Badge de estado */}
        <div className="ml-auto">
          {connected === null ? (
            <span className="font-mono text-[11px]" style={{ color: 'var(--muted)' }}>
              cargando…
            </span>
          ) : connected ? (
            <span
              className="font-mono text-[11px] px-2 py-[3px] rounded-full"
              style={{ background: 'rgba(74,222,128,0.12)', color: '#4ade80' }}
            >
              ● Conectado
            </span>
          ) : (
            <span
              className="font-mono text-[11px] px-2 py-[3px] rounded-full"
              style={{ background: 'rgba(136,136,136,0.12)', color: 'var(--muted2)' }}
            >
              ○ No conectado
            </span>
          )}
        </div>
      </div>

      {/* Descripción */}
      <p className="text-[13px] mb-4 leading-relaxed" style={{ color: 'var(--muted2)' }}>
        Al conectar tu cuenta de Google, los eventos que crees en R-TIST aparecerán
        automáticamente en tu Google Calendar. Los cambios y cancelaciones también
        se sincronizan.
      </p>

      {/* Mensaje de feedback */}
      {message && (
        <div
          className="rounded-lg px-3 py-2 mb-4 text-[12px] font-mono"
          style={{
            background: message.type === 'ok' ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.1)',
            color: message.type === 'ok' ? '#4ade80' : 'var(--red)',
            border: `1px solid ${message.type === 'ok' ? 'rgba(74,222,128,0.2)' : 'rgba(239,68,68,0.2)'}`,
          }}
        >
          {message.text}
        </div>
      )}

      {/* Acción */}
      {connected === false && (
        <a
          href="/api/calendar/auth"
          className="inline-flex items-center gap-2 rounded-lg px-4 py-[9px] text-[13px] font-bold transition-all"
          style={{ background: 'var(--accent)', color: 'var(--bg)' }}
        >
          Conectar Google Calendar
        </a>
      )}

      {connected && (
        <button
          onClick={handleDisconnect}
          disabled={loading}
          className="rounded-lg px-4 py-[9px] text-[13px] font-semibold transition-all disabled:opacity-50"
          style={{
            background: 'var(--bg3)',
            color: 'var(--red, #ef4444)',
            border: '1px solid var(--border2)',
          }}
        >
          {loading ? 'Desconectando…' : 'Desconectar'}
        </button>
      )}
    </div>
  )
}