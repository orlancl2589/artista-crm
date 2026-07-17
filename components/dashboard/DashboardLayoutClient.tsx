'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Sidebar from './Sidebar'

interface Props {
  children: React.ReactNode
  artistName: string
  artistLogoUrl: string | null
  artistPlan: string
}

export default function DashboardLayoutClient({ children, artistName, artistLogoUrl, artistPlan }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => { setSidebarOpen(false) }, [pathname])

  // Detecta cierre de sesión (por token inválido, otro dispositivo, etc.)
  // y redirige a login sin que la página se cuelgue
  useEffect(() => {
    const supabase = createClientComponentClient()

    // Listener para SIGNED_OUT inmediato
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') router.push('/login')
    })

    // Polling cada 20s: getUser() valida en Supabase server y detecta sesión revocada
    let mounted = true
    const poll = async () => {
      if (!mounted) return
      const { error } = await supabase.auth.getUser()
      if (error && mounted) {
        await supabase.auth.signOut()
        router.push('/login')
      }
    }
    const interval = setInterval(poll, 5000)

    return () => {
      mounted = false
      clearInterval(interval)
      subscription.unsubscribe()
    }
  }, [router])

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>

      {/* Sidebar desktop */}
      <div className="hidden lg:block flex-shrink-0">
        <Sidebar artistName={artistName} artistLogoUrl={artistLogoUrl} artistPlan={artistPlan} />
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
            <Sidebar artistName={artistName} artistLogoUrl={artistLogoUrl} artistPlan={artistPlan} onClose={() => setSidebarOpen(false)} />
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