import { z } from 'zod'

const LineItemSchema = z.object({
  description: z.string().min(1, 'La descripción es requerida').max(200),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  total: z.number().nonnegative(),
})

// Convierte string vacío a undefined para campos opcionales de ID
const optionalId = z.preprocess(
  v => (!v || v === '' ? undefined : v),
  z.string().cuid().optional()
)

// Convierte datetime-local ("2024-01-01T18:00") a ISO completo, o undefined si vacío
const optionalDatetime = z.preprocess(
  v => {
    if (!v || v === '') return undefined
    try { return new Date(v as string).toISOString() } catch { return undefined }
  },
  z.string().datetime().optional()
)

// Convierte "2024-01-15" (date input) a ISO datetime, o undefined si vacío
const optionalDate = z.preprocess(
  v => {
    if (!v || v === '') return undefined
    try { return new Date(v as string).toISOString() } catch { return undefined }
  },
  z.string().datetime().optional()
)

// Valida formato HH:MM o vacío → undefined
const optionalTime = z.preprocess(
  v => (!v || v === '' ? undefined : v),
  z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM').optional()
)

export const CreateQuoteSchema = z.object({
  clientId: optionalId,
  eventId: optionalId,
  eventDate: optionalDate,
  eventEndDate: optionalDate,
  eventStartTime: optionalTime,
  eventEndTime: optionalTime,
  lineItems: z.array(LineItemSchema).min(1, 'Agrega al menos un concepto'),
  tax: z.number().nonnegative().default(0),
  currency: z.string().length(3).default('MXN'),
  eventCity: z.string().max(100).optional(),
  eventState: z.string().max(100).optional(),
  validUntil: optionalDatetime,
  notes: z.string().max(1000).optional(),
})

export const UpdateQuoteSchema = CreateQuoteSchema.partial().extend({
  status: z.enum(['draft', 'sent', 'accepted', 'rejected', 'expired']).optional(),
})

export type CreateQuoteInput = z.infer<typeof CreateQuoteSchema>
export type UpdateQuoteInput = z.infer<typeof UpdateQuoteSchema>
