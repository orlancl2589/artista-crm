import { notFound, redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getArtistFromSession } from '@/lib/db/artists'
import { prisma } from '@/lib/db/prisma'
import EventDetail from '@/components/events/EventDetail'
import type { Metadata } from 'next'

interface Props {
  params: { id: string }
}

export const metadata: Metadata = { title: 'Evento — R-TIST' }

export default async function EventDetailPage({ params }: Props) {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const artist = await getArtistFromSession(user.id)
  if (!artist) redirect('/login')

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      client: { select: { id: true, name: true } },
      quotes: {
        select: { id: true, quoteNumber: true, status: true, total: true, currency: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  })

  if (!event || event.artistId !== artist.id) notFound()

  const serialized = {
    ...event,
    startDate: event.startDate.toISOString(),
    endDate: event.endDate.toISOString(),
    price: event.price?.toString() ?? null,
    paidAmount: event.paidAmount.toString(),
    quotes: event.quotes.map((q) => ({ ...q, total: q.total.toString() })),
  }

  return (
    <main className="flex-1 overflow-y-auto p-6">
      <EventDetail event={serialized} />
    </main>
  )
}
