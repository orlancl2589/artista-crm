'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import NewClientModal from '@/components/clients/NewClientModal'
import NewEventModal from '@/components/events/NewEventModal'
import { formatCurrency } from '@/lib/utils/currency'

interface UpcomingEvent {
  id: string
  title: string
  eventType: string
  status: string
  startDate: string
  venue: string | null
  city: string | null
  price: string | null
  client: { name: string } | null
}

interface RecentClient {
  id: string
  name: string
  preferredChannel: string
  totalEvents: number
  createdAt: string
}

interface Stats {
  revenueThisMonth: number
  revenueLastMonth: number
  eventsThisMonth: number
  eventsLastMonth: number
  activeClients: number
  upcomingCount: number
}

interface Props {
  artistName: string
  stats: Stats
  upcomingEvents: UpcomingEvent[]
  recentClients: RecentClient[]
  isNewUser: boolean
  profileComplete: boolean
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending:   { label: 'Pendiente',  color: '#f59e0b' },
  confirmed: { label: 'Confirmado', color: '#c8ff00' },
  completed: { label: 'Completado', color: '#22c55e' },
  cancelled: { label: 'Cancelado',  color: '#ef4444' },
}
const DEFAULT_STATUS_CFG = { label: 'Pendiente', color: '#f59e0b' }

const TYPE_LABEL: Record<string, string> = {
  wedding: 'Boda', corporate: 'Corp.', birthday: 'Cumple',
  quinceanera: 'XV', club: 'Club', private: 'Privado', other: 'Otro',
}

const CHANNEL_ICON: Record<string, string> = {
  whatsapp: '📱', instagram: '📸', facebook: '👍',
}

function delta(current: number, prev: number): { pct: number; up: boolean } | null {
  if (prev === 0) return null
  const pct = Math.round(((current - prev) / prev) * 100)
  return { pct: Math.abs(pct), up: pct >= 0 }
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

function StatCard({
  label, value, sub, accent,
}: {
  label: string
  value: string
  sub?: React.ReactNode
  accent?: boolean
}) {
  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-2"
      style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
    >
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.8px]" style={{ color: 'var(--muted)' }}>
        {label}
      </span>
      <span
        className="text-[28px] font-extrabold leading-none tracking-[-1px]"
        style={{ color: accent ? 'var(--accent)' : 'var(--text)' }}
      >
        {value}
      </span>
      {sub && <div className="text-[12px]" style={{ color: 'var(--muted2)' }}>{sub}</div>}
    </div>
  )
}

