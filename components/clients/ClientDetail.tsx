'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UpdateClientSchema, type UpdateClientInput } from '@/lib/validations/client.schema'
import { formatCurrency } from '@/lib/utils/currency'
import ImageUpload from '@/components/shared/ImageUpload'

interface ClientEvent {
  id: string
  title: string
  eventType: string
  status: string
  startDate: string
  price: string | null
  currency: string
}

interface ClientQuote {
  id: string
  quoteNumber: string
  status: string
  total: string
  currency: string
  createdAt: string
}

interface Client {
  id: string
  artistId: string
  name: string
  phone: string
  phoneFormatted: string
  email: string | null
  birthdate: string | null
  preferredChannel: 'whatsapp' | 'instagram' | 'facebook'
  tags: string[]
  notes: string | null
  isActive: boolean
  photoUrl: string | null
  totalSpent: string
  totalEvents: number
  lastContact: string | null
  createdAt: string
  events: ClientEvent[]
  quotes: ClientQuote[]
}

const CHANNEL_ICON: Record<string, string> = { whatsapp: '📱', instagram: '📸', facebook: '👍' }
const CHANNEL_LABEL: Record<string, string> = { whatsapp: 'WhatsApp', instagram: 'Instagram', facebook: 'Facebook' }
const EVENT_STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente', confirmed: 'Confirmado', completed: 'Completado', cancelled: 'Cancelado',
}
const EVENT_STATUS_COLOR: Record<string, string> = {
  pending: '#f59e0b', confirmed: 'var(--accent)', completed: '#22c55e', cancelled: '#ef4444',
}
const QUOTE_STATUS_LABEL: Record<string, string> = {
  draft: 'Borrador', sent: 'Enviado', accepted: 'Aceptado', rejected: 'Rechazado', expired: 'Expirado',
}
const QUOTE_STATUS_COLOR: Record<string, string> = {
  draft: 'var(--muted2)', sent: '#60a5fa', accepted: '#22c55e', rejected: '#ef4444', expired: '#f59e0b',
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return '—'
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Hoy'
  if (days === 1) return 'Ayer'
  if (days < 30) return `Hace ${days} días`
  if (days < 365) return `Hace ${Math.floor(days / 30)} meses`
  return `Hace ${Math.floor(days / 365)} años`
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatBirthday(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div
      className="flex-1 rounded-xl px-4 py-3 flex flex-col gap-1"
      style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
    >
      <span className="text-[11px] font-semibold uppercase tracking-[0.8px]" style={{ color: 'var(--muted)' }}>
        {label}
      </span>
      <span className="text-[20px] font-extrabold tracking-[-0.5px]" style={{ color: 'var(--text)' }}>
        {value}
      </span>
      {sub && <span className="text-[11px]" style={{ color: 'var(--muted2)' }}>{sub}</span>}
    </div>
  )
}

