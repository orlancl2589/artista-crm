import type { Metadata } from 'next'
import ComingSoon from '@/components/ui/ComingSoon'

export const metadata: Metadata = { title: 'Analytics — R-TIST' }

export default function AnalyticsPage() {
  return (
    <ComingSoon
      icon="📊"
      title="Analytics e ingresos"
      description="Visualiza tus ingresos por mes, tipo de evento y cliente. Descubre qué servicios te generan más y proyecta tus ganancias."
      eta="Fase 2 — Reportes avanzados"
    />
  )
}
