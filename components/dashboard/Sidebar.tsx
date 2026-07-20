'use client'

import Image from 'next/image'
import Link from 'next/link'
// Image se usa para el logo del sistema (local), img nativo para el logo del artista (Supabase)
import { usePathname } from 'next/navigation'

interface SidebarProps {
  onClose?: () => void
  artistName: string
  artistLogoUrl: string | null
  artistPlan: string
}

const NAV_MAIN = [
  { href: '/', icon: '⚡', label: 'Dashboard' },
  { href: '/messages', icon: '💬', label: 'Mensajes', badge: '7', badgeVariant: 'red' as const },
  { href: '/events', icon: '📅', label: 'Eventos' },
  { href: '/clients', icon: '👥', label: 'Clientes' },
  { href: '/quotes', icon: '📄', label: 'Cotizaciones', badge: '3' },
]

const NAV_GROWTH = [
  { href: '/analytics', icon: '📊', label: 'Analytics' },
  { href: '/music', icon: '🎵', label: 'Perfil Musical' },
  { href: '/ads', icon: '📣', label: 'Campañas Ads' },
  { href: '/website', icon: '🌐', label: 'Mi Página Web' },
]

const NAV_CONFIG = [
  { href: '/agent', icon: '🤖', label: 'Agente IA' },
  { href: '/settings', icon: '⚙️', label: 'Configuración' },
]

function NavItem({
  href,
  icon,
  label,
  badge,
  badgeVariant = 'accent',
}: {
  href: string
  icon: string
  label: string
  badge?: string
  badgeVariant?: 'accent' | 'red'
}) {
  const pathname = usePathname()
  const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))

  return (
    <Link
      href={href}
      className="flex items-center gap-[10px] px-[10px] py-[9px] rounded-[var(--radius)] text-[13px] font-medium transition-all duration-150 relative mb-[1px]"
      style={{
        background: isActive ? 'rgba(200,255,0,0.08)' : 'transparent',
        color: isActive ? 'var(--accent)' : 'var(--muted2)',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'var(--bg3)'
          e.currentTarget.style.color = 'var(--text)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = 'var(--muted2)'
        }
      }}
    >
      {isActive && (
        <span
          className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-[3px] h-[18px] rounded-r-[2px]"
          style={{ background: 'var(--accent)' }}
        />
      )}
      <span className="text-[15px] w-[18px] text-center">{icon}</span>
      <span className="flex-1">{label}</span>
      {badge && (
        <span
          className="font-mono text-[9px] font-bold px-[6px] py-[2px] rounded-[20px]"
          style={{
            background: badgeVariant === 'red' ? 'var(--red)' : 'var(--accent)',
            color: badgeVariant === 'red' ? '#fff' : 'var(--bg)',
          }}
        >
          {badge}
        </span>
      )}
    </Link>
  )
}

const PLAN_LABEL: Record<string, string> = { free: 'Plan Free', pro: 'Plan Pro', premium: 'Premium' }

export default function Sidebar({ onClose, artistName, artistLogoUrl, artistPlan }: SidebarProps) {
  return (
    <aside
      className="w-[220px] min-w-[220px] h-full flex flex-col relative z-10"
      style={{ background: 'var(--bg2)', borderRight: '1px solid var(--border)' }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-[10px] px-5 py-[22px]"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="w-[44px] h-[34px] rounded-[8px] overflow-hidden flex-shrink-0">
          <Image src="/Logo.png" alt="Logo" width={44} height={34} className="w-full h-full object-contain" />
        </div>
        <div className="flex-1">
          <div className="text-[15px] font-extrabold tracking-[-0.3px] leading-tight" style={{ color: 'var(--text)' }}>
            R-TIST
          </div>
          <div className="font-mono text-[10px] tracking-[0.5px]" style={{ color: 'var(--muted2)' }}>
            v1.0 · beta
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[14px] flex-shrink-0"
            style={{ color: 'var(--muted2)' }}
            aria-label="Cerrar menú"
          >
            ✕
          </button>
        )}
      </div>

      {/* Nav principal */}
      <div className="px-3 pt-[14px] pb-[6px]">
        <div
          className="font-mono text-[9px] font-semibold uppercase px-2 mb-1 tracking-[1.5px]"
          style={{ color: 'var(--muted)' }}
        >
          Principal
        </div>
        {NAV_MAIN.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </div>

      {/* Nav crecimiento */}
      <div className="px-3 pt-[14px] pb-[6px]">
        <div
          className="font-mono text-[9px] font-semibold uppercase px-2 mb-1 tracking-[1.5px]"
          style={{ color: 'var(--muted)' }}
        >
          Crecimiento
        </div>
        {NAV_GROWTH.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </div>

      {/* Nav config */}
      <div className="px-3 pt-[14px] pb-[6px]">
        <div
          className="font-mono text-[9px] font-semibold uppercase px-2 mb-1 tracking-[1.5px]"
          style={{ color: 'var(--muted)' }}
        >
          Configuración
        </div>
        {NAV_CONFIG.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </div>

      {/* Artist pill */}
      <div className="mt-auto px-3 pb-[14px]" style={{ borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
        <Link
          href="/profile"
          className="flex items-center gap-[10px] px-[10px] py-2 rounded-[var(--radius)] cursor-pointer transition-all duration-150"
          style={{ background: 'var(--bg3)' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg4)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg3)')}
        >
          <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center"
            style={{ background: artistLogoUrl ? 'transparent' : 'linear-gradient(135deg, var(--purple), var(--blue))' }}
          >
            {artistLogoUrl
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={artistLogoUrl} alt={artistName} className="w-full h-full object-cover" />
              : <span className="text-[12px]">🎧</span>
            }
          </div>
          <div>
            <div className="text-[12px] font-semibold leading-tight truncate max-w-[120px]" style={{ color: 'var(--text)' }}>
              {artistName || 'Mi perfil'}
            </div>
            <div className="font-mono text-[10px]" style={{ color: 'var(--muted2)' }}>
              {PLAN_LABEL[artistPlan] ?? 'Plan Free'}
            </div>
          </div>
        </Link>
      </div>
    </aside>
  )
}
