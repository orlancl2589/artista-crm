export const dynamic = 'force-dynamic'

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getArtistFromSession } from '@/lib/db/artists'
import DashboardLayoutClient from '@/components/dashboard/DashboardLayoutClient'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const artist = await getArtistFromSession(session.user.id)
  const logoUrl = (artist as { logoUrl?: string | null } | null)?.logoUrl ?? null

  return (
    <DashboardLayoutClient artistName={artist?.name ?? ''} artistLogoUrl={logoUrl}>
      {children}
    </DashboardLayoutClient>
  )
}