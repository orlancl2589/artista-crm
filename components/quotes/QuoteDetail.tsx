'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/utils/currency'
import ConvertToEventModal from './ConvertToEventModal'

const QuotePDFButton = dynamic(() => import('./QuotePDFButton'), { ssr: false })

interface LineItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface Quote {
  id: string
  quoteNumber: string
  status: string
  lineItems: LineItem[]
  subtotal: string
  tax: string
  total: string
  currency: string
  eventDate: string | null
  eventEndDate: string | null
  eventStartTime: string | null
  eventEndTime: string | null
  validUntil: string | null
  notes: string | null
  pdfUrl: string | null
  generatedByAI: boolean
  createdAt: string
  client: { id: string; name: string } | null
  event: { id: string; title: string; startDate: string } | null
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft:    { label: 'Borrador',  color: 'var(--muted2)' },
  sent:     { label: 'Enviada',   color: '#60a5fa' },
  accepted: { label: 'Aceptada',  color: '#22c55e' },
  rejected: { label: 'Rechazada', color: '#ef4444' },
  expired:  { label: 'Expirada',  color: '#f59e0b' },
}
const DEFAULT_STATUS_CFG = { label: 'Borrador', color: 'var(--muted2)' }

const STATUS_TRANSITIONS: Record<string, { label: string; next: string; style?: 'primary' | 'danger' }[]> = {
  draft:    [{ label: 'Marcar como enviada', next: 'sent', style: 'primary' }],
  sent:     [
    { label: 'Marcar aceptada', next: 'accepted', style: 'primary' },
    { label: 'Marcar rechazada', next: 'rejected', style: 'danger' },
  ],
  accepted: [],
  rejected: [{ label: 'Reabrir como borrador', next: 'draft' }],
  expired:  [],
}

