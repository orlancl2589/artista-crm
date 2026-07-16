import { z } from 'zod'

export const CreateEventSchema = z.object({
  title: z.string().min(2).max(200).trim(),
  eventType: z.enum(['wedding', 'corporate', 'birthday', 'quinceanera', 'club', 'private', 'other']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  timezone: z.string().default('America/Mexico_City'),
  clientId: z.string().cuid().optional(),
  venue: z.string().max(200).optional(),
  venueAddress: z.string().max(300).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  venueLat: z.number().optional(),
  venueLng: z.number().optional(),
  price: z.number().positive().optional(),
  currency: z.string().length(3).default('MXN'),
  rider: z.record(z.unknown()).optional(),
  setlistNotes: z.string().max(1000).optional(),
  internalNotes: z.string().max(1000).optional(),
})

export const UpdateEventSchema = CreateEventSchema.partial().extend({
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
})

export type CreateEventInput = z.infer<typeof CreateEventSchema>
export type UpdateEventInput = z.infer<typeof UpdateEventSchema>
