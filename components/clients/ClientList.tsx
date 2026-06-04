'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import NewClientModal from './NewClientModal'
import { formatPhone } from '@/lib/utils/phone'

interface Client {
  id: string
  name: string
  phone: string
  email: string | null
  preferredChannel: 'whatsapp' | 'instagram' | 'facebook'
  tags: string[]
  totalSpent: string
  totalEvents: number
  lastContact: string | null
  createdAt: string
}

interface Meta {
  total: number
  page: number
  limit: number
  pages: number
}

const CHANNEL_ICONS: Record<string, string> = {
  whatsapp: '📱',
  instagram: '📸',
  facebook: '👍',
}

const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  facebook: 'Facebook',
}

function formatCurrency(amount: string) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
    Number(amount)
  )
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return '—'
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Hoy'
  if (days === 1) return 'Ayer'
  if (days < 30) return `Hace ${days}d`
  if (days < 365) return `Hace ${Math.floor(days / 30)}m`
  return `Hace ${Math.floor(days / 365)}a`
}

export default function ClientList() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 20, pages: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [channel, setChannel] = useState('')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)

  const fetchClients = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (search) params.set('search', search)
      if (channel) params.set('channel', channel)
      const res = await fetch(`/api/clients?${params}`)
      if (res.ok) {
        const json = await res.json()
        setClients(json.data)
        setMeta(json.meta)
      }
    } finally {
      setLoading(false)
    }
  }, [search, channel, page])

  useEffect(() => {
    const t = setTimeout(fetchClients, search ? 300 : 0)
    return () => clearTimeout(t)
  }, [fetchClients, search])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [search, channel])

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-extrabold tracking-[-0.5px]" style={{ color: 'var(--text)' }}>
            Clientes
          </h1>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--muted2)' }}>
            {meta.total > 0 ? `${meta.total} contactos` : 'Sin clientes aún'}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-[9px] rounded-[var(--radius)] text-[13px] font-bold transition-opacity hover:opacity-90"
          style={{ background: 'var(--accent)', color: 'var(--bg)' }}
        >
          + Nuevo cliente
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre..."
          className="flex-1 px-3 py-[9px] rounded-[var(--radius)] text-[13px] outline-none"
          style={{
            background: 'var(--bg3)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
          }}
        />
        <select
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          className="px-3 py-[9px] rounded-[var(--radius)] text-[13px] outline-none cursor-pointer"
          style={{
            background: 'var(--bg3)',
            border: '1px solid var(--border)',
            color: channel ? 'var(--text)' : 'var(--muted2)',
          }}
        >
          <option value="">Todos los canales</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="instagram">Instagram</option>
          <option value="facebook">Facebook</option>
        </select>
      </div>

      {/* Table */}
      <div
        className="flex-1 rounded-xl overflow-hidden"
        style={{ border: '1px solid var(--border)', background: 'var(--bg2)' }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="text-[13px]" style={{ color: 'var(--muted2)' }}>
              Cargando...
            </div>
          </div>
        ) : clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2">
            <span className="text-[32px]">👥</span>
            <p className="text-[14px] font-medium" style={{ color: 'var(--text)' }}>
              {search || channel ? 'Sin resultados' : 'Agrega tu primer cliente'}
            </p>
            {!search && !channel && (
              <button
                onClick={() => setShowModal(true)}
                className="text-[13px] font-medium mt-1"
                style={{ color: 'var(--accent)' }}
              >
                + Nuevo cliente
              </button>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Cliente', 'Teléfono', 'Canal', 'Eventos', 'Total gastado', 'Último contacto'].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.8px]"
                      style={{ color: 'var(--muted)' }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {clients.map((client, i) => (
                <tr
                  key={client.id}
                  onClick={() => router.push(`/clients/${client.id}`)}
                  className="cursor-pointer transition-colors"
                  style={{
                    borderBottom: i < clients.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLTableRowElement).style.background = 'var(--bg3)')
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLTableRowElement).style.background = 'transparent')
                  }
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold flex-shrink-0"
                        style={{
                          background: 'var(--bg4)',
                          color: 'var(--accent)',
                        }}
                      >
                        {client.name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="text-[13px] font-semibold" style={{ color: 'var(--text)' }}>
                          {client.name}
                        </div>
                        {client.email && (
                          <div className="text-[11px]" style={{ color: 'var(--muted2)' }}>
                            {client.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-[12px]" style={{ color: 'var(--muted2)' }}>
                      {formatPhone(client.phone)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-[6px] text-[11px] font-medium"
                      style={{ background: 'var(--bg3)', color: 'var(--text)' }}
                    >
                      {CHANNEL_ICONS[client.preferredChannel]}{' '}
                      {CHANNEL_LABELS[client.preferredChannel]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[13px]" style={{ color: 'var(--text)' }}>
                      {client.totalEvents}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[13px] font-mono" style={{ color: 'var(--text)' }}>
                      {formatCurrency(client.totalSpent)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px]" style={{ color: 'var(--muted2)' }}>
                      {timeAgo(client.lastContact)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
              className="px-3 py-1.5 rounded-[var(--radius)] text-[12px] font-medium disabled:opacity-40 transition-colors"
              style={{ background: 'var(--bg3)', color: 'var(--text)', border: '1px solid var(--border)' }}
            >
              ← Anterior
            </button>
            <button
              onClick={() => setPage((p) => Math.min(meta.pages, p + 1))}
              disabled={meta.page === meta.pages}
              className="px-3 py-1.5 rounded-[var(--radius)] text-[12px] font-medium disabled:opacity-40 transition-colors"
              style={{ background: 'var(--bg3)', color: 'var(--text)', border: '1px solid var(--border)' }}
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}

      <NewClientModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onCreated={fetchClients}
      />
    </div>
  )
}
