import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getArtistFromSession } from '@/lib/db/artists'
import { prisma } from '@/lib/db/prisma'
import { decrypt } from '@/lib/security/encrypt'
import { formatPhone } from '@/lib/utils/phone'
import DashboardShell from '@/components/dashboard/DashboardShell'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard — Artista CRM' }

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const artist = await getArtistFromSession(user.id)
  if (!artist) redirect('/login')

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthEnd = monthStart

  const [
    eventsThisMonth,
    eventsLastMonth,
    activeClients,
    upcomingEvents,
    recentClients,
  ] = await Promise.all([
    // Eventos este mes (confirmados + completados)
    prisma.event.findMany({
      where: {
        artistId: artist.id,
        startDate: { gte: monthStart, lt: monthEnd },
        status: { in: ['confirmed', 'completed'] },
      },
      select: { price: true },
    }),

    // Eventos mes anterior
    prisma.event.findMany({
      where: {
        artistId: artist.id,
        startDate: { gte: lastMonthStart, lt: lastMonthEnd },
        status: { in: ['confirmed', 'completed'] },
      },
      select: { price: true },
    }),

    // Clientes activos
    prisma.client.count({
      where: { artistId: artist.id, isActive: true },
    }),

    // Próximos 5 eventos
    prisma.event.findMany({
      where: {
        artistId: artist.id,
        startDate: { gte: now },
        status: { in: ['pending', 'confirmed'] },
      },
      orderBy: { startDate: 'asc' },
      take: 5,
      select: {
        id: true,
        title: true,
        eventType: true,
        status: true,
        startDate: true,
        venue: true,
        city: true,
        price: true,
        client: { select: { name: true } },
      },
    }),

    // 5 clientes más recientes
    prisma.client.findMany({
      where: { artistId: artist.id, isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        phone: true,
        preferredChannel: true,
        totalEvents: true,
        createdAt: true,
      },
    }),
  ])

  // Contar próximos totales (para el stat card)
  const upcomingCount = await prisma.event.count({
    where: {
      artistId: artist.id,
      startDate: { gte: now },
      status: { in: ['pending', 'confirmed'] },
    },
  })

  const revenueThisMonth = eventsThisMonth.reduce(
    (sum, e) => sum + Number(e.price ?? 0), 0
  )
  const revenueLastMonth = eventsLastMonth.reduce(
    (sum, e) => sum + Number(e.price ?? 0), 0
  )

  return (
    <DashboardShell
      artistName={artist.name}
      stats={{
        revenueThisMonth,
        revenueLastMonth,
        eventsThisMonth: eventsThisMonth.length,
        eventsLastMonth: eventsLastMonth.length,
        activeClients,
        upcomingCount,
      }}
      upcomingEvents={upcomingEvents.map((e) => ({
        ...e,
        startDate: e.startDate.toISOString(),
        price: e.price?.toString() ?? null,
      }))}
      recentClients={recentClients.map((c) => ({
        ...c,
        phone: decrypt(c.phone),
        phoneFormatted: formatPhone(decrypt(c.phone)),
        createdAt: c.createdAt.toISOString(),
      }))}
    />
  )
}
