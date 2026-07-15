import type { Metadata } from 'next'
import ComingSoon from '@/components/ui/ComingSoon'

export const metadata: Metadata = { title: 'Campañas — R-TIST' }

export default function CampañasAdsPage() {
  return (
    <ComingSoon
      icon="📣"
      title="Campañas publicitarias"
      description="Crea y gestiona campañas de Facebook Ads y Google Ads directamente desde el CRM, enfocadas en captar nuevos clientes."
      eta="Fase 5 — Marketing integrado"
    />
  )
}
