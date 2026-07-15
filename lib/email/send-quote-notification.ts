import { resend, FROM } from './resend'
import { quoteSentTemplate, quoteAcceptedTemplate, quoteRejectedTemplate } from './templates'

interface QuoteNotificationParams {
  toEmail: string
  toName: string
  quoteId: string
  quoteNumber: string
  clientName: string | null
  total: string
  currency: string
  newStatus: string
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://r-tist.vercel.app'

const SUBJECT: Record<string, string> = {
  sent:     'Cotización enviada',
  accepted: '🎉 ¡Tu cotización fue aceptada!',
  rejected: 'Cotización rechazada',
}

export async function sendQuoteNotification(params: QuoteNotificationParams) {
  const { toEmail, newStatus, quoteNumber, clientName, total, currency, quoteId } = params

  const subject = SUBJECT[newStatus]
  if (!subject) return  // Solo enviamos para estos tres estados

  const info = { quoteNumber, clientName, total, currency, appUrl: APP_URL, quoteId }

  let html: string
  if (newStatus === 'sent')     html = quoteSentTemplate(info)
  else if (newStatus === 'accepted') html = quoteAcceptedTemplate(info)
  else                          html = quoteRejectedTemplate(info)

  try {
    await resend.emails.send({
      from: FROM,
      to: [toEmail],
      subject: `${subject} — R-TIST`,
      html,
    })
  } catch (err) {
    // No fallamos la operación principal si el email falla
    console.error('[email] Error enviando notificación de cotización:', err)
  }
}