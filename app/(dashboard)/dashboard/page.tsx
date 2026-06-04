import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard' }

export default function DashboardPage() {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Topbar */}
      <div
        className="flex items-center justify-between mb-6 pb-5"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div>
          <h1 className="text-[17px] font-bold" style={{ color: 'var(--text)' }}>
            Dashboard
          </h1>
          <p className="font-mono text-[11px] mt-[2px]" style={{ color: 'var(--muted2)' }}>
            Resumen de tu actividad
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="px-[14px] py-2 rounded-[var(--radius)] text-[12px] font-semibold border transition-all duration-150"
            style={{
              background: 'transparent',
              borderColor: 'var(--border2)',
              color: 'var(--text2)',
              fontFamily: 'var(--font-syne)',
            }}
          >
            + Evento
          </button>
          <button
            className="px-[14px] py-2 rounded-[var(--radius)] text-[12px] font-semibold transition-all duration-150"
            style={{
              background: 'var(--accent)',
              color: 'var(--bg)',
              fontFamily: 'var(--font-syne)',
            }}
          >
            + Cliente
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-[14px] mb-6">
        {[
          { label: 'Ingresos / Mes', value: '$0', delta: null, color: 'green' },
          { label: 'Eventos este mes', value: '0', delta: null, color: 'blue' },
          { label: 'Clientes activos', value: '0', delta: null, color: 'purple' },
          { label: 'Tasa conversión', value: '0%', delta: null, color: 'orange' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-[var(--radius-lg)] p-[18px] relative overflow-hidden transition-all duration-200"
            style={{
              background: 'var(--bg2)',
              border: '1px solid var(--border)',
            }}
          >
            <div
              className="font-mono text-[10px] uppercase tracking-[0.8px] mb-2"
              style={{ color: 'var(--muted2)' }}
            >
              {stat.label}
            </div>
            <div
              className="text-[26px] font-extrabold leading-none"
              style={{ color: stat.label === 'Ingresos / Mes' ? 'var(--accent)' : 'var(--text)' }}
            >
              {stat.value}
            </div>
            <div
              className="font-mono text-[11px] mt-[6px]"
              style={{ color: 'var(--muted2)' }}
            >
              Comenzando...
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      <div
        className="rounded-[var(--radius-lg)] p-10 text-center"
        style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
      >
        <div className="text-4xl mb-3">🎵</div>
        <h2 className="text-[16px] font-bold mb-2" style={{ color: 'var(--text)' }}>
          Bienvenido a Artista CRM
        </h2>
        <p className="text-[13px] mb-5 max-w-md mx-auto" style={{ color: 'var(--muted2)' }}>
          Tu dashboard estará lleno de datos cuando empieces a agregar clientes y eventos.
          Comienza por crear tu primer cliente.
        </p>
        <button
          className="px-5 py-[10px] rounded-[var(--radius)] text-[13px] font-bold transition-all duration-150"
          style={{
            background: 'var(--accent)',
            color: 'var(--bg)',
            fontFamily: 'var(--font-syne)',
          }}
        >
          + Agregar primer cliente
        </button>
      </div>
    </div>
  )
}
