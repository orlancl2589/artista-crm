import type { Metadata } from 'next'
import ComingSoon from '@/components/ui/ComingSoon'

export const metadata: Metadata = { title: 'Perfil Musical — R-TIST' }

export default function PerfilMusicalPage() {
  return (
    <ComingSoon
      icon="🎵"
      title="Perfil musical"
      description="Conecta Spotify y SoundCloud para mostrar tu música directamente en tu perfil público y cotizaciones."
      eta="Fase 4 — Integraciones musicales"
    />
  )
}
