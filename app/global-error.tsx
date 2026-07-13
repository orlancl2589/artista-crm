'use client'

import { useEffect } from 'react'

export default function GlobalError({
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
    <html lang="es">
      <body style={{ background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', margin: 0, fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center', padding: '40px', background: '#141414', border: '1px solid #222', borderRadius: '16px', maxWidth: '400px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>Error inesperado</h2>
          <p style={{ color: '#666', fontSize: '13px', marginBottom: '24px', lineHeight: 1.6 }}>
            La aplicación encontró un error crítico. Por favor recarga la página.
          </p>
          <button
            onClick={reset}
            style={{ background: '#c8ff00', color: '#000', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
          >
            Recargar
          </button>
        </div>
      </body>
    </html>
  )
}