export default function DashboardShell({ artistName, stats, upcomingEvents, recentClients, isNewUser, profileComplete }: Props) {
  const router = useRouter()
  const [showClientModal, setShowClientModal] = useState(false)
  const [showEventModal, setShowEventModal] = useState(false)

  const revDelta = delta(stats.revenueThisMonth, stats.revenueLastMonth)
  const evDelta = delta(stats.eventsThisMonth, stats.eventsLastMonth)

  const today = new Date().toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4 sm:gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] capitalize mb-1" style={{ color: 'var(--muted2)' }}>
            {today}
          </p>
          <h1 className="text-[20px] sm:text-[24px] font-extrabold tracking-[-0.5px]" style={{ color: 'var(--text)' }}>
            {greeting()}, {artistName}
          </h1>
          {stats.upcomingCount > 0 && (
            <p className="text-[13px] mt-1" style={{ color: 'var(--muted2)' }}>
              Tienes{' '}
              <span style={{ color: 'var(--accent)', fontWeight: 700 }}>
                {stats.upcomingCount} evento{stats.upcomingCount !== 1 ? 's' : ''}
              </span>{' '}
              próximos
            </p>
          )}
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => setShowEventModal(true)}
            className="px-3 sm:px-4 py-[9px] rounded-[var(--radius)] text-[13px] font-medium transition-colors"
            style={{ background: 'var(--bg3)', color: 'var(--text)', border: '1px solid var(--border)' }}
          >
            + Evento
          </button>
          <button
            onClick={() => setShowClientModal(true)}
            className="px-3 sm:px-4 py-[9px] rounded-[var(--radius)] text-[13px] font-bold hover:opacity-90 transition-opacity"
            style={{ background: 'var(--accent)', color: 'var(--bg)' }}
          >
            + Cliente
          </button>
        </div>
      </div>

      {/* Onboarding banner — solo para usuarios nuevos */}
      {isNewUser && (
        <div
          className="rounded-xl p-5 flex flex-col gap-4"
          style={{ background: 'var(--bg2)', border: '1px solid var(--accent)30' }}
        >
          <div>
            <div
              className="inline-block text-[10px] font-bold uppercase tracking-[1.5px] px-2 py-1 rounded-full mb-2"
              style={{ background: 'var(--accent)15', color: 'var(--accent)' }}
            >
              Primeros pasos
            </div>
            <p className="text-[13px]" style={{ color: 'var(--muted2)' }}>
              Completa estos pasos para sacarle todo el provecho al CRM
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { done: true,            icon: '✓', label: 'Crear tu cuenta',           href: null },
              { done: profileComplete, icon: '2', label: 'Completar tu perfil',       href: '/profile' },
              { done: stats.activeClients > 0, icon: '3', label: 'Agregar tu primer cliente', href: null, action: () => setShowClientModal(true) },
            ].map((step) => (
              <div
                key={step.label}
                onClick={() => step.href ? router.push(step.href) : step.action?.()}
                className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors"
                style={{
                  background: step.done ? 'rgba(34,197,94,0.08)' : 'var(--bg3)',
                  border: `1px solid ${step.done ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
                  opacity: step.done ? 0.7 : 1,
                }}
                onMouseEnter={e => { if (!step.done) e.currentTarget.style.borderColor = 'var(--accent)' }}
                onMouseLeave={e => { if (!step.done) e.currentTarget.style.borderColor = 'var(--border)' }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0"
                  style={{
                    background: step.done ? 'rgba(34,197,94,0.2)' : 'var(--bg4)',
                    color: step.done ? '#22c55e' : 'var(--muted2)',
                  }}
                >
                  {step.done ? '✓' : step.icon}
                </div>
                <span className="text-[12px] font-medium" style={{ color: step.done ? 'var(--muted2)' : 'var(--text)' }}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Ingresos este mes"
          value={formatCurrency(stats.revenueThisMonth)}
          accent
          sub={
            revDelta ? (
              <span style={{ color: revDelta.up ? '#22c55e' : '#ef4444' }}>
                {revDelta.up ? '↑' : '↓'} {revDelta.pct}% vs mes anterior
              </span>
            ) : (
              'Sin comparativa aún'
            )
          }
        />
        <StatCard
          label="Eventos este mes"
          value={String(stats.eventsThisMonth)}
          sub={
            evDelta ? (
              <span style={{ color: evDelta.up ? '#22c55e' : '#ef4444' }}>
                {evDelta.up ? '↑' : '↓'} {evDelta.pct}% vs mes anterior
              </span>
            ) : (
              'Primer mes registrado'
            )
          }
        />
        <StatCard
          label="Clientes activos"
          value={String(stats.activeClients)}
          sub="en tu base de datos"
        />
        <StatCard
          label="Próximos eventos"
          value={String(stats.upcomingCount)}
          sub="pendientes y confirmados"
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 flex-1">
        {/* Próximos eventos */}
        <div
          className="rounded-xl flex flex-col"
          style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <h2 className="text-[13px] font-bold" style={{ color: 'var(--text)' }}>
              Próximos eventos
            </h2>
            <Link
              href="/events?upcoming=true"
              className="text-[12px] font-medium hover:underline"
              style={{ color: 'var(--accent)' }}
            >
              Ver todos →
            </Link>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 gap-2 py-12">
              <span className="text-[32px]">📅</span>
              <p className="text-[13px]" style={{ color: 'var(--muted2)' }}>
                Sin eventos próximos
              </p>
              <button
                onClick={() => setShowEventModal(true)}
                className="text-[13px] font-medium mt-1"
                style={{ color: 'var(--accent)' }}
              >
                + Crear evento
              </button>
            </div>
          ) : (
            <div className="flex flex-col divide-y" style={{ '--tw-divide-opacity': 1 } as React.CSSProperties}>
              {upcomingEvents.map((ev) => {
                const cfg = STATUS_CONFIG[ev.status] ?? DEFAULT_STATUS_CFG
                const d = new Date(ev.startDate)
                return (
                  <div
                    key={ev.id}
                    onClick={() => router.push(`/events/${ev.id}`)}
                    className="flex items-center gap-4 px-5 py-4 cursor-pointer transition-colors"
                    style={{ borderColor: 'var(--border)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg3)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Mini cal */}
                    <div
                      className="w-[44px] flex-shrink-0 flex flex-col items-center rounded-[8px] py-1.5"
                      style={{ background: 'var(--bg3)' }}
                    >
                      <span className="font-mono text-[9px] font-semibold uppercase" style={{ color: 'var(--muted)' }}>
                        {d.toLocaleDateString('es-MX', { month: 'short' })}
                      </span>
                      <span className="text-[20px] font-extrabold leading-tight" style={{ color: 'var(--text)' }}>
                        {d.getDate()}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[13px] font-semibold truncate" style={{ color: 'var(--text)' }}>
                          {ev.title}
                        </span>
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded-[4px] uppercase tracking-[0.5px] flex-shrink-0"
                          style={{ background: `${cfg.color}20`, color: cfg.color }}
                        >
                          {cfg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--muted2)' }}>
                        <span>{d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="text-[10px]" style={{ color: 'var(--bg4)' }}>•</span>
                        <span>{TYPE_LABEL[ev.eventType] ?? ev.eventType}</span>
                        {(ev.venue || ev.city) && (
                          <>
                            <span className="text-[10px]" style={{ color: 'var(--bg4)' }}>•</span>
                            <span className="truncate">📍 {[ev.venue, ev.city].filter(Boolean).join(', ')}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Precio */}
                    {ev.price && (
                      <span className="font-mono text-[13px] font-bold flex-shrink-0" style={{ color: 'var(--text)' }}>
                        {formatCurrency(Number(ev.price))}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Columna derecha */}
        <div className="flex flex-col gap-4">
          {/* Clientes recientes */}
          <div
            className="rounded-xl flex flex-col"
            style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
          >
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <h2 className="text-[13px] font-bold" style={{ color: 'var(--text)' }}>
                Clientes recientes
              </h2>
              <Link href="/clients" className="text-[12px] font-medium hover:underline" style={{ color: 'var(--accent)' }}>
                Ver todos →
              </Link>
            </div>

            {recentClients.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10">
                <span className="text-[28px]">👥</span>
                <p className="text-[12px]" style={{ color: 'var(--muted2)' }}>Sin clientes aún</p>
                <button
                  onClick={() => setShowClientModal(true)}
                  className="text-[12px] font-medium"
                  style={{ color: 'var(--accent)' }}
                >
                  + Agregar cliente
                </button>
              </div>
            ) : (
              <div className="flex flex-col divide-y" style={{ '--tw-divide-opacity': 1 } as React.CSSProperties}>
                {recentClients.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => router.push(`/clients/${c.id}`)}
                    className="flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors"
                    style={{ borderColor: 'var(--border)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg3)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold flex-shrink-0"
                      style={{ background: 'var(--bg3)', color: 'var(--accent)' }}
                    >
                      {c.name[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold truncate" style={{ color: 'var(--text)' }}>
                        {c.name}
                      </div>
                      <div className="text-[11px]" style={{ color: 'var(--muted2)' }}>
                        {CHANNEL_ICON[c.preferredChannel]} · {c.totalEvents} evento{c.totalEvents !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <span className="font-mono text-[10px]" style={{ color: 'var(--muted)' }}>
                      {new Date(c.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Acciones rápidas */}
          <div
            className="rounded-xl p-4 flex flex-col gap-2"
            style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
          >
            <h2 className="text-[11px] font-bold uppercase tracking-[0.8px] mb-1" style={{ color: 'var(--muted)' }}>
              Acciones rápidas
            </h2>
            {[
              { href: '/clients', icon: '👥', label: 'Ver todos los clientes' },
              { href: '/events', icon: '📅', label: 'Ver calendario de eventos' },
              { href: '/quotes', icon: '📄', label: 'Gestionar cotizaciones' },
            ].map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="flex items-center gap-3 px-3 py-2 rounded-[var(--radius)] text-[13px] transition-colors"
                style={{ color: 'var(--muted2)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg3)'
                  e.currentTarget.style.color = 'var(--text)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--muted2)'
                }}
              >
                <span>{a.icon}</span>
                <span>{a.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <NewClientModal
        open={showClientModal}
        onClose={() => setShowClientModal(false)}
        onCreated={() => router.refresh()}
      />
      <NewEventModal
        open={showEventModal}
        onClose={() => setShowEventModal(false)}
        onCreated={() => router.refresh()}
      />
    </div>
  )
}
