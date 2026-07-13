'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const EVENT_TYPES = [
  { value: 'wedding',     label: '💒 Boda' },
  { value: 'corporate',   label: '🏢 Corporativo' },
  { value: 'birthday',    label: '🎂 Cumpleaños' },
  { value: 'quinceanera', label: '👑 Quinceañera' },
  { value: 'club',        label: '🎧 Club / Bar' },
  { value: 'private',     label: '🏠 Privado' },
  { value: 'other',       label: '📅 Otro' },
]

interface Props {
  open: boolean
  onClose: () => void
  quoteId: string
  quoteTotal: string
  quoteCurrency: string
  clientId: string | null
  clientName: string | null
}

function nowPlus(hours: number) {
  const d = new Date()
  d.setHours(d.getHours() + hours, 0, 0, 0)
  return d.toISOString().slice(0, 16)
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: 'var(--radius)',
  background: 'var(--bg3)',
  border: '1px solid var(--border)',
  color: 'var(--text)',
  fontSize: '13px',
  outline: 'none',
}

export default function ConvertToEventModal({ open, onClose, quoteId, quoteTotal, quoteCurrency, clientId, clientName }: Props) {
  const router = useRouter()
  const defaultTitle = clientName ? `Evento — ${clientName}` : 'Nuevo evento'

  const [form, setForm] = useState({
    title: defaultTitle,
    eventType: 'other',
    startDate: nowPlus(24),
    endDate: nowPlus(28),
    venue: '',
    city: '',
    price: quoteTotal,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(key: keyof typeof form, val: string) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  function handleClose() {
    setError('')
    onClose()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // 1. Crear el evento
      const eventRes = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          eventType: form.eventType,
          startDate: new Date(form.startDate).toISOString(),
          endDate: new Date(form.endDate).toISOString(),
          venue: form.venue.trim() || undefined,
          city: form.city.trim() || undefined,
          price: form.price ? Number(form.price) : undefined,
          currency: quoteCurrency,
          clientId: clientId ?? undefined,
        }),
      })

      if (!eventRes.ok) {
        const json = await eventRes.json().catch(() => ({}))
        throw new Error(json.error ?? 'Error al crear el evento')
      }

      const eventJson = await eventRes.json()
      const newEventId: string = eventJson.data.id

      // 2. Vincular la cotización al evento recién creado
      await fetch(`/api/quotes/${quoteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: newEventId }),
      })

      // 3. Navegar al evento
      router.push(`/events/${newEventId}`)
      router.refresh()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        className="w-full max-w-[520px] rounded-2xl flex flex-col overflow-hidden"
        style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4"
          style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-[10px] font-bold uppercase tracking-[1.2px] px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e' }}
              >
                Cotización aceptada
              </span>
            </div>
            <h2 className="text-[16px] font-extrabold" style={{ color: 'var(--text)' }}>
              Convertir en Evento
            </h2>
            <p className="text-[12px] mt-0.5" style={{ color: 'var(--muted2)' }}>
              Crea un evento pre-cargado con los datos de esta cotización
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-[18px] w-8 h-8 flex items-center justify-center rounded-lg hover:opacity-70"
            style={{ color: 'var(--muted2)' }}
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[70vh]">

          {/* Título */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold uppercase tracking-[0.8px]" style={{ color: 'var(--muted2)' }}>
              Nombre del evento *
            </label>
            <input
              value={form.title}
              onChange={e => set('title', e.target.value)}
              required
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
          </div>

          {/* Tipo */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold uppercase tracking-[0.8px]" style={{ color: 'var(--muted2)' }}>
              Tipo de evento *
            </label>
            <div className="flex flex-wrap gap-2">
              {EVENT_TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => set('eventType', t.value)}
                  className="px-3 py-[6px] rounded-[20px] text-[12px] font-medium border transition-all"
                  style={{
                    background: form.eventType === t.value ? 'rgba(200,255,0,0.08)' : 'transparent',
                    borderColor: form.eventType === t.value ? 'var(--accent)' : 'var(--border)',
                    color: form.eventType === t.value ? 'var(--accent)' : 'var(--muted2)',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold uppercase tracking-[0.8px]" style={{ color: 'var(--muted2)' }}>
                Inicio *
              </label>
              <input
                type="datetime-local"
                required
                value={form.startDate}
                onChange={e => set('startDate', e.target.value)}
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold uppercase tracking-[0.8px]" style={{ color: 'var(--muted2)' }}>
                Fin *
              </label>
              <input
                type="datetime-local"
                required
                value={form.endDate}
                onChange={e => set('endDate', e.target.value)}
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              />
            </div>
          </div>

          {/* Lugar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold uppercase tracking-[0.8px]" style={{ color: 'var(--muted2)' }}>
                Venue
              </label>
              <input
                value={form.venue}
                onChange={e => set('venue', e.target.value)}
                placeholder="Salón, hotel, finca..."
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold uppercase tracking-[0.8px]" style={{ color: 'var(--muted2)' }}>
                Ciudad
              </label>
              <input
                value={form.city}
                onChange={e => set('city', e.target.value)}
                placeholder="CDMX, Monterrey..."
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              />
            </div>
          </div>

          {/* Precio (pre-cargado de la cotización) */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold uppercase tracking-[0.8px]" style={{ color: 'var(--muted2)' }}>
              Precio pactado ({quoteCurrency})
            </label>
            <div className="relative">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px]"
                style={{ color: 'var(--muted2)' }}
              >
                $
              </span>
              <input
                type="number"
                min="0"
                step="1"
                value={form.price}
                onChange={e => set('price', e.target.value)}
                style={{ ...inputStyle, paddingLeft: '24px' }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              />
            </div>
            <p className="text-[11px]" style={{ color: 'var(--muted2)' }}>
              Pre-cargado del total de la cotización — edítalo si hay diferencia
            </p>
          </div>

          {/* Cliente (info, no editable) */}
          {clientName && (
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-lg"
              style={{ background: 'var(--bg3)', border: '1px solid var(--border)' }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[14px] font-bold flex-shrink-0"
                style={{ background: 'var(--bg4)', color: 'var(--accent)' }}
              >
                {clientName[0]?.toUpperCase()}
              </div>
              <div>
                <div className="text-[12px] font-semibold" style={{ color: 'var(--text)' }}>
                  {clientName}
                </div>
                <div className="text-[11px]" style={{ color: 'var(--muted2)' }}>
                  El evento quedará vinculado a este cliente
                </div>
              </div>
            </div>
          )}

          {error && (
            <div
              className="px-4 py-3 rounded-lg text-[12px]"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              {error}
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-[10px] rounded-[var(--radius)] text-[13px] font-medium"
              style={{ background: 'var(--bg3)', color: 'var(--muted2)', border: '1px solid var(--border)' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-[10px] rounded-[var(--radius)] text-[13px] font-bold disabled:opacity-50 transition-opacity hover:opacity-90"
              style={{ background: 'var(--accent)', color: 'var(--bg)' }}
            >
              {loading ? 'Creando evento...' : 'Crear evento →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}