'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import NewClientModal from '@/components/clients/NewClientModal'
import NewEventModal from '@/components/events/NewEventModal'
import { formatCurrency } from '@/lib/utils/currency'

interface CalendarEvent {
  id: string
  title: string
  startDate: string
  status: string
  eventType: string
}

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
  calendarEvents: CalendarEvent[]
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

const CAL_STATUS_COLOR: Record<string, string> = {
  pending:   '#f59e0b',
  confirmed: '#c8ff00',
  completed: '#22c55e',
  cancelled: '#ef4444',
}
const CAL_STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente', confirmed: 'Confirmado', completed: 'Completado', cancelled: 'Cancelado',
}
const CAL_TYPE_LABEL: Record<string, string> = {
  wedding: 'Boda', corporate: 'Corp.', birthday: 'Cumple',
  quinceanera: 'XV', club: 'Club', private: 'Privado', other: 'Otro',
}

function MiniCalendar({ events, onNewEvent }: { events: CalendarEvent[]; onNewEvent: () => void }) {
  const router = useRouter()
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const year = viewYear
  const month = viewMonth
  const todayDate = now.getDate()
  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth()

  function prevMonth() {
    setSelectedDay(null)
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    setSelectedDay(null)
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const eventsByDay = new Map<number, CalendarEvent[]>()
  events.forEach(e => {
    const d = new Date(e.startDate)
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate()
      if (!eventsByDay.has(day)) eventsByDay.set(day, [])
      eventsByDay.get(day)!.push(e)
    }
  })

  const monthName = new Date(year, month, 1).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (number | null)[] = []
  for (let i = 0; i < offset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  const selectedEvents = selectedDay ? (eventsByDay.get(selectedDay) ?? []) : []
  const selectedLabel = selectedDay
    ? new Date(viewYear, viewMonth, selectedDay).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })
    : null

  return (
    <div
      className="rounded-xl flex flex-col overflow-hidden"
      style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="text-[11px] font-bold uppercase tracking-[0.8px]" style={{ color: 'var(--muted)' }}>
          Calendario
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="w-6 h-6 flex items-center justify-center rounded-md text-[12px] transition-colors"
            style={{ color: 'var(--muted2)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg3)'; e.currentTarget.style.color = 'var(--text)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted2)' }}
            aria-label="Mes anterior"
          >
            ‹
          </button>
          <span className="text-[11px] font-medium capitalize w-[110px] text-center" style={{ color: 'var(--muted2)' }}>
            {monthName}
          </span>
          <button
            onClick={nextMonth}
            className="w-6 h-6 flex items-center justify-center rounded-md text-[12px] transition-colors"
            style={{ color: 'var(--muted2)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg3)'; e.currentTarget.style.color = 'var(--text)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted2)' }}
            aria-label="Mes siguiente"
          >
            ›
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="px-3 pt-3 pb-2">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
            <div key={d} className="flex items-center justify-center" style={{ height: 20 }}>
              <span className="text-[9px] font-bold" style={{ color: 'var(--muted)' }}>{d}</span>
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            if (!day) return <div key={`e${i}`} style={{ height: 36 }} />
            const isToday = isCurrentMonth && day === todayDate
            const isSelected = day === selectedDay
            const dayEvents = eventsByDay.get(day) ?? []
            const hasEvents = dayEvents.length > 0

            return (
              <div
                key={day}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className="flex flex-col items-center justify-center cursor-pointer rounded-[6px] transition-all"
                style={{
                  height: 36,
                  background: isSelected ? 'var(--bg4)' : isToday ? 'var(--accent)15' : 'transparent',
                  border: isSelected ? '1px solid var(--border)' : '1px solid transparent',
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg3)' }}
                onMouseLeave={e => { e.currentTarget.style.background = isSelected ? 'var(--bg4)' : isToday ? 'var(--accent)15' : 'transparent' }}
              >
                <div
                  className="w-[22px] h-[22px] flex items-center justify-center rounded-full"
                  style={{ background: isToday ? 'var(--accent)' : 'transparent' }}
                >
                  <span
                    className="text-[11px]"
                    style={{
                      color: isToday ? 'var(--bg)' : hasEvents ? 'var(--text)' : 'var(--muted2)',
                      fontWeight: isToday || hasEvents ? 700 : 400,
                    }}
                  >
                    {day}
                  </span>
                </div>
                {/* Status dots */}
                {hasEvents && (
                  <div className="flex gap-[2px] mt-[2px]">
                    {dayEvents.slice(0, 3).map((ev, idx) => (
                      <div
                        key={idx}
                        style={{
                          width: 4, height: 4, borderRadius: '50%',
                          background: isToday ? 'var(--bg)' : (CAL_STATUS_COLOR[ev.status] ?? 'var(--accent)'),
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected day panel */}
      {selectedDay && (
        <div style={{ borderTop: '1px solid var(--border)' }}>
          <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
            <p className="text-[11px] font-semibold capitalize" style={{ color: 'var(--text)' }}>
              {selectedLabel}
            </p>
            {selectedEvents.length > 0 && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                style={{ background: 'var(--bg3)', color: 'var(--muted2)' }}>
                {selectedEvents.length} evento{selectedEvents.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {selectedEvents.length > 0 ? (
            <div className="flex flex-col">
              {selectedEvents.map(ev => (
                <div
                  key={ev.id}
                  onClick={() => router.push(`/events/${ev.id}`)}
                  className="flex items-center gap-2.5 px-4 py-2.5 cursor-pointer transition-colors"
                  style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg3)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: CAL_STATUS_COLOR[ev.status] ?? 'var(--muted)' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold truncate" style={{ color: 'var(--text)' }}>{ev.title}</p>
                    <p className="text-[10px]" style={{ color: 'var(--muted2)' }}>
                      {CAL_TYPE_LABEL[ev.eventType] ?? ev.eventType} · {CAL_STATUS_LABEL[ev.status] ?? ev.status}
                    </p>
                  </div>
                  <span className="text-[11px]" style={{ color: 'var(--muted)' }}>→</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="px-4 py-2.5 text-[11px]" style={{ color: 'var(--muted)' }}>Sin eventos este día</p>
          )}

          <div className="flex gap-2 px-4 py-3">
            <button
              onClick={onNewEvent}
              className="flex-1 py-[7px] rounded-[var(--radius)] text-[11px] font-bold"
              style={{ background: 'var(--accent)', color: 'var(--bg)' }}
            >
              + Evento
            </button>
            <button
              onClick={() => router.push('/quotes/new')}
              className="flex-1 py-[7px] rounded-[var(--radius)] text-[11px] font-medium transition-colors"
              style={{ background: 'var(--bg3)', color: 'var(--muted2)', border: '1px solid var(--border)' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'var(--bg4)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted2)'; e.currentTarget.style.background = 'var(--bg3)' }}
            >
              + Cotización
            </button>
          </div>
        </div>
      )}

      {/* Default footer — sin día seleccionado */}
      {!selectedDay && (
        <div className="flex gap-2 px-4 py-3" style={{ borderTop: '1px solid var(--border)' }}>
          <button
            onClick={onNewEvent}
            className="flex-1 py-[7px] rounded-[var(--radius)] text-[11px] font-bold"
            style={{ background: 'var(--accent)', color: 'var(--bg)' }}
          >
            + Evento
          </button>
          <button
            onClick={() => router.push('/quotes/new')}
            className="flex-1 py-[7px] rounded-[var(--radius)] text-[11px] font-medium transition-colors"
            style={{ background: 'var(--bg3)', color: 'var(--muted2)', border: '1px solid var(--border)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'var(--bg4)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted2)'; e.currentTarget.style.background = 'var(--bg3)' }}
          >
            + Cotización
          </button>
        </div>
      )}
    </div>
  )
}

export default function DashboardShell({ artistName, stats, upcomingEvents, recentClients, calendarEvents, isNewUser, profileComplete }: Props) {
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

          {/* Mini calendario */}
          <MiniCalendar events={calendarEvents} onNewEvent={() => setShowEventModal(true)} />
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
