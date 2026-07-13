import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Términos de Servicio — Artista CRM' }

export default function TermsPage() {
  return (
    <div className="w-full max-w-[680px]">
      <div className="flex items-center gap-3 mb-8">
        <div style={{ background: 'var(--accent)' }} className="w-9 h-9 rounded-[8px] flex items-center justify-center font-bold text-lg">
          🎵
        </div>
        <div>
          <div className="font-bold text-[15px] leading-tight" style={{ color: 'var(--text)' }}>Artista CRM</div>
          <div className="font-mono text-[10px] tracking-wide" style={{ color: 'var(--muted2)' }}>Términos de Servicio</div>
        </div>
      </div>

      <div className="rounded-xl p-8 border flex flex-col gap-6" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
        <div>
          <h1 className="text-[22px] font-extrabold mb-1" style={{ color: 'var(--text)' }}>Términos de Servicio</h1>
          <p className="text-[12px] font-mono" style={{ color: 'var(--muted2)' }}>Última actualización: julio 2026</p>
        </div>

        {[
          {
            title: '1. Aceptación',
            body: 'Al registrarte y usar Artista CRM aceptas estos términos. Si no estás de acuerdo, no uses el servicio. Artista CRM es una herramienta de gestión para artistas y músicos en México y Latinoamérica.',
          },
          {
            title: '2. Descripción del servicio',
            body: 'Artista CRM es un software de gestión de clientes, eventos y cotizaciones para artistas y músicos. Ofrecemos un plan gratuito con funcionalidades limitadas y planes de pago con acceso completo.',
          },
          {
            title: '3. Uso aceptable',
            body: 'Te comprometes a usar el servicio únicamente para fines legítimos de gestión de tu actividad artística. Está prohibido usar Artista CRM para enviar spam, almacenar contenido ilegal o intentar acceder a datos de otros usuarios.',
          },
          {
            title: '4. Tu cuenta',
            body: 'Eres responsable de mantener la confidencialidad de tu contraseña y de todas las actividades que ocurran en tu cuenta. Notifícanos inmediatamente si detectas acceso no autorizado.',
          },
          {
            title: '5. Datos y privacidad',
            body: 'Los datos de tus clientes que ingreses en el sistema son de tu propiedad. No vendemos ni compartimos tu información con terceros. Consulta nuestra Política de Privacidad para más detalles.',
          },
          {
            title: '6. Propiedad intelectual',
            body: 'El código, diseño y contenido de Artista CRM son propiedad de sus desarrolladores. Tu contenido (datos de clientes, cotizaciones, etc.) es de tu propiedad.',
          },
          {
            title: '7. Limitación de responsabilidad',
            body: 'Artista CRM se proporciona "tal cual". No garantizamos disponibilidad ininterrumpida del servicio. No somos responsables por pérdida de datos derivada de fallas técnicas fuera de nuestro control.',
          },
          {
            title: '8. Modificaciones',
            body: 'Podemos actualizar estos términos en cualquier momento. Te notificaremos por email ante cambios significativos. El uso continuado del servicio tras la notificación implica aceptación.',
          },
          {
            title: '9. Contacto',
            body: 'Para cualquier duda sobre estos términos escríbenos a: hola@artistacrm.com',
          },
        ].map(({ title, body }) => (
          <div key={title}>
            <h2 className="text-[14px] font-bold mb-2" style={{ color: 'var(--text)' }}>{title}</h2>
            <p className="text-[13px] leading-relaxed" style={{ color: 'var(--muted2)' }}>{body}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-6 text-[13px]" style={{ color: 'var(--muted2)' }}>
        <Link href="/privacy" className="hover:underline" style={{ color: 'var(--accent)' }}>
          Política de Privacidad →
        </Link>
        <Link href="/login" className="hover:underline">
          ← Volver al inicio
        </Link>
      </div>
    </div>
  )
}