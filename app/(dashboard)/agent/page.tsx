import type { Metadata } from 'next'
import ComingSoon from '@/components/ui/ComingSoon'

export const metadata: Metadata = { title: 'Agente IA — R-TIST' }

export default function AgenteIAPage() {
  return (
    <ComingSoon
      icon="🤖"
      title="Agente de IA"
      description="Tu asistente inteligente que cotiza automáticamente, responde clientes en WhatsApp y agenda eventos según tu disponibilidad."
      eta="Fase 4 — Claude API"
    />
  )
}
