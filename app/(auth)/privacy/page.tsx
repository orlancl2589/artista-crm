import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Política de Privacidad — R-TIST' }

export default function PrivacyPage() {
  return (
    <div className="w-full max-w-[680px]">
      <div className="flex items-center gap-3 mb-8">
        <div style={{ background: 'var(--accent)' }} className="w-9 h-9 rounded-[8px] flex items-center justify-center font-bold text-lg">
          🎵
        </div>
        <div>
          <div className="font-bold text-[15px] leading-tight" style={{ color: 'var(--text)' }}>R-TIST</div>
          <div className="font-mono text-[10px] tracking-wide" style={{ color: 'var(--muted2)' }}>Política de Privacidad</div>
        </div>
      </div>

      <div className="rounded-xl p-8 border flex flex-col gap-6" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
        <div>
          <h1 className="text-[22px] font-extrabold mb-1" style={{ color: 'var(--text)' }}>Política de Privacidad</h1>
          <p className="text-[12px] font-mono" style={{ color: 'var(--muted2)' }}>Última actualización: julio 2026</p>
        </div>

        {[
          {
            title: '1. Información que recopilamos',
            body: 'Recopilamos: (a) información de cuenta — nombre artístico, email y contraseña al registrarte; (b) datos de uso — eventos, clientes y cotizaciones que tú ingresas; (c) datos técnicos — dirección IP, tipo de navegador y páginas visitadas para mejorar el servicio.',
          },
          {
            title: '2. Cómo usamos tu información',
            body: 'Usamos tu información para: proveer y mejorar el servicio, enviarte notificaciones relacionadas con tu cuenta y cotizaciones, y responder a tus solicitudes de soporte. No usamos tus datos para publicidad de terceros.',
          },
          {
            title: '3. Datos de tus clientes',
            body: 'Los números de teléfono y datos personales de tus clientes que almacenas en R-TIST se cifran con AES-256 en reposo. Eres el responsable del tratamiento de esos datos frente a tus clientes. Te recomendamos informarles que sus datos están almacenados en tu CRM.',
          },
          {
            title: '4. Compartición de datos',
            body: 'No vendemos tu información. Compartimos datos únicamente con proveedores de infraestructura necesarios para operar el servicio: Supabase (base de datos, México/EE.UU.), Vercel (hosting, EE.UU.) y Resend (emails transaccionales, EE.UU.). Todos bajo acuerdos de confidencialidad.',
          },
          {
            title: '5. Seguridad',
            body: 'Implementamos cifrado en tránsito (HTTPS/TLS) y en reposo (AES-256 para datos sensibles). Usamos autenticación segura mediante Supabase Auth. Sin embargo, ningún sistema es 100% infalible y no podemos garantizar seguridad absoluta.',
          },
          {
            title: '6. Retención de datos',
            body: 'Conservamos tus datos mientras tu cuenta esté activa. Si eliminas tu cuenta, tus datos serán eliminados en un plazo máximo de 30 días, excepto donde la ley nos obligue a conservarlos por más tiempo.',
          },
          {
            title: '7. Tus derechos',
            body: 'Tienes derecho a: acceder a tus datos, corregir información incorrecta, solicitar la eliminación de tu cuenta y datos, y exportar tu información. Para ejercer estos derechos contáctanos en hola@artistacrm.com.',
          },
          {
            title: '8. Cookies',
            body: 'Usamos cookies esenciales para mantener tu sesión activa. No usamos cookies de rastreo ni publicidad. Puedes deshabilitar las cookies en tu navegador, pero esto impedirá que puedas iniciar sesión.',
          },
          {
            title: '9. Cambios a esta política',
            body: 'Podemos actualizar esta política. Te notificaremos por email ante cambios relevantes. La versión vigente siempre estará disponible en esta página.',
          },
          {
            title: '10. Contacto',
            body: 'Para dudas sobre privacidad o para ejercer tus derechos escríbenos a: hola@artistacrm.com',
          },
        ].map(({ title, body }) => (
          <div key={title}>
            <h2 className="text-[14px] font-bold mb-2" style={{ color: 'var(--text)' }}>{title}</h2>
            <p className="text-[13px] leading-relaxed" style={{ color: 'var(--muted2)' }}>{body}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-6 text-[13px]" style={{ color: 'var(--muted2)' }}>
        <Link href="/terms" className="hover:underline" style={{ color: 'var(--accent)' }}>
          ← Términos de Servicio
        </Link>
        <Link href="/login" className="hover:underline">
          Volver al inicio →
        </Link>
      </div>
    </div>
  )
}