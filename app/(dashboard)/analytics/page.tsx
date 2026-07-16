import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getArtistFromSession } from '@/lib/db/artists'
import { prisma } from '@/lib/db/prisma'
import AnalyticsShell from '@/components/analytics/AnalyticsShell'

export const metadata: Metadata = { title: 'Analytics — R-TIST' }

export default async function AnalyticsPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const artist = await getArtistFromSession(user.id)
  if (!artist) redirect('/login')

  const now = new Date()
  const yearStart = new Date(now.getFullYear(), 0, 1)

  // Últimos 12 meses para la gráfica de barras
  const months: { label: string; from: Date; to: Date }[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      label: d.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' }),
      from: new Date(d.getFullYear(), d.getMonth(), 1),
      to: new Date(d.getFullYear(), d.getMonth() + 1, 1),
    })
  }

  const [
    eventsYear,
    clientsAll,
    quotesAll,
  ] = await Promise.all([
    // Todos los eventos del año (confirmados + completados) con precio, tipo, ciudad, estado
    prisma.event.findMany({
      where: {
        artistId: artist.id,
        startDate: { gte: yearStart },
        status: { in: ['confirmed', 'completed'] },
      },
      select: {
        price: true,
        eventType: true,
        city: true,
        state: true,
        startDate: true,
        status: true,
      },
    }),

    // Clientes: ciudad/estado + totalSpent para top clientes
    prisma.client.findMany({
      where: { artistId: artist.id, isActive: true },
      select: {
        name: true,
        city: true,
        state: true,
        totalSpent: true,
        totalEvents: true,
      },
      orderBy: { totalSpent: 'desc' },
      take: 50,
    }),

    // Cotizaciones del año para pipeline
    prisma.quote.findMany({
      where: {
        artistId: artist.id,
        createdAt: { gte: yearStart },
      },
      select: {
        status: true,
        total: true,
        eventCity: true,
        eventState: true,
      },
    }),
  ])

  // ── Ingresos por mes ──────────────────────────────────────────────
  const revenueByMonth = months.map(({ label, from, to }) => {
    const monthEvents = eventsYear.filter(
      (e) => e.startDate >= from && e.startDate < to
    )
    return {
      month: label,
      revenue: monthEvents.reduce((s, e) => s + Number(e.price ?? 0), 0),
      count: monthEvents.length,
    }
  })

  // ── Ingresos por tipo de evento ───────────────────────────────────
  const typeMap: Record<string, number> = {}
  eventsYear.forEach((e) => {
    typeMap[e.eventType] = (typeMap[e.eventType] ?? 0) + Number(e.price ?? 0)
  })
  const revenueByType = Object.entries(typeMap)
    .map(([type, revenue]) => ({ type, revenue }))
    .sort((a, b) => b.revenue - a.revenue)

  // ── Top clientes por gasto ────────────────────────────────────────
  const topClients = clientsAll.slice(0, 5).map((c) => ({
    name: c.name,
    city: c.city ?? '',
    state: c.state ?? '',
    totalSpent: Number(c.totalSpent),
    totalEvents: c.totalEvents,
  }))

  // ── Pipeline de cotizaciones ──────────────────────────────────────
  const pipeline = {
    draft: quotesAll.filter((q) => q.status === 'draft').length,
    sent: quotesAll.filter((q) => q.status === 'sent').length,
    accepted: quotesAll.filter((q) => q.status === 'accepted').length,
    rejected: quotesAll.filter((q) => q.status === 'rejected').length,
    expired: quotesAll.filter((q) => q.status === 'expired').length,
  }
  const conversionRate =
    pipeline.sent + pipeline.accepted + pipeline.rejected > 0
      ? Math.round((pipeline.accepted / (pipeline.sent + pipeline.accepted + pipeline.rejected)) * 100)
      : 0

  // ── KPIs del año ─────────────────────────────────────────────────
  const totalRevenue = eventsYear.reduce((s, e) => s + Number(e.price ?? 0), 0)
  const bestMonth = revenueByMonth.reduce((best, m) => (m.revenue > best.revenue ? m : best), revenueByMonth[0] ?? { month: '—', revenue: 0 })
  const completedEvents = eventsYear.filter((e) => e.status === 'completed').length
  const totalEvents = eventsYear.length

  // ── Geografía: clientes ───────────────────────────────────────────
  const clientStateMap: Record<string, number> = {}
  clientsAll.forEach((c) => {
    if (c.state) clientStateMap[c.state] = (clientStateMap[c.state] ?? 0) + 1
  })
  const clientsByState = Object.entries(clientStateMap)
    .map(([state, count]) => ({ state, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  // ── Geografía: eventos ────────────────────────────────────────────
  const eventStateMap: Record<string, number> = {}
  eventsYear.forEach((e) => {
    if (e.state) eventStateMap[e.state] = (eventStateMap[e.state] ?? 0) + 1
  })
  const eventsByState = Object.entries(eventStateMap)
    .map(([state, count]) => ({ state, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  return (
    <AnalyticsShell
      kpis={{ totalRevenue, bestMonth, completedEvents, totalEvents, conversionRate }}
      revenueByMonth={revenueByMonth}
      revenueByType={revenueByType}
      topClients={topClients}
      pipeline={pipeline}
      clientsByState={clientsByState}
      eventsByState={eventsByState}
      currency={artist.currency}
    />
  )
}
