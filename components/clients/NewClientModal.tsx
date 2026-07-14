'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreateClientSchema, type CreateClientInput } from '@/lib/validations/client.schema'

interface Props {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

const CHANNELS = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
]

export default function NewClientModal({ open, onClose, onCreated }: Props) {
  const [serverError, setServerError] = useState('')
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateClientInput>({
    resolver: zodResolver(CreateClientSchema),
    defaultValues: { preferredChannel: 'whatsapp', tags: [] },
  })

  const selectedChannel = watch('preferredChannel')

  if (!open) return null

  async function onSubmit(data: CreateClientInput) {
    setServerError('')
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) {
        setServerError(json.error ?? 'Error al crear cliente')
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        className="w-full max-w-[480px] rounded-xl p-6 flex flex-col gap-5"
        style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-bold" style={{ color: 'var(--text)' }}>
            Nuevo cliente
          </h2>
          <button
            onClick={handleClose}
            className="w-7 h-7 rounded-md flex items-center justify-center text-[16px] transition-colors"
            style={{ color: 'var(--muted2)', background: 'var(--bg3)' }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Nombre */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium" style={{ color: 'var(--muted2)' }}>
              Nombre *
            </label>
            <input
              {...register('name')}
              placeholder="Ej: Juan Pérez"
              className="w-full px-3 py-[9px] rounded-[var(--radius)] text-[14px] outline-none transition-colors"
              style={{
                background: 'var(--bg3)',
                border: `1px solid ${errors.name ? '#ef4444' : 'var(--border)'}`,
                color: 'var(--text)',
              }}
            />
            {errors.name && (
              <span className="text-[11px]" style={{ color: '#ef4444' }}>
                {errors.name.message}
              </span>
            )}
          </div>

          {/* Teléfono */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium" style={{ color: 'var(--muted2)' }}>
              Teléfono *
            </label>
            <input
              {...register('phone')}
              placeholder="+52 55 1234 5678"
              className="w-full px-3 py-[9px] rounded-[var(--radius)] text-[14px] font-mono outline-none transition-colors"
              style={{
                background: 'var(--bg3)',
                border: `1px solid ${errors.phone ? '#ef4444' : 'var(--border)'}`,
                color: 'var(--text)',
              }}
            />
            {errors.phone && (
              <span className="text-[11px]" style={{ color: '#ef4444' }}>
                {errors.phone.message}
              </span>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium" style={{ color: 'var(--muted2)' }}>
              Email
            </label>
            <input
              {...register('email')}
              type="email"
              placeholder="cliente@ejemplo.com"
              className="w-full px-3 py-[9px] rounded-[var(--radius)] text-[14px] outline-none transition-colors"
              style={{
                background: 'var(--bg3)',
                border: `1px solid ${errors.email ? '#ef4444' : 'var(--border)'}`,
                color: 'var(--text)',
              }}
            />
            {errors.email && (
              <span className="text-[11px]" style={{ color: '#ef4444' }}>
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Canal preferido */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium" style={{ color: 'var(--muted2)' }}>
              Canal preferido
            </label>
            <div className="flex gap-2">
              {CHANNELS.map((ch) => {
                const active = selectedChannel === ch.value
                return (
                  <label
                    key={ch.value}
                    className="flex-1 flex items-center justify-center py-[9px] rounded-[var(--radius)] text-[13px] font-medium cursor-pointer transition-all"
                    style={{
                      background: active ? 'rgba(200,255,0,0.08)' : 'var(--bg3)',
                      border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                      color: active ? 'var(--accent)' : 'var(--muted2)',
                    }}
                  >
                    <input
                      {...register('preferredChannel')}
                      type="radio"
                      value={ch.value}
                      className="sr-only"
                    />
                    {ch.label}
                  </label>
                )
              })}
            </div>
          </div>

          {/* Cumpleaños */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium" style={{ color: 'var(--muted2)' }}>
              Cumpleaños
            </label>
            <input
              {...register('birthdate')}
              type="date"
              className="w-full px-3 py-[9px] rounded-[var(--radius)] text-[14px] outline-none transition-colors"
              style={{
                background: 'var(--bg3)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                colorScheme: 'dark',
              }}
            />
          </div>

          {/* Notas */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium" style={{ color: 'var(--muted2)' }}>
              Notas
            </label>
            <textarea
              {...register('notes')}
              placeholder="Preferencias, observaciones..."
              rows={2}
              className="w-full px-3 py-[9px] rounded-[var(--radius)] text-[14px] outline-none resize-none transition-colors"
              style={{
                background: 'var(--bg3)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
            />
          </div>

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
              className="flex-1 py-[10px] rounded-[var(--radius)] text-[13px] font-medium transition-colors"
              style={{ background: 'var(--bg3)', color: 'var(--muted2)', border: '1px solid var(--border)' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-[10px] rounded-[var(--radius)] text-[13px] font-bold transition-opacity disabled:opacity-50"
              style={{ background: 'var(--accent)', color: 'var(--bg)' }}
            >
              {isSubmitting ? 'Guardando...' : 'Crear cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
