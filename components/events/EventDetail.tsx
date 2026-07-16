'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/utils/currency'

interface Quote {
  id: string
  quoteNumber: string
  status: string
  total: string
  currency: string
}

interface Event {
  id: string
  title: string
  eventType: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  startDate: string
  endDate: string
  timezone: string
  venue: string | null
  venueAddress: string | null
  city: string | null
  state: string | null
  venueLat: string | null
  venueLng: string | null
  price: string | null
  paidAmount: string
  currency: string
  internalNotes: string | null
  setlistNotes: string | null
  client: { id: string; name: string } | null
  quotes: Quote[]
}

const TYPE_LABEL: Record<string, string> = {
  wedding: 'Boda', corporate: 'Corporativo', birthday: 'Cumpleaños',
  quinceanera: 'Quinceañera', club: 'Club / Bar', private: 'Privado', other: 'Otro',
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending:   { label: 'Pendiente',  color: '#f59e0b' },
  confirmed: { label: 'Confirmado', color: '#c8ff00' },
  completed: { label: 'Completado', color: '#22c55e' },
  cancelled: { label: 'Cancelado',  color: '#ef4444' },
}
const DEFAULT_STATUS = { label: 'Desconocido', color: 'var(--muted2)' }

const STATUS_TRANSITIONS: Record<string, { label: string; next: string }[]> = {
  pending:   [{ label: 'Confirmar', next: 'confirmed' }, { label: 'Cancelar', next: 'cancelled' }],
  confirmed: [{ label: 'Marcar completado', next: 'completed' }, { label: 'Cancelar', next: 'cancelled' }],
  completed: [],
  cancelled: [{ label: 'Reactivar', next: 'pending' }],
}

const QUOTE_STATUS_COLOR: Record<string, string> = {
  draft: 'var(--muted2)', sent: '#60a5fa', accepted: '#22c55e', rejected: '#ef4444', expired: '#f59e0b',
}
const QUOTE_STATUS_LABEL: Record<string, string> = {
  draft: 'Borrador', sent: 'Enviado', accepted: 'Aceptado', rejected: 'Rechazado', expired: 'Expirado',
}

function formatDT(iso: string, tz: string) {
  return new Date(iso).toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: tz,
  })
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-[11px] font-medium" style={{ color: 'var(--muted)' }}>{label}</dt>
      <dd className="text-[13px]" style={{ color: 'var(--text)' }}>{value ?? '—'}</dd>
    </div>
  )
}

