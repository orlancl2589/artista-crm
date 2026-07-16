'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreateEventSchema, type CreateEventInput } from '@/lib/validations/event.schema'
import VenueAutocomplete, { type VenuePlaceResult } from '@/components/shared/VenueAutocomplete'

interface Client {
  id: string
  name: string
}

interface Props {
  open: boolean
  onClose: () => void
  onCreated: () => void
  defaultClientId?: string
  initialDate?: string // YYYY-MM-DD, pre-fills start/end date
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

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-medium" style={{ color: 'var(--muted2)' }}>
        {label}
      </label>
      {children}
      {error && (
        <span className="text-[11px]" style={{ color: '#ef4444' }}>
          {error}
        </span>
      )}
    </div>
  )
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

export default function NewEventModal({ open, onClose, onCreated, defaultClientId, initialDate }: Props) {
  const [clients, setClients] = useState<Client[]>([])
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateEventInput>({
    resolver: zodResolver(CreateEventSchema),
    defaultValues: {
      eventType: 'wedding',
      timezone: 'America/Mexico_City',
      currency: 'MXN',
      clientId: defaultClientId,
    },
  })

  useEffect(() => {
    if (!open) return
    fetch('/api/clients?limit=100')
      .then((r) => r.json())
      .then((j) => setClients(j.data ?? []))
      .catch(() => {})
  }, [open])

  const handlePlaceSelect = useCallback((place: VenuePlaceResult) => {
    setValue('venue', place.venue)
    setValue('venueAddress', place.venueAddress)
    setValue('city', place.city)
    setValue('state', place.state)
    setValue('venueLat', place.venueLat)
    setValue('venueLng', place.venueLng)
  }, [setValue])

  const watchedType = watch('eventType')

  if (!open) return null

  async function onSubmit(data: CreateEventInput) {
    setServerError('')
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) {
        setServerError(json.error ?? 'Error al crear evento')
        return
      }
      reset()
      onCreated()
      onClose()
    } catch {
      setServerError('Error de conexión')
    }
  }

  function handleClose() {
    reset()
    setServerError('')
    onClose()
  }

  function nowPlus(hours: number) {
    const d = new Date()
    d.setHours(d.getHours() + hours, 0, 0, 0)
    return d.toISOString().slice(0, 16)
  }

  const startDefault = initialDate ? `${initialDate}T18:00` : nowPlus(24)
  const endDefault = initialDate ? `${initialDate}T22:00` : nowPlus(28)

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
          <h2 className="text-[17px] font-bold" style={{ color: 'var(--text)' }}>
            Nuevo evento
          </h2>
          <button
            onClick={handleClose}
            className="w-7 h-7 rounded-md flex items-center justify-center text-[16px]"
            style={{ color: 'var(--muted2)', background: 'var(--bg3)' }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Título */}
          <Field label="Nombre del evento *" error={errors.title?.message}>
            <input
              {...register('title')}
              placeholder="Boda García-López, Corporativo TechConf..."
              style={inputStyle}
            />
          </Field>

          {/* Tipo */}
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

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Fecha y hora inicio *" error={errors.startDate?.message}>
              <input
                {...register('startDate')}
                type="datetime-local"
                defaultValue={startDefault}
                style={{ ...inputStyle, colorScheme: 'dark' }}
              />
            </Field>
            <Field label="Fecha y hora fin *" error={errors.endDate?.message}>
              <input
                {...register('endDate')}
                type="datetime-local"
                defaultValue={endDefault}
                style={{ ...inputStyle, colorScheme: 'dark' }}
              />
            </Field>
          </div>

          {/* Cliente */}
          <Field label="Cliente (opcional)">
            <select {...register('clientId')} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="">Sin cliente asignado</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>

          {/* Venue con Google Maps Autocomplete */}
          <Field label="Venue / Lugar" error={errors.venue?.message}>
            <VenueAutocomplete onPlaceSelect={handlePlaceSelect} />
          </Field>
          {/* Campos ocultos registrados para que RHF los incluya en el submit */}
          <input type="hidden" {...register('venue')} />
          <input type="hidden" {...register('venueAddress')} />
          <input type="hidden" {...register('venueLat', { valueAsNumber: true })} />
          <input type="hidden" {...register('venueLng', { valueAsNumber: true })} />

          {/* Ciudad / Estado (auto-llenado por Maps, editable manualmente) */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ciudad">
              <input {...register('city')} placeholder="CDMX" style={inputStyle} />
            </Field>
            <Field label="Estado">
              <input {...register('state')} placeholder="Ciudad de México" style={inputStyle} />
            </Field>
          </div>

          {/* Precio */}
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <Field label="Precio (MXN)">
              <input
                {...register('price', { valueAsNumber: true })}
                type="number"
                min="0"
                step="100"
                placeholder="15000"
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

          {/* Notas */}
          <Field label="Notas internas">
            <textarea
              {...register('internalNotes')}
              rows={2}
              placeholder="Requerimientos especiales, accesos..."
              style={{ ...inputStyle, resize: 'none' }}
            />
          </Field>

          {serverError && (
            <div
              className="text-[12px] px-3 py-2 rounded-[var(--radius)]"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
            >
              {serverError}
            </div>
          )}

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
              disabled={isSubmitting}
              className="flex-1 py-[10px] rounded-[var(--radius)] text-[13px] font-bold disabled:opacity-50"
              style={{ background: 'var(--accent)', color: 'var(--bg)' }}
            >
              {isSubmitting ? 'Guardando...' : 'Crear evento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
