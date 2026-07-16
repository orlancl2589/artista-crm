import { notFound, redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getArtistFromSession } from '@/lib/db/artists'
import { prisma } from '@/lib/db/prisma'
import { decrypt } from '@/lib/security/encrypt'
import { formatPhone } from '@/lib/utils/phone'
import ClientDetail from '@/components/clients/ClientDetail'
import type { Metadata } from 'next'

interface Props {
  params: { id: string }
}

export const metadata: Metadata = { title: 'Cliente — R-TIST' }

export default async function ClientDetailPage({ params }: Props) {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const artist = await getArtistFromSession(user.id)
  if (!artist) redirect('/login')

  const client = await prisma.client.findUnique({
    where: { id: params.id },
    include: {
      events: {
        orderBy: { startDate: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          eventType: true,
          status: true,
          startDate: true,
          price: true,
          currency: true,
        },
      },
      quotes: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          quoteNumber: true,
          status: true,
          total: true,
          currency: true,
          createdAt: true,
        },
      },
    },
  })

  if (!client || client.artistId !== artist.id) notFound()

  const serialized = {
    ...client,
    phone: decrypt(client.phone),
    phoneFormatted: formatPhone(decrypt(client.phone)),
    photoUrl: (client as { photoUrl?: string | null }).photoUrl ?? null,
    totalSpent: client.totalSpent.toString(),
    birthdate: client.birthdate?.toISOString() ?? null,
    lastContact: client.lastContact?.toISOString() ?? null,
    createdAt: client.createdAt.toISOString(),
    updatedAt: client.updatedAt.toISOString(),
    events: client.events.map((e) => ({
      ...e,
      startDate: e.startDate.toISOString(),
      price: e.price?.toString() ?? null,
    })),
    quotes: client.quotes.map((q) => ({
      ...q,
      total: q.total.toString(),
      createdAt: q.createdAt.toISOString(),
    })),
  }

  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6">
      <ClientDetail client={serialized} />
    </main>
  )
}
