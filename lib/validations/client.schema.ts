import { z } from 'zod'

export const CreateClientSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(100).trim(),
  phone: z
    .string()
    .regex(/^\+[1-9]\d{1,14}$/, 'Formato internacional requerido (ej: +52551234567)'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  birthdate: z.string().datetime().optional().or(z.literal('')),
  preferredChannel: z.enum(['whatsapp', 'instagram', 'facebook']).default('whatsapp'),
  tags: z.array(z.string().max(30)).max(10).default([]),
  notes: z.string().max(500).optional(),
})

export const UpdateClientSchema = CreateClientSchema.partial()

export type CreateClientInput = z.infer<typeof CreateClientSchema>
export type UpdateClientInput = z.infer<typeof UpdateClientSchema>
