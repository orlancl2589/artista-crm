'use client'

import { useEffect } from 'react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div
        className="flex flex-col items-center gap-4 max-w-[400px] text-center rounded-2xl p-10"
        style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
      >
        <div className="text-[48px] leading-none">⚠️</div>
        <div>
          <h2 className="text-[18px] font-extrabold tracking-[-0.3px] mb-2" style={{ color: 'var(--text)' }}>
            Algo salió mal
          </h2>
          <p className="text-[13px] leading-relaxed" style={{ color: 'var(--muted2)' }}>
            Ocurrió un error inesperado. Puedes intentar recargar la página o volver al dashboard.
          </p>
        </div>
        {error.digest && (
          <code
            className="text-[10px] font-mono px-2 py-1 rounded"
            style={{ background: 'var(--bg3)', color: 'var(--muted2)' }}
          >
            {error.digest}
          </code>
        )}
        <div className="flex gap-3">
          <button
            onClick={reset}
            className="px-4 py-[9px] rounded-[var(--radius)] text-[13px] font-bold hover:opacity-90 transition-opacity"
            style={{ background: 'var(--accent)', color: 'var(--bg)' }}
          >
            Reintentar
          </button>
          <a
            href="/dashboard"
            className="px-4 py-[9px] rounded-[var(--radius)] text-[13px] font-medium"
            style={{ background: 'var(--bg3)', color: 'var(--muted2)', border: '1px solid var(--border)' }}
          >
            Ir al dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
