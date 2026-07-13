import type { Metadata } from 'next'
import ComingSoon from '@/components/ui/ComingSoon'

export const metadata: Metadata = { title: 'Mensajes — Artista CRM' }

export default function MensajesPage() {
  return (
    <ComingSoon
      icon="💬"
      title="Bandeja unificada de mensajes"
      description="Gestiona WhatsApp, Instagram DMs y correo desde un solo lugar. Responde a tus clientes sin cambiar de app."
      eta="Fase 3 — WhatsApp Business API"
    />
  )
}
