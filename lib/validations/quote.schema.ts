import { z } from 'zod'

const LineItemSchema = z.object({
  description: z.string().min(1).max(200),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  total: z.number().nonnegative(),
})

export const CreateQuoteSchema = z.object({
  clientId: z.string().cuid().optional(),
  eventId: z.string().cuid().optional(),
  lineItems: z.array(LineItemSchema).min(1),
  tax: z.number().nonnegative().default(0),
  currency: z.string().length(3).default('MXN'),
  validUntil: z.string().datetime().optional(),
  notes: z.string().max(1000).optional(),
})

export const UpdateQuoteSchema = CreateQuoteSchema.partial().extend({
  status: z.enum(['draft', 'sent', 'accepted', 'rejected', 'expired']).optional(),
})

export type CreateQuoteInput = z.infer<typeof CreateQuoteSchema>
export type UpdateQuoteInput = z.infer<typeof UpdateQuoteSchema>