export default function ClientDetail({ client: initial }: { client: Client }) {
  const router = useRouter()
  const [client, setClient] = useState(initial)
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [serverError, setServerError] = useState('')
  const [copied, setCopied] = useState(false)

  async function uploadPhoto(url: string) {
    await fetch(`/api/clients/${client.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoUrl: url }),
    })
    setClient(prev => ({ ...prev, photoUrl: url }))
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateClientInput>({
    resolver: zodResolver(UpdateClientSchema),
    defaultValues: {
      name: client.name,
      email: client.email ?? '',
      preferredChannel: client.preferredChannel,
      notes: client.notes ?? '',
      birthdate: client.birthdate ? client.birthdate.slice(0, 10) : '',
    },
  })

  function startEdit() {
    reset({
      name: client.name,
      email: client.email ?? '',
      preferredChannel: client.preferredChannel,
      notes: client.notes ?? '',
      birthdate: client.birthdate ? client.birthdate.slice(0, 10) : '',
    })
    setServerError('')
    setEditing(true)
  }

  function cancelEdit() {
    setEditing(false)
    setServerError('')
  }

  async function onSave(data: UpdateClientInput) {
    setServerError('')
    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) {
        setServerError(json.error ?? 'Error al guardar')
        return
      }
      setClient((prev) => ({
        ...prev,
        name: json.data.name,
        email: json.data.email,
        preferredChannel: json.data.preferredChannel,
        notes: json.data.notes,
      }))
      setEditing(false)
    } catch {
      setServerError('Error de conexión')
    }
  }

  async function handleDelete() {
    if (!deleting) { setDeleting(true); return }
    const res = await fetch(`/api/clients/${client.id}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/clients')
      router.refresh()
    }
  }

  async function copyPhone() {
    await navigator.clipboard.writeText(client.phone)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="max-w-[900px] mx-auto flex flex-col gap-6">
      {/* Back */}
      <button
        onClick={() => router.push('/clients')}
        className="flex items-center gap-2 text-[13px] font-medium w-fit transition-opacity hover:opacity-70"
        style={{ color: 'var(--muted2)' }}
      >
        ← Clientes
      </button>

      {/* Header */}
      <div
        className="rounded-xl p-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
        style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-4">
          <ImageUpload
            currentUrl={client.photoUrl}
            storagePath={`client-photos/${client.artistId}/${client.id}`}
            onUploaded={uploadPhoto}
            shape="circle"
            size={56}
            placeholder={client.name[0]?.toUpperCase() ?? '?'}
          />
          <div className="flex flex-col gap-1">
            <h1 className="text-[22px] font-extrabold tracking-[-0.5px]" style={{ color: 'var(--text)' }}>
              {client.name}
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] text-[11px] font-medium"
                style={{ background: 'var(--bg3)', color: 'var(--text)' }}
              >
                {CHANNEL_ICON[client.preferredChannel]} {CHANNEL_LABEL[client.preferredChannel]}
              </span>
              {!client.isActive && (
                <span
                  className="px-2 py-0.5 rounded-[6px] text-[11px] font-medium"
                  style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}
                >
                  Inactivo
                </span>
              )}
              {client.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-[6px] text-[11px]"
                  style={{ background: 'var(--bg4)', color: 'var(--muted2)' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {!editing && (
            <button
              onClick={startEdit}
              className="px-3 py-[7px] rounded-[var(--radius)] text-[12px] font-medium transition-colors"
              style={{ background: 'var(--bg3)', color: 'var(--text)', border: '1px solid var(--border)' }}
            >
              Editar
            </button>
          )}
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
              Cancelar
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Total gastado"
          value={formatCurrency(Number(client.totalSpent))}
          sub={`${client.totalEvents} eventos`}
        />
        <StatCard label="Último contacto" value={timeAgo(client.lastContact)} />
        <StatCard label="Cliente desde" value={formatDate(client.createdAt)} />
        <StatCard
          label="Cumpleaños"
          value={formatBirthday(client.birthdate)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-4">
        {/* Info / Edit panel */}
        <div
          className="rounded-xl p-5 flex flex-col gap-4"
          style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
        >
          <h2 className="text-[13px] font-bold uppercase tracking-[0.8px]" style={{ color: 'var(--muted)' }}>
            Información
          </h2>

          {editing ? (
            <form onSubmit={handleSubmit(onSave)} className="flex flex-col gap-4">
              <Field label="Nombre" error={errors.name?.message}>
                <input
                  {...register('name')}
                  className="field-input"
                  style={fieldStyle(!!errors.name)}
                />
              </Field>
              <Field label="Email" error={errors.email?.message}>
                <input
                  {...register('email')}
                  type="email"
                  className="field-input"
                  style={fieldStyle(!!errors.email)}
                />
              </Field>
              <Field label="Canal preferido">
                <div className="flex gap-2">
                  {(['whatsapp', 'instagram', 'facebook'] as const).map((ch) => (
                    <label
                      key={ch}
                      className="flex-1 text-center py-2 rounded-[var(--radius)] text-[12px] cursor-pointer"
                      style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    >
                      <input {...register('preferredChannel')} type="radio" value={ch} className="sr-only" />
                      {CHANNEL_LABEL[ch]}
                    </label>
                  ))}
                </div>
              </Field>
              <Field label="Cumpleaños">
                <input
                  {...register('birthdate')}
                  type="date"
                  style={{ ...fieldStyle(false), colorScheme: 'dark' }}
                />
              </Field>
              <Field label="Notas">
                <textarea
                  {...register('notes')}
                  rows={3}
                  style={fieldStyle(false)}
                  className="resize-none"
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
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex-1 py-2 rounded-[var(--radius)] text-[12px] font-medium"
                  style={{ background: 'var(--bg3)', color: 'var(--muted2)', border: '1px solid var(--border)' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 rounded-[var(--radius)] text-[12px] font-bold disabled:opacity-50"
                  style={{ background: 'var(--accent)', color: 'var(--bg)' }}
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          ) : (
            <dl className="flex flex-col gap-3">
              <InfoRow label="Teléfono">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[13px]" style={{ color: 'var(--text)' }}>
                    {client.phoneFormatted}
                  </span>
                  <button
                    onClick={copyPhone}
                    className="text-[11px] px-2 py-0.5 rounded-[5px] transition-all"
                    style={{
                      background: copied ? 'rgba(200,255,0,0.15)' : 'var(--bg3)',
                      color: copied ? 'var(--accent)' : 'var(--muted2)',
                    }}
                  >
                    {copied ? '✓ Copiado' : 'Copiar'}
                  </button>
                </div>
              </InfoRow>
              <InfoRow label="Email">
                {client.email ? (
                  <a
                    href={`mailto:${client.email}`}
                    className="text-[13px] hover:underline"
                    style={{ color: 'var(--accent)' }}
                  >
                    {client.email}
                  </a>
                ) : (
                  <span style={{ color: 'var(--muted)' }}>—</span>
                )}
              </InfoRow>
              <InfoRow label="Canal">
                <span className="text-[13px]" style={{ color: 'var(--text)' }}>
                  {CHANNEL_ICON[client.preferredChannel]} {CHANNEL_LABEL[client.preferredChannel]}
                </span>
              </InfoRow>
              <InfoRow label="Cumpleaños">
                <span className="text-[13px]" style={{ color: 'var(--text)' }}>
                  {formatBirthday(client.birthdate)}
                </span>
              </InfoRow>
              {client.notes && (
                <InfoRow label="Notas">
                  <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text)' }}>
                    {client.notes}
                  </p>
                </InfoRow>
              )}
            </dl>
          )}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Eventos recientes */}
          <div
            className="rounded-xl p-5 flex flex-col gap-3"
            style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-bold uppercase tracking-[0.8px]" style={{ color: 'var(--muted)' }}>
                Eventos recientes
              </h2>
              <span className="font-mono text-[11px]" style={{ color: 'var(--muted2)' }}>
                {client.totalEvents} total
              </span>
            </div>
            {client.events.length === 0 ? (
              <p className="text-[13px]" style={{ color: 'var(--muted)' }}>
                Sin eventos aún
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {client.events.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-center justify-between py-2"
                    style={{ borderBottom: '1px solid var(--border)' }}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[13px] font-medium" style={{ color: 'var(--text)' }}>
                        {ev.title}
                      </span>
                      <span className="text-[11px]" style={{ color: 'var(--muted2)' }}>
                        {new Date(ev.startDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-[5px]"
                        style={{
                          background: `${EVENT_STATUS_COLOR[ev.status]}20`,
                          color: EVENT_STATUS_COLOR[ev.status],
                        }}
                      >
                        {EVENT_STATUS_LABEL[ev.status]}
                      </span>
                      {ev.price && (
                        <span className="font-mono text-[11px]" style={{ color: 'var(--muted2)' }}>
                          {formatCurrency(Number(ev.price))}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cotizaciones recientes */}
          <div
            className="rounded-xl p-5 flex flex-col gap-3"
            style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
          >
            <h2 className="text-[13px] font-bold uppercase tracking-[0.8px]" style={{ color: 'var(--muted)' }}>
              Cotizaciones
            </h2>
            {client.quotes.length === 0 ? (
              <p className="text-[13px]" style={{ color: 'var(--muted)' }}>
                Sin cotizaciones aún
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {client.quotes.map((q) => (
                  <div
                    key={q.id}
                    className="flex items-center justify-between py-2"
                    style={{ borderBottom: '1px solid var(--border)' }}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-mono text-[12px] font-medium" style={{ color: 'var(--text)' }}>
                        #{q.quoteNumber}
                      </span>
                      <span className="text-[11px]" style={{ color: 'var(--muted2)' }}>
                        {new Date(q.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-[5px]"
                        style={{
                          background: `${QUOTE_STATUS_COLOR[q.status]}20`,
                          color: QUOTE_STATUS_COLOR[q.status],
                        }}
                      >
                        {QUOTE_STATUS_LABEL[q.status]}
                      </span>
                      <span className="font-mono text-[11px]" style={{ color: 'var(--muted2)' }}>
                        {formatCurrency(Number(q.total))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Helpers de UI ─────────────────────────────────────────────────

function fieldStyle(hasError: boolean): React.CSSProperties {
  return {
    width: '100%',
    padding: '8px 12px',
    borderRadius: 'var(--radius)',
    background: 'var(--bg3)',
    border: `1px solid ${hasError ? '#ef4444' : 'var(--border)'}`,
    color: 'var(--text)',
    fontSize: '13px',
    outline: 'none',
  }
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-medium" style={{ color: 'var(--muted2)' }}>{label}</label>
      {children}
      {error && <span className="text-[11px]" style={{ color: '#ef4444' }}>{error}</span>}
    </div>
  )
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-[11px] font-medium" style={{ color: 'var(--muted)' }}>{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}