export default function EventDetail({ event: initial }: { event: Event }) {
  const router = useRouter()
  const [event, setEvent] = useState(initial)
  const [deleting, setDeleting] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const paid = Number(event.paidAmount)
  const price = Number(event.price ?? 0)
  const paidPct = price > 0 ? Math.min(100, Math.round((paid / price) * 100)) : 0
  const cfg = STATUS_CONFIG[event.status] ?? DEFAULT_STATUS
  const transitions = STATUS_TRANSITIONS[event.status] ?? []

  async function changeStatus(next: string) {
    setUpdatingStatus(true)
    const res = await fetch(`/api/events/${event.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
    if (res.ok) {
      const json = await res.json()
      setEvent((prev) => ({ ...prev, status: json.data.status }))
    }
    setUpdatingStatus(false)
  }

  async function handleDelete() {
    if (!deleting) { setDeleting(true); return }
    const res = await fetch(`/api/events/${event.id}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/events')
      router.refresh()
    }
  }

  return (
    <div className="max-w-[900px] mx-auto flex flex-col gap-6">
      {/* Back */}
      <button
        onClick={() => router.push('/events')}
        className="flex items-center gap-2 text-[13px] font-medium w-fit hover:opacity-70 transition-opacity"
        style={{ color: 'var(--muted2)' }}
      >
        ← Eventos
      </button>

      {/* Header */}
      <div
        className="rounded-xl p-6 flex flex-col gap-4"
        style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className="text-[11px] px-2 py-0.5 rounded-[5px]"
                style={{ background: 'var(--bg3)', color: 'var(--muted2)' }}
              >
                {TYPE_LABEL[event.eventType] ?? event.eventType}
              </span>
              <span
                className="text-[11px] font-bold px-2 py-0.5 rounded-[5px] uppercase tracking-[0.5px]"
                style={{ background: `${cfg.color}20`, color: cfg.color }}
              >
                {cfg.label}
              </span>
            </div>
            <h1 className="text-[22px] font-extrabold tracking-[-0.5px]" style={{ color: 'var(--text)' }}>
              {event.title}
            </h1>
            <p className="text-[13px] capitalize" style={{ color: 'var(--muted2)' }}>
              {formatDT(event.startDate, event.timezone)}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {transitions.map((t) => (
              <button
                key={t.next}
                onClick={() => changeStatus(t.next)}
                disabled={updatingStatus}
                className="px-3 py-[7px] rounded-[var(--radius)] text-[12px] font-medium disabled:opacity-50 transition-colors"
                style={{
                  background: t.next === 'cancelled' ? 'rgba(239,68,68,0.1)' : 'var(--bg3)',
                  color: t.next === 'cancelled' ? '#ef4444' : 'var(--text)',
                  border: `1px solid ${t.next === 'cancelled' ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`,
                }}
              >
                {t.label}
              </button>
            ))}
            <button
              onClick={handleDelete}
              className="px-3 py-[7px] rounded-[var(--radius)] text-[12px] font-medium transition-all"
              style={{
                background: deleting ? 'rgba(239,68,68,0.15)' : 'var(--bg3)',
                color: deleting ? '#ef4444' : 'var(--muted2)',
                border: `1px solid ${deleting ? '#ef4444' : 'var(--border)'}`,
              }}
            >
              {deleting ? 'Confirmar eliminación' : 'Eliminar'}
            </button>
            {deleting && (
              <button
                onClick={() => setDeleting(false)}
                className="px-3 py-[7px] rounded-[var(--radius)] text-[12px] font-medium"
                style={{ background: 'var(--bg3)', color: 'var(--muted2)', border: '1px solid var(--border)' }}
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Barra de pago */}
        {event.price && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[12px]">
              <span style={{ color: 'var(--muted2)' }}>
                Cobrado: <strong style={{ color: 'var(--text)' }}>{formatCurrency(paid)}</strong>
                {' '}de{' '}
                <strong style={{ color: 'var(--text)' }}>{formatCurrency(price)}</strong>
              </span>
              <span style={{ color: paidPct === 100 ? '#22c55e' : 'var(--muted2)' }}>
                {paidPct}%
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg4)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${paidPct}%`,
                  background: paidPct === 100 ? '#22c55e' : 'var(--accent)',
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-[1fr_1fr] gap-4">
        {/* Detalles */}
        <div
          className="rounded-xl p-5 flex flex-col gap-4"
          style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
        >
          <h2 className="text-[13px] font-bold uppercase tracking-[0.8px]" style={{ color: 'var(--muted)' }}>
            Detalles
          </h2>
          <dl className="flex flex-col gap-3">
            <InfoRow label="Inicio" value={formatDT(event.startDate, event.timezone)} />
            <InfoRow label="Fin" value={formatDT(event.endDate, event.timezone)} />
            {event.venue && <InfoRow label="Venue" value={event.venue} />}
            {event.venueAddress && <InfoRow label="Dirección" value={event.venueAddress} />}
            {(event.city || event.state) && (
              <InfoRow label="Ubicación" value={[event.city, event.state].filter(Boolean).join(', ')} />
            )}
            {(event.venueLat && event.venueLng
              ? `${event.venueLat},${event.venueLng}`
              : [event.venue, event.city, event.state].filter(Boolean).join(', ')
            ) && (
              <InfoRow
                label="Mapa"
                value={
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${
                      event.venueLat && event.venueLng
                        ? `${event.venueLat},${event.venueLng}`
                        : encodeURIComponent([event.venue, event.city, event.state].filter(Boolean).join(', '))
                    }`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[13px] font-semibold"
                    style={{ color: 'var(--accent)' }}
                  >
                    📍 Cómo llegar
                  </a>
                }
              />
            )}
            {event.client && (
              <InfoRow
                label="Cliente"
                value={
                  <button
                    onClick={() => router.push(`/clients/${event.client!.id}`)}
                    className="text-[13px] font-medium hover:underline"
                    style={{ color: 'var(--accent)' }}
                  >
                    {event.client.name}
                  </button>
                }
              />
            )}
            {event.price && (
              <InfoRow label="Precio total" value={formatCurrency(Number(event.price), event.currency as 'MXN' | 'USD')} />
            )}
          </dl>

          {event.internalNotes && (
            <div className="flex flex-col gap-1 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
              <span className="text-[11px] font-medium" style={{ color: 'var(--muted)' }}>
                Notas internas
              </span>
              <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text)' }}>
                {event.internalNotes}
              </p>
            </div>
          )}

          {event.setlistNotes && (
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-medium" style={{ color: 'var(--muted)' }}>
                Setlist / Repertorio
              </span>
              <p className="text-[13px] leading-relaxed whitespace-pre-line" style={{ color: 'var(--text)' }}>
                {event.setlistNotes}
              </p>
            </div>
          )}
        </div>

        {/* Cotizaciones */}
        <div
          className="rounded-xl p-5 flex flex-col gap-3"
          style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
        >
          <h2 className="text-[13px] font-bold uppercase tracking-[0.8px]" style={{ color: 'var(--muted)' }}>
            Cotizaciones
          </h2>
          {event.quotes.length === 0 ? (
            <p className="text-[13px]" style={{ color: 'var(--muted)' }}>
              Sin cotizaciones para este evento
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {event.quotes.map((q) => (
                <div
                  key={q.id}
                  className="flex items-center justify-between py-2"
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <div>
                    <span className="font-mono text-[12px] font-medium" style={{ color: 'var(--text)' }}>
                      #{q.quoteNumber}
                    </span>
                    <div>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-[5px]"
                        style={{
                          background: `${QUOTE_STATUS_COLOR[q.status]}20`,
                          color: QUOTE_STATUS_COLOR[q.status],
                        }}
                      >
                        {QUOTE_STATUS_LABEL[q.status]}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-[13px] font-bold" style={{ color: 'var(--text)' }}>
                    {formatCurrency(Number(q.total))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
