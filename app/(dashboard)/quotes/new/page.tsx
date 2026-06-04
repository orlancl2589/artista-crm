import type { Metadata } from 'next'
import QuoteBuilder from '@/components/quotes/QuoteBuilder'

export const metadata: Metadata = { title: 'Nueva cotización — Artista CRM' }

export default function NewQuotePage() {
  return (
    <main className="flex-1 overflow-y-auto p-6">
      <QuoteBuilder />
    </main>
  )
}
