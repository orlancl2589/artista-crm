import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  console.warn('[email] RESEND_API_KEY no configurada — emails desactivados')
}

export const resend = new Resend(process.env.RESEND_API_KEY || 're_not_configured')

export const FROM = process.env.EMAIL_FROM ?? 'R-TIST <onboarding@resend.dev>'