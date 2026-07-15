import { notFound, redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getArtistFromSession } from '@/lib/db/artists'
import { prisma } from '@/lib/db/prisma'
import QuoteDetail from '@/components/quotes/QuoteDetail'
import type { Metadata } from 'next'

interface Props { params: { id: string } }

export const metadata: Metadata = { title: 'Cotización — R-TIST' }

export default async function QuoteDetailPage({ params }: Props) {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const artist = await getArtistFromSession(user.id)
  if (!artist) redirect('/login')

  const quote = await prisma.quote.findUnique({
    where: { id: params.id },
    include: {
      client: { select: { id: true, name: true } },
      event: { select: { id: true, title: true, startDate: true } },
    },
  })

  if (!quote || quote.artistId !== artist.id) notFound()

  const q = quote as typeof quote & {
    eventDate?: Date | null
    eventEndDate?: Date | null
    eventStartTime?: string | null
    eventEndTime?: string | null
  }

  const serialized = {
    ...quote,
    lineItems: quote.lineItems as { description: string; quantity: number; unitPrice: number; total: number }[],
    subtotal: quote.subtotal.toString(),
    tax: quote.tax.toString(),
    total: quote.total.toString(),
    eventDate: q.eventDate?.toISOString() ?? null,
    eventEndDate: q.eventEndDate?.toISOString() ?? null,
    eventStartTime: q.eventStartTime ?? null,
    eventEndTime: q.eventEndTime ?? null,
    validUntil: quote.validUntil?.toISOString() ?? null,
    signedAt: quote.signedAt?.toISOString() ?? null,
    createdAt: quote.createdAt.toISOString(),
    updatedAt: quote.updatedAt.toISOString(),
    event: quote.event
      ? { ...quote.event, startDate: quote.event.startDate.toISOString() }
      : null,
  }

  return (
    <main className="flex-1 overflow-y-auto p-6">
      <QuoteDetail quote={serialized} artistName={artist.name} artistLogoUrl={(artist as { logoUrl?: string | null }).logoUrl ?? null} />
    </main>
  )
}
