'use client'

import { useEffect, useState } from 'react'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { CreateQuoteSchema, type CreateQuoteInput } from '@/lib/validations/quote.schema'
import { formatCurrency } from '@/lib/utils/currency'

interface SelectOption { id: string; name: string }
interface EventOption { id: string; title: string; clientId: string | null }

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

const PRESET_ITEMS = [
  { description: 'Presentación musical (4 horas)', quantity: 1, unitPrice: 15000 },
  { description: 'Hora adicional', quantity: 1, unitPrice: 3000 },
  { description: 'Equipo de sonido', quantity: 1, unitPrice: 5000 },
  { description: 'Iluminación', quantity: 1, unitPrice: 3500 },
  { description: 'Traslado', quantity: 1, unitPrice: 1200 },
]

export default function QuoteBuilder() {
  const router = useRouter()
  const [clients, setClients] = useState<SelectOption[]>([])
  const [events, setEvents] = useState<EventOption[]>([])
  const [taxPct, setTaxPct] = useState(0)
  const [serverError, setServerError] = useState('')

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateQuoteInput>({
    resolver: zodResolver(CreateQuoteSchema),
    defaultValues: {
      lineItems: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
      tax: 0,
      currency: 'MXN',
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'lineItems' })
  const lineItems = useWatch({ control, name: 'lineItems' })
  const selectedClientId = watch('clientId')

  useEffect(() => {
    fetch('/api/clients?limit=100').then(r => r.json()).then(j => setClients(j.data ?? []))
    fetch('/api/events?limit=100').then(r => r.json()).then(j => setEvents(j.data ?? []))
  }, [])

  // Recalcular total de cada línea cuando cambia qty o price
  useEffect(() => {
    lineItems?.forEach((item, i) => {
      const calculated = (item.quantity ?? 0) * (item.unitPrice ?? 0)
      if (calculated !== item.total) {
        setValue(`lineItems.${i}.total`, calculated)
      }
    })
  }, [lineItems, setValue])

  const subtotal = lineItems?.reduce((s, item) => s + (item.total ?? 0), 0) ?? 0
  const taxAmount = Math.round((subtotal * taxPct) / 100 * 100) / 100
  const total = subtotal + taxAmount

  // Sincronizar tax amount al schema
  useEffect(() => { setValue('tax', taxAmount) }, [taxAmount, setValue])

  const filteredEvents = selectedClientId
    ? events.filter(e => e.clientId === selectedClientId)
    : events

  function addPreset(preset: typeof PRESET_ITEMS[0]) {
    append({ ...preset, total: preset.quantity * preset.unitPrice })
  }

  async function onSubmit(data: CreateQuoteInput) {
    setServerError('')
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) { setServerError(json.error ?? 'Error al crear cotización'); return }
      router.push(`/quotes/${json.data.id}`)
      router.refresh()
    } catch {
      setServerError('Error de conexión')
    }
  }

  return (
    <div className="max-w-[860px] mx-auto flex flex-col gap-6">
      {/* Back */}
      <button
        onClick={() => router.push('/quotes')}
        className="flex items-center gap-2 text-[13px] font-medium w-fit hover:opacity-70 transition-opacity"
        style={{ color: 'var(--muted2)' }}
      >
        ← Cotizaciones
      </button>

      <h1 className="text-[22px] font-extrabold tracking-[-0.5px]" style={{ color: 'var(--text)' }}>
        Nueva cotización
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Cliente + Evento */}
        <div
          className="rounded-xl p-5 flex flex-col gap-4"
          style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
        >
          <h2 className="text-[12px] font-bold uppercase tracking-[0.8px]" style={{ color: 'var(--muted)' }}>
            Destinatario
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium" style={{ color: 'var(--muted2)' }}>Cliente</label>
              <select {...register('clientId')} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">Sin cliente</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium" style={{ color: 'var(--muted2)' }}>Evento (opcional)</label>
              <select {...register('eventId')} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">Sin evento</option>
                {filteredEvents.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Conceptos */}
        <div
          className="rounded-xl p-5 flex flex-col gap-4"
          style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-[12px] font-bold uppercase tracking-[0.8px]" style={{ color: 'var(--muted)' }}>
              Conceptos
            </h2>
            {/* Presets */}
            <div className="relative group">
              <button
                type="button"
                className="text-[12px] px-3 py-1.5 rounded-[var(--radius)] font-medium"
                style={{ background: 'var(--bg3)', color: 'var(--muted2)', border: '1px solid var(--border)' }}
              >
                Agregar preset ▾
              </button>
              <div
                className="absolute right-0 top-full mt-1 w-[240px] rounded-xl py-1 z-10 hidden group-focus-within:block group-hover:block"
                style={{ background: 'var(--bg3)', border: '1px solid var(--border)' }}
              >
                {PRESET_ITEMS.map((p) => (
                  <button
                    key={p.description}
                    type="button"
                    onClick={() => addPreset(p)}
                    className="w-full text-left px-4 py-2 text-[12px] hover:bg-[var(--bg4)] transition-colors"
                    style={{ color: 'var(--text)' }}
                  >
                    <div>{p.description}</div>
                    <div className="font-mono text-[10px]" style={{ color: 'var(--muted2)' }}>
                      {formatCurrency(p.unitPrice)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Header tabla */}
          <div className="grid gap-2" style={{ gridTemplateColumns: '1fr 80px 110px 110px 36px' }}>
            {['Descripción', 'Cant.', 'Precio unit.', 'Total', ''].map(h => (
              <span key={h} className="text-[10px] font-semibold uppercase tracking-[0.6px]" style={{ color: 'var(--muted)' }}>
                {h}
              </span>
            ))}
          </div>

          {/* Filas */}
          {fields.map((field, i) => (
            <div key={field.id} className="grid gap-2 items-center" style={{ gridTemplateColumns: '1fr 80px 110px 110px 36px' }}>
              <input
                {...register(`lineItems.${i}.description`)}
                placeholder="Descripción del servicio"
                style={{ ...inputStyle, borderColor: errors.lineItems?.[i]?.description ? '#ef4444' : 'var(--border)' }}
              />
              <input
                {...register(`lineItems.${i}.quantity`, { valueAsNumber: true })}
                type="number"
                min="1"
                step="1"
                style={inputStyle}
              />
              <input
                {...register(`lineItems.${i}.unitPrice`, { valueAsNumber: true })}
                type="number"
                min="0"
                step="100"
                placeholder="0"
                style={inputStyle}
              />
              <div
                className="px-3 py-2 rounded-[var(--radius)] text-right font-mono text-[13px] font-medium"
                style={{ background: 'var(--bg4)', color: 'var(--text)' }}
              >
                {formatCurrency(lineItems?.[i]?.total ?? 0)}
              </div>
              <button
                type="button"
                onClick={() => fields.length > 1 && remove(i)}
                disabled={fields.length === 1}
                className="w-8 h-8 rounded-[var(--radius)] flex items-center justify-center text-[16px] disabled:opacity-30 transition-colors"
                style={{ background: 'var(--bg3)', color: 'var(--muted2)' }}
              >
                ×
              </button>
            </div>
          ))}

          {errors.lineItems && (
            <p className="text-[11px]" style={{ color: '#ef4444' }}>
              {typeof errors.lineItems.message === 'string' ? errors.lineItems.message : 'Revisa los conceptos'}
            </p>
          )}

          <button
            type="button"
            onClick={() => append({ description: '', quantity: 1, unitPrice: 0, total: 0 })}
            className="flex items-center gap-2 text-[12px] font-medium w-fit py-1 transition-opacity hover:opacity-70"
            style={{ color: 'var(--accent)' }}
          >
            + Agregar concepto
          </button>

          {/* Totales */}
          <div
            className="flex flex-col gap-2 pt-3 ml-auto w-[280px]"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <div className="flex justify-between text-[13px]">
              <span style={{ color: 'var(--muted2)' }}>Subtotal</span>
              <span className="font-mono" style={{ color: 'var(--text)' }}>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[13px]" style={{ color: 'var(--muted2)' }}>IVA</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={taxPct}
                    onChange={e => setTaxPct(Number(e.target.value))}
                    className="w-14 text-center font-mono text-[12px]"
                    style={{ ...inputStyle, padding: '4px 8px' }}
                  />
                  <span className="text-[12px]" style={{ color: 'var(--muted2)' }}>%</span>
                </div>
              </div>
              <span className="font-mono text-[13px]" style={{ color: 'var(--muted2)' }}>
                {formatCurrency(taxAmount)}
              </span>
            </div>
            <div
              className="flex justify-between text-[15px] font-bold pt-2"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <span style={{ color: 'var(--text)' }}>Total</span>
              <span className="font-mono" style={{ color: 'var(--accent)' }}>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Condiciones */}
        <div
          className="rounded-xl p-5 grid grid-cols-2 gap-4"
          style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
        >
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium" style={{ color: 'var(--muted2)' }}>
              Válida hasta
            </label>
            <input
              {...register('validUntil')}
              type="datetime-local"
              style={{ ...inputStyle, colorScheme: 'dark' }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium" style={{ color: 'var(--muted2)' }}>Moneda</label>
            <select {...register('currency')} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="MXN">MXN — Peso mexicano</option>
              <option value="USD">USD — Dólar</option>
            </select>
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            <label className="text-[11px] font-medium" style={{ color: 'var(--muted2)' }}>Notas / Condiciones</label>
            <textarea
              {...register('notes')}
              rows={3}
              placeholder="Condiciones de pago, cancelación, rider técnico incluido..."
              style={{ ...inputStyle, resize: 'none' }}
            />
          </div>
        </div>

        {serverError && (
          <div
            className="text-[12px] px-4 py-3 rounded-[var(--radius)]"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
          >
            {serverError}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push('/quotes')}
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
            {isSubmitting ? 'Guardando...' : 'Crear cotización'}
          </button>
        </div>
      </form>
    </div>
  )
}
