'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UpdateEventSchema, type UpdateEventInput } from '@/lib/validations/event.schema'
import VenueAutocomplete, { type VenuePlaceResult } from '@/components/shared/VenueAutocomplete'

interface Client { id: string; name: string }

interface EventData {
  id: string
  title: string
  eventType: string
  startDate: string
  endDate: string
  timezone: string
  clientId?: string | null
  venue: string | null
  venueAddress: string | null
  city: string | null
  state: string | null
  price: string | null
  currency: string
  internalNotes: string | null
  client: { id: string; name: string } | null
}

interface Props {
  open: boolean
  event: EventData
  onClose: () => void
  onUpdated: (updated: Partial<EventData>) => void
}

const EVENT_TYPES = [
  { value: 'wedding', label: 'Boda' },
  { value: 'corporate', label: 'Corporativo' },
  { value: 'birthday', label: 'Cumpleaños' },
  { value: 'quinceanera', label: 'Quinceañera' },
  { value: 'club', label: 'Club / Bar' },
  { value: 'private', label: 'Privado' },
  { value: 'other', label: 'Otro' },
] as const

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-medium" style={{ color: 'var(--muted2)' }}>{label}</label>
      {children}
      {error && <span className="text-[11px]" style={{ color: '#ef4444' }}>{error}</span>}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px',
  borderRadius: 'var(--radius)',
  background: 'var(--bg3)', border: '1px solid var(--border)',
  color: 'var(--text)', fontSize: '13px', outline: 'none',
}

// Convierte ISO → formato datetime-local (YYYY-MM-DDTHH:mm)
function toLocal(iso: string) {
  return iso.slice(0, 16)
}

export default function EditEventModal({ open, event, onClose, onUpdated }: Props) {
  const [clients, setClients] = useState<Client[]>([])
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UpdateEventInput>({
    resolver: zodResolver(UpdateEventSchema),
  })

  const watchedType = watch('eventType')

  useEffect(() => {
    if (!open) return
    fetch('/api/clients?limit=100')
      .then((r) => r.json())
      .then((j) => setClients(j.data ?? []))
      .catch(() => {})
    reset({
      title: event.title,
      eventType: event.eventType as UpdateEventInput['eventType'],
      startDate: toLocal(event.startDate),
      endDate: toLocal(event.endDate),
      clientId: event.client?.id ?? undefined,
      venue: event.venue ?? undefined,
      venueAddress: event.venueAddress ?? undefined,
      city: event.city ?? undefined,
      state: event.state ?? undefined,
      price: event.price ? Number(event.price) : undefined,
      currency: event.currency,
      internalNotes: event.internalNotes ?? undefined,
    })
  }, [open, event, reset])

  const handlePlaceSelect = useCallback((place: VenuePlaceResult) => {
    setValue('venue', place.venue)
    setValue('venueAddress', place.venueAddress)
    setValue('city', place.city)
    setValue('state', place.state)
    setValue('venueLat', place.venueLat)
    setValue('venueLng', place.venueLng)
  }, [setValue])

  if (!open) return null

  async function onSubmit(data: UpdateEventInput) {
    setServerError('')
    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) { setServerError(json.error ?? 'Error al guardar'); return }
      onUpdated(json.data)
      onClose()
    } catch {
      setServerError('Error de conexión')
    }
  }

  function handleClose() { reset(); setServerError(''); onClose() }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        className="w-full max-w-[560px] rounded-xl p-6 flex flex-col gap-5 my-4"
        style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-bold" style={{ color: 'var(--text)' }}>Editar evento</h2>
          <button
            onClick={handleClose}
            className="w-7 h-7 rounded-md flex items-center justify-center text-[16px]"
            style={{ color: 'var(--muted2)', background: 'var(--bg3)' }}
          >×</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Field label="Nombre del evento *" error={errors.title?.message}>
            <input {...register('title')} style={inputStyle} />
          </Field>

          <Field label="Tipo de evento *" error={errors.eventType?.message}>
            <div className="flex flex-wrap gap-2">
              {EVENT_TYPES.map((t) => {
                const selected = watchedType === t.value
                return (
                  <label
                    key={t.value}
                    className="px-3 py-[6px] rounded-[20px] text-[12px] cursor-pointer transition-all"
                    style={{
                      border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                      color: selected ? 'var(--bg)' : 'var(--muted2)',
                      background: selected ? 'var(--accent)' : 'var(--bg3)',
                      fontWeight: selected ? 700 : 400,
                    }}
                  >
                    <input {...register('eventType')} type="radio" value={t.value} className="sr-only" />
                    {t.label}
                  </label>
                )
              })}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Fecha y hora inicio *" error={errors.startDate?.message}>
              <input {...register('startDate')} type="datetime-local" style={{ ...inputStyle, colorScheme: 'dark' }} />
            </Field>
            <Field label="Fecha y hora fin *" error={errors.endDate?.message}>
              <input {...register('endDate')} type="datetime-local" style={{ ...inputStyle, colorScheme: 'dark' }} />
            </Field>
          </div>

          <Field label="Cliente (opcional)">
            <select {...register('clientId')} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="">Sin cliente asignado</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Venue / Lugar">
            <VenueAutocomplete onPlaceSelect={handlePlaceSelect} />
            <input
              {...register('venue')}
              placeholder="Nombre del venue"
              style={{ ...inputStyle, marginTop: 6 }}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Ciudad">
              <input {...register('city')} style={inputStyle} />
            </Field>
            <Field label="Estado">
              <input {...register('state')} style={inputStyle} />
            </Field>
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-3">
            <Field label="Precio">
              <input
                {...register('price', { valueAsNumber: true })}
                type="number" min="0" step="100"
                style={inputStyle}
              />
            </Field>
            <Field label="Moneda">
              <select {...register('currency')} style={{ ...inputStyle, width: '80px', cursor: 'pointer' }}>
                <option value="MXN">MXN</option>
                <option value="USD">USD</option>
              </select>
            </Field>
          </div>

          <Field label="Notas internas">
            <textarea
              {...register('internalNotes')}
              rows={2}
              style={{ ...inputStyle, resize: 'none' }}
            />
          </Field>

          {serverError && (
            <div className="text-[12px] px-3 py-2 rounded-[var(--radius)]"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
              {serverError}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button" onClick={handleClose}
              className="flex-1 py-[10px] rounded-[var(--radius)] text-[13px] font-medium"
              style={{ background: 'var(--bg3)', color: 'var(--muted2)', border: '1px solid var(--border)' }}
            >Cancelar</button>
            <button
              type="submit" disabled={isSubmitting}
              className="flex-1 py-[10px] rounded-[var(--radius)] text-[13px] font-bold disabled:opacity-50"
              style={{ background: 'var(--accent)', color: 'var(--bg)' }}
            >{isSubmitting ? 'Guardando...' : 'Guardar cambios'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
