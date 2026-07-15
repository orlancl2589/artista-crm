'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'

interface Props {
  children: React.ReactNode
  artistName: string
  artistLogoUrl: string | null
}

export default function DashboardLayoutClient({ children, artistName, artistLogoUrl }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => { setSidebarOpen(false) }, [pathname])

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>

      {/* Sidebar desktop */}
      <div className="hidden lg:block flex-shrink-0">
        <Sidebar artistName={artistName} artistLogoUrl={artistLogoUrl} />
      </div>

      {/* Sidebar mobile — overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 lg:hidden"
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(2px)' }}
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
            <Sidebar artistName={artistName} artistLogoUrl={artistLogoUrl} onClose={() => setSidebarOpen(false)} />
          </div>
        </>
      )}

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Header mobile */}
        <div
          className="lg:hidden flex items-center gap-3 px-4 py-3 flex-shrink-0"
          style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-[18px] transition-colors"
            style={{ color: 'var(--muted2)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg3)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            aria-label="Abrir menú"
          >
            ☰
          </button>
          <div className="flex items-center gap-2">
            <div className="w-[36px] h-[28px] rounded-[6px] overflow-hidden flex-shrink-0">
              <Image src="/Logo.png" alt="R-TIST" width={36} height={28} className="w-full h-full object-contain" />
            </div>
            <span className="font-extrabold text-[14px] tracking-[-0.3px]" style={{ color: 'var(--text)' }}>
              R-TIST
            </span>
          </div>
        </div>

        {children}
      </div>
    </div>
  )
}