'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils/currency'

interface Quote {
  id: string
  quoteNumber: string
  status: string
  total: string
  currency: string
  validUntil: string | null
  generatedByAI: boolean
  createdAt: string
  client: { id: string; name: string } | null
  event: { id: string; title: string } | null
}

interface Meta { total: number; page: number; limit: number; pages: number }

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft:    { label: 'Borrador',  color: 'var(--muted2)' },
  sent:     { label: 'Enviada',   color: '#60a5fa' },
  accepted: { label: 'Aceptada',  color: '#22c55e' },
  rejected: { label: 'Rechazada', color: '#ef4444' },
  expired:  { label: 'Expirada',  color: '#f59e0b' },
}
const DEFAULT_STATUS_CFG = { label: 'Borrador', color: 'var(--muted2)' }

const STATUS_FILTERS = [
  { value: '', label: 'Todas' },
  { value: 'draft', label: 'Borradores' },
  { value: 'sent', label: 'Enviadas' },
  { value: 'accepted', label: 'Aceptadas' },
  { value: 'rejected', label: 'Rechazadas' },
]

function isExpired(validUntil: string | null) {
  return validUntil ? new Date(validUntil) < new Date() : false
}

export default function QuoteList() {
  const router = useRouter()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 20, pages: 0 })
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  const fetchQuotes = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (status) params.set('status', status)
      const res = await fetch(`/api/quotes?${params}`)
      if (res.ok) {
        const json = await res.json()
        setQuotes(json.data)
        setMeta(json.meta)
      }
    } finally {
      setLoading(false)
    }
  }, [status, page])

  useEffect(() => { fetchQuotes() }, [fetchQuotes])
  useEffect(() => { setPage(1) }, [status])

  // Suma de cotizaciones aceptadas
  const acceptedTotal = quotes
    .filter(q => q.status === 'accepted')
    .reduce((s, q) => s + Number(q.total), 0)

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-extrabold tracking-[-0.5px]" style={{ color: 'var(--text)' }}>
            Cotizaciones
          </h1>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--muted2)' }}>
            {meta.total > 0 ? `${meta.total} cotizaciones` : 'Sin cotizaciones aún'}
            {acceptedTotal > 0 && (
              <span style={{ color: '#22c55e' }}>
                {' '}· {formatCurrency(acceptedTotal)} aceptado
              </span>
            )}
          </p>
        </div>
        <Link
          href="/quotes/new"
          className="flex items-center gap-2 px-4 py-[9px] rounded-[var(--radius)] text-[13px] font-bold hover:opacity-90 transition-opacity"
          style={{ background: 'var(--accent)', color: 'var(--bg)' }}
        >
          + Nueva cotización
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex rounded-[var(--radius)] overflow-hidden w-fit" style={{ border: '1px solid var(--border)' }}>
        {STATUS_FILTERS.map(f => (
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

      {/* Tabla */}
      <div
        className="rounded-xl overflow-x-auto flex-1"
        style={{ border: '1px solid var(--border)', background: 'var(--bg2)' }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <span className="text-[13px]" style={{ color: 'var(--muted2)' }}>Cargando...</span>
          </div>
        ) : quotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2">
            <span className="text-[32px]">📄</span>
            <p className="text-[14px] font-medium" style={{ color: 'var(--text)' }}>
              {status ? 'Sin resultados' : 'Crea tu primera cotización'}
            </p>
            {!status && (
              <Link href="/quotes/new" className="text-[13px] font-medium" style={{ color: 'var(--accent)' }}>
                + Nueva cotización
              </Link>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Número', 'Cliente / Evento', 'Total', 'Estado', 'Válida hasta', 'Fecha'].map(h => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.8px]"
                    style={{ color: 'var(--muted)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {quotes.map((q, i) => {
                const cfg = STATUS_CONFIG[q.status] ?? DEFAULT_STATUS_CFG
                const expired = isExpired(q.validUntil) && q.status === 'sent'
                return (
                  <tr
                    key={q.id}
                    onClick={() => router.push(`/quotes/${q.id}`)}
                    className="cursor-pointer transition-colors"
                    style={{ borderBottom: i < quotes.length - 1 ? '1px solid var(--border)' : 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg3)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[13px] font-bold" style={{ color: 'var(--text)' }}>
                          {q.quoteNumber}
                        </span>
                        {q.generatedByAI && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-[4px]"
                            style={{ background: 'rgba(147,51,234,0.15)', color: '#a855f7' }}>
                            IA
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-[13px] font-medium" style={{ color: 'var(--text)' }}>
                        {q.client?.name ?? <span style={{ color: 'var(--muted)' }}>Sin cliente</span>}
                      </div>
                      {q.event && (
                        <div className="text-[11px]" style={{ color: 'var(--muted2)' }}>{q.event.title}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-[13px] font-bold" style={{ color: 'var(--accent)' }}>
                        {formatCurrency(Number(q.total), q.currency as 'MXN' | 'USD')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-[5px] uppercase tracking-[0.4px]"
                        style={{
                          background: `${expired ? '#f59e0b' : cfg.color}20`,
                          color: expired ? '#f59e0b' : cfg.color,
                        }}
                      >
                        {expired ? 'Expirada' : cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[12px]" style={{ color: expired ? '#f59e0b' : 'var(--muted2)' }}>
                        {q.validUntil
                          ? new Date(q.validUntil).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
                          : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[12px]" style={{ color: 'var(--muted2)' }}>
                        {new Date(q.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {meta.pages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <span className="text-[12px]" style={{ color: 'var(--muted2)' }}>
            Página {meta.page} de {meta.pages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={meta.page === 1}
              className="px-3 py-1.5 rounded-[var(--radius)] text-[12px] font-medium disabled:opacity-40"
              style={{ background: 'var(--bg3)', color: 'var(--text)', border: '1px solid var(--border)' }}
            >
              ← Anterior
            </button>
            <button
              onClick={() => setPage(p => Math.min(meta.pages, p + 1))}
              disabled={meta.page === meta.pages}
              className="px-3 py-1.5 rounded-[var(--radius)] text-[12px] font-medium disabled:opacity-40"
              style={{ background: 'var(--bg3)', color: 'var(--text)', border: '1px solid var(--border)' }}
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
