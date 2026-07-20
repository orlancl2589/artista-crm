import GoogleCalendarCard from '@/components/dashboard/GoogleCalendarCard'

export const metadata = { title: 'Configuración — R-TIST' }

export default function SettingsPage() {
  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[22px] font-extrabold tracking-[-0.5px]" style={{ color: 'var(--text)' }}>
            Configuración
          </h1>
          <p className="font-mono text-[12px] mt-1" style={{ color: 'var(--muted2)' }}>
            Integraciones y preferencias de tu cuenta
          </p>
        </div>

        {/* Sección Integraciones */}
        <div className="mb-2">
          <p
            className="font-mono text-[11px] font-semibold uppercase tracking-wide mb-3"
            style={{ color: 'var(--muted)' }}
          >
            Integraciones
          </p>
          <GoogleCalendarCard />
        </div>
      </div>
    </div>
  )
}