'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import NewEventModal from './NewEventModal'
import { formatCurrency } from '@/lib/utils/currency'

interface Event {
  id: string
  title: string
  eventType: string
  status: string
  startDate: string
  endDate: string
  venue: string | null
  city: string | null
  price: string | null
  paidAmount: string
  currency: string
  client: { id: string; name: string } | null
}

interface Meta {
  total: number
  page: number
  limit: number
  pages: number
}

const TYPE_LABEL: Record<string, string> = {
  wedding: 'Boda', corporate: 'Corporativo', birthday: 'Cumpleaños',
  quinceanera: 'Quinceañera', club: 'Club', private: 'Privado', other: 'Otro',
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending:   { label: 'Pendiente',   color: '#f59e0b' },
  confirmed: { label: 'Confirmado',  color: '#c8ff00' },
  completed: { label: 'Completado',  color: '#22c55e' },
  cancelled: { label: 'Cancelado',   color: '#ef4444' },
}

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    + ' · '
    + d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: 'var(--muted2)' }
  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded-[5px] uppercase tracking-[0.5px]"
      style={{ background: `${cfg.color}20`, color: cfg.color }}
    >
      {cfg.label}
    </span>
  )
}

const STATUS_FILTERS = [
  { value: '', label: 'Todos' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'confirmed', label: 'Confirmados' },
  { value: 'completed', label: 'Completados' },
  { value: 'cancelled', label: 'Cancelados' },
]

