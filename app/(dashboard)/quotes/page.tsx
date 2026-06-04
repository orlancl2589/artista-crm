import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Cotizaciones' }

export default function CotizacionesPage() {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="flex items-center gap-3 mb-8 pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <span className="text-2xl">📄</span>
        <div>
          <h1 className="text-[17px] font-bold" style={{ color: 'var(--text)' }}>Cotizaciones</h1>
          <p className="font-mono text-[11px] mt-[2px]" style={{ color: 'var(--muted2)' }}>Genera y gestiona cotizaciones</p>
        </div>
      </div>
      <div className="rounded-[var(--radius-lg)] p-10 text-center" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
        <div className="text-4xl mb-3">📄</div>
        <h2 className="text-[15px] font-bold mb-2" style={{ color: 'var(--text)' }}>Módulo en construcción</h2>
        <p className="text-[13px]" style={{ color: 'var(--muted2)' }}>Este módulo se implementará en la siguiente fase.</p>
      </div>
    </div>
  )
}
