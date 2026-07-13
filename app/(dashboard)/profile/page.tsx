import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getArtistFromSession } from '@/lib/db/artists'
import ProfileForm from '@/components/profile/ProfileForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Mi Perfil — Artista CRM' }

export default async function ProfilePage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const artist = await getArtistFromSession(user.id)
  if (!artist) redirect('/login')

  const serialized = {
    ...artist,
    basePrice: artist.basePrice?.toString() ?? null,
    rating: artist.rating?.toString() ?? null,
    createdAt: artist.createdAt.toISOString(),
    updatedAt: artist.updatedAt.toISOString(),
    email: user.email ?? '',
  }

  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6">
      <ProfileForm artist={serialized} />
    </main>
  )
}