export default function EventList() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 20, pages: 0 })
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [upcoming, setUpcoming] = useState(false)
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (status) params.set('status', status)
      if (upcoming) params.set('upcoming', 'true')
      const res = await fetch(`/api/events?${params}`)
      if (res.ok) {
        const json = await res.json()
        setEvents(json.data)
        setMeta(json.meta)
      }
    } finally {
      setLoading(false)
    }
  }, [status, upcoming, page])

  useEffect(() => { fetchEvents() }, [fetchEvents])
  useEffect(() => { setPage(1) }, [status, upcoming])

  // Stats de los eventos cargados
  const stats = events.reduce(
    (acc, e) => {
      acc.revenue += Number(e.price ?? 0)
      acc.collected += Number(e.paidAmount)
      return acc
    },
    { revenue: 0, collected: 0 }
  )

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-extrabold tracking-[-0.5px]" style={{ color: 'var(--text)' }}>
            Eventos
          </h1>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--muted2)' }}>
            {meta.total > 0 ? `${meta.total} eventos` : 'Sin eventos aún'}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-[9px] rounded-[var(--radius)] text-[13px] font-bold hover:opacity-90 transition-opacity"
          style={{ background: 'var(--accent)', color: 'var(--bg)' }}
        >
          + Nuevo evento
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex rounded-[var(--radius)] overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatus(f.value)}
              className="px-3 py-[7px] text-[12px] font-medium transition-colors"
              style={{
                background: status === f.value ? 'var(--bg4)' : 'var(--bg3)',
                color: status === f.value ? 'var(--text)' : 'var(--muted2)',
                borderRight: '1px solid var(--border)',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <div
            onClick={() => setUpcoming((u) => !u)}
            className="w-9 h-5 rounded-full relative transition-colors"
            style={{ background: upcoming ? 'var(--accent)' : 'var(--bg4)' }}
          >
            <div
              className="w-3.5 h-3.5 rounded-full absolute top-[3px] transition-all"
              style={{
                background: upcoming ? 'var(--bg)' : 'var(--muted2)',
                left: upcoming ? '18px' : '3px',
              }}
            />
          </div>
          <span className="text-[12px]" style={{ color: 'var(--muted2)' }}>
            Solo próximos
          </span>
        </label>
        {(status || upcoming) && (
          <button
            onClick={() => { setStatus(''); setUpcoming(false) }}
            className="text-[12px] px-2 py-1 rounded-md"
            style={{ color: 'var(--muted2)', background: 'var(--bg3)' }}
          >
            Limpiar filtros ×
          </button>
        )}
      </div>

      {/* Lista */}
      <div className="flex flex-col gap-2 flex-1">
        {loading ? (
          <div
            className="flex items-center justify-center h-40 rounded-xl"
            style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
          >
            <span className="text-[13px]" style={{ color: 'var(--muted2)' }}>Cargando...</span>
          </div>
        ) : events.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-40 rounded-xl gap-2"
            style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
          >
            <span className="text-[32px]">📅</span>
            <p className="text-[14px] font-medium" style={{ color: 'var(--text)' }}>
              {status || upcoming ? 'Sin resultados' : 'Agrega tu primer evento'}
            </p>
            {!status && !upcoming && (
              <button
                onClick={() => setShowModal(true)}
                className="text-[13px] font-medium"
                style={{ color: 'var(--accent)' }}
              >
                + Nuevo evento
              </button>
            )}
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              onClick={() => router.push(`/events/${event.id}`)}
              className="rounded-xl p-4 cursor-pointer transition-colors flex items-center gap-4"
              style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border2)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              {/* Fecha */}
              <div
                className="w-[52px] flex-shrink-0 flex flex-col items-center rounded-[8px] py-2"
                style={{ background: 'var(--bg3)' }}
              >
                <span className="font-mono text-[10px] font-semibold uppercase" style={{ color: 'var(--muted)' }}>
                  {new Date(event.startDate).toLocaleDateString('es-MX', { month: 'short' })}
                </span>
                <span className="text-[22px] font-extrabold leading-tight" style={{ color: 'var(--text)' }}>
                  {new Date(event.startDate).getDate()}
                </span>
                <span className="font-mono text-[10px]" style={{ color: 'var(--muted2)' }}>
                  {new Date(event.startDate).toLocaleDateString('es-MX', { weekday: 'short' })}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[14px] font-semibold truncate" style={{ color: 'var(--text)' }}>
                    {event.title}
                  </span>
                  <StatusBadge status={event.status} />
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className="text-[11px] px-2 py-0.5 rounded-[5px]"
                    style={{ background: 'var(--bg3)', color: 'var(--muted2)' }}
                  >
                    {TYPE_LABEL[event.eventType] ?? event.eventType}
                  </span>
                  <span className="text-[12px]" style={{ color: 'var(--muted2)' }}>
                    {new Date(event.startDate).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {(event.venue || event.city) && (
                    <span className="text-[12px]" style={{ color: 'var(--muted2)' }}>
                      📍 {[event.venue, event.city].filter(Boolean).join(', ')}
                    </span>
                  )}
                  {event.client && (
                    <span className="text-[12px]" style={{ color: 'var(--muted2)' }}>
                      👤 {event.client.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Precio */}
              {event.price && (
                <div className="flex-shrink-0 text-right">
                  <div className="font-mono text-[14px] font-bold" style={{ color: 'var(--text)' }}>
                    {formatCurrency(Number(event.price))}
                  </div>
                  {Number(event.paidAmount) > 0 && Number(event.paidAmount) < Number(event.price) && (
                    <div className="font-mono text-[11px]" style={{ color: 'var(--muted2)' }}>
                      cobrado {formatCurrency(Number(event.paidAmount))}
                    </div>
                  )}
                  {Number(event.paidAmount) >= Number(event.price) && (
                    <div className="text-[11px]" style={{ color: '#22c55e' }}>
                      ✓ Pagado
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {meta.pages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <span className="text-[12px]" style={{ color: 'var(--muted2)' }}>
            Página {meta.page} de {meta.pages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={meta.page === 1}
              className="px-3 py-1.5 rounded-[var(--radius)] text-[12px] font-medium disabled:opacity-40"
              style={{ background: 'var(--bg3)', color: 'var(--text)', border: '1px solid var(--border)' }}
            >
              ← Anterior
            </button>
            <button
              onClick={() => setPage((p) => Math.min(meta.pages, p + 1))}
              disabled={meta.page === meta.pages}
              className="px-3 py-1.5 rounded-[var(--radius)] text-[12px] font-medium disabled:opacity-40"
              style={{ background: 'var(--bg3)', color: 'var(--text)', border: '1px solid var(--border)' }}
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}

      <NewEventModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onCreated={fetchEvents}
      />
    </div>
  )
}