export default function QuoteDetail({ quote: initial, artistName, artistLogoUrl }: { quote: Quote; artistName: string; artistLogoUrl: string | null }) {
  const router = useRouter()
  const [quote, setQuote] = useState(initial)
  const [deleting, setDeleting] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [convertOpen, setConvertOpen] = useState(false)

  const cfg = STATUS_CONFIG[quote.status] ?? DEFAULT_STATUS_CFG
  const transitions = STATUS_TRANSITIONS[quote.status] ?? []
  const currency = quote.currency as 'MXN' | 'USD'

  async function changeStatus(next: string) {
    setUpdating(true)
    const res = await fetch(`/api/quotes/${quote.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
    if (res.ok) {
      const json = await res.json()
      setQuote(prev => ({ ...prev, status: json.data.status }))
    }
    setUpdating(false)
  }

  async function handleDelete() {
    if (!deleting) { setDeleting(true); return }
    const res = await fetch(`/api/quotes/${quote.id}`, { method: 'DELETE' })
    if (res.ok) { router.push('/quotes'); router.refresh() }
  }

  return (
    <div className="max-w-[760px] mx-auto flex flex-col gap-6">
      {/* Back */}
      <button
        onClick={() => router.push('/quotes')}
        className="flex items-center gap-2 text-[13px] font-medium w-fit hover:opacity-70 transition-opacity"
        style={{ color: 'var(--muted2)' }}
      >
        ← Cotizaciones
      </button>

      {/* Header */}
      <div
        className="rounded-xl p-6 flex flex-col gap-3"
        style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[22px] font-extrabold tracking-[-0.5px]" style={{ color: 'var(--text)' }}>
                {quote.quoteNumber}
              </span>
              <span
                className="text-[11px] font-bold px-2 py-0.5 rounded-[5px] uppercase tracking-[0.5px]"
                style={{ background: `${cfg.color}20`, color: cfg.color }}
              >
                {cfg.label}
              </span>
              {quote.generatedByAI && (
                <span className="text-[10px] px-2 py-0.5 rounded-[5px]"
                  style={{ background: 'rgba(147,51,234,0.15)', color: '#a855f7' }}>
                  Generada por IA
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-[13px]" style={{ color: 'var(--muted2)' }}>
              <span>
                {new Date(quote.createdAt).toLocaleDateString('es-MX', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </span>
              {quote.validUntil && (
                <span style={{ color: new Date(quote.validUntil) < new Date() ? '#f59e0b' : 'var(--muted2)' }}>
                  Válida hasta{' '}
                  {new Date(quote.validUntil).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              )}
            </div>
            {(quote.client || quote.event) && (
              <div className="flex items-center gap-3 text-[13px]">
                {quote.client && (
                  <button
                    onClick={() => router.push(`/clients/${quote.client!.id}`)}
                    className="font-medium hover:underline"
                    style={{ color: 'var(--accent)' }}
                  >
                    👤 {quote.client.name}
                  </button>
                )}
                {quote.event && (
                  <button
                    onClick={() => router.push(`/events/${quote.event!.id}`)}
                    className="hover:underline"
                    style={{ color: 'var(--muted2)' }}
                  >
                    📅 {quote.event.title}
                  </button>
                )}
              </div>
            )}
          {/* Fecha y horario del evento */}
          {(quote.eventDate || quote.eventStartTime) && (
            <div className="flex items-center gap-2 text-[13px] flex-wrap" style={{ color: 'var(--muted2)' }}>
              <span>📅</span>
              {quote.eventDate && (
                <span>
                  {new Date(quote.eventDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                  {quote.eventEndDate && quote.eventEndDate !== quote.eventDate && (
                    <> — {new Date(quote.eventEndDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</>
                  )}
                </span>
              )}
              {(quote.eventStartTime || quote.eventEndTime) && (
                <span style={{ color: 'var(--muted)' }}>
                  {quote.eventStartTime}
                  {quote.eventEndTime && ` – ${quote.eventEndTime}`}
                  {' hrs'}
                </span>
              )}
            </div>
          )}
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2 flex-wrap">
            <QuotePDFButton
              quoteNumber={quote.quoteNumber}
              createdAt={quote.createdAt}
              validUntil={quote.validUntil}
              artistName={artistName}
              artistLogoUrl={artistLogoUrl}
              clientName={quote.client?.name ?? null}
              eventTitle={quote.event?.title ?? null}
              eventDate={quote.eventDate}
              eventEndDate={quote.eventEndDate}
              eventStartTime={quote.eventStartTime}
              eventEndTime={quote.eventEndTime}
              lineItems={quote.lineItems}
              subtotal={quote.subtotal}
              tax={quote.tax}
              total={quote.total}
              currency={quote.currency}
              notes={quote.notes}
            />
            {/* Convertir en evento — solo si aceptada y sin evento vinculado */}
            {quote.status === 'accepted' && !quote.event && (
              <button
                onClick={() => setConvertOpen(true)}
                className="px-3 py-[7px] rounded-[var(--radius)] text-[12px] font-bold transition-colors"
                style={{ background: 'var(--accent)', color: 'var(--bg)' }}
              >
                📅 Convertir en Evento
              </button>
            )}
            {transitions.map(t => (
              <button
                key={t.next}
                onClick={() => changeStatus(t.next)}
                disabled={updating}
                className="px-3 py-[7px] rounded-[var(--radius)] text-[12px] font-medium disabled:opacity-50 transition-colors"
                style={{
                  background: t.style === 'primary'
                    ? 'var(--accent)'
                    : t.style === 'danger'
                    ? 'rgba(239,68,68,0.1)'
                    : 'var(--bg3)',
                  color: t.style === 'primary'
                    ? 'var(--bg)'
                    : t.style === 'danger'
                    ? '#ef4444'
                    : 'var(--text)',
                  border: t.style === 'danger' ? '1px solid rgba(239,68,68,0.3)' : 'none',
                }}
              >
                {t.label}
              </button>
            ))}
            {quote.status !== 'accepted' && (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>

      {/* Conceptos */}
      <div
        className="rounded-xl overflow-x-auto"
        style={{ border: '1px solid var(--border)' }}
      >
        <div
          className="px-5 py-3"
          style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}
        >
          <span className="text-[12px] font-bold uppercase tracking-[0.8px]" style={{ color: 'var(--muted)' }}>
            Conceptos
          </span>
        </div>

        <table className="w-full" style={{ background: 'var(--bg2)' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>
              {['Descripción', 'Cant.', 'Precio unitario', 'Total'].map(h => (
                <th
                  key={h}
                  className="px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.6px]"
                  style={{ color: 'var(--muted)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {quote.lineItems.map((item, i) => (
              <tr
                key={i}
                style={{ borderBottom: i < quote.lineItems.length - 1 ? '1px solid var(--border)' : 'none' }}
              >
                <td className="px-5 py-3 text-[13px]" style={{ color: 'var(--text)' }}>
                  {item.description}
                </td>
                <td className="px-5 py-3 text-[13px] text-center" style={{ color: 'var(--muted2)' }}>
                  {item.quantity}
                </td>
                <td className="px-5 py-3 font-mono text-[13px]" style={{ color: 'var(--muted2)' }}>
                  {formatCurrency(item.unitPrice, currency)}
                </td>
                <td className="px-5 py-3 font-mono text-[13px] font-bold" style={{ color: 'var(--text)' }}>
                  {formatCurrency(item.total, currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totales */}
        <div
          className="px-5 py-4 flex flex-col gap-2 ml-auto"
          style={{ background: 'var(--bg3)', borderTop: '1px solid var(--border)' }}
        >
          <div className="flex justify-end gap-12 text-[13px]">
            <span style={{ color: 'var(--muted2)' }}>Subtotal</span>
            <span className="font-mono w-[120px] text-right" style={{ color: 'var(--text)' }}>
              {formatCurrency(Number(quote.subtotal), currency)}
            </span>
          </div>
          {Number(quote.tax) > 0 && (
            <div className="flex justify-end gap-12 text-[13px]">
              <span style={{ color: 'var(--muted2)' }}>IVA</span>
              <span className="font-mono w-[120px] text-right" style={{ color: 'var(--muted2)' }}>
                {formatCurrency(Number(quote.tax), currency)}
              </span>
            </div>
          )}
          <div className="flex justify-end gap-12 text-[16px] font-bold pt-2"
            style={{ borderTop: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text)' }}>Total</span>
            <span className="font-mono w-[120px] text-right" style={{ color: 'var(--accent)' }}>
              {formatCurrency(Number(quote.total), currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Notas */}
      {quote.notes && (
        <div
          className="rounded-xl p-5 flex flex-col gap-2"
          style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
        >
          <h2 className="text-[12px] font-bold uppercase tracking-[0.8px]" style={{ color: 'var(--muted)' }}>
            Notas y condiciones
          </h2>
          <p className="text-[13px] leading-relaxed whitespace-pre-line" style={{ color: 'var(--text)' }}>
            {quote.notes}
          </p>
        </div>
      )}

      <ConvertToEventModal
        open={convertOpen}
        onClose={() => setConvertOpen(false)}
        quoteId={quote.id}
        quoteTotal={quote.total}
        quoteCurrency={quote.currency}
        clientId={quote.client?.id ?? null}
        clientName={quote.client?.name ?? null}
      />
    </div>
  )
}
