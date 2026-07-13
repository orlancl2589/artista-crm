import type { Metadata } from 'next'
import ComingSoon from '@/components/ui/ComingSoon'

export const metadata: Metadata = { title: 'Mi Página Web — Artista CRM' }

export default function MiPáginaWebPage() {
  return (
    <ComingSoon
      icon="🌐"
      title="Tu página web pública"
      description="Genera automáticamente una página profesional con tu perfil, galería, reseñas y formulario de contacto. Sin programar nada."
      eta="Fase 5 — Sitio público"
    />
  )
}
