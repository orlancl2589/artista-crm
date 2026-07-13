import type { Metadata } from 'next'
import QuoteList from '@/components/quotes/QuoteList'

export const metadata: Metadata = { title: 'Cotizaciones — Artista CRM' }

export default function QuotesPage() {
  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col">
      <QuoteList />
    </main>
  )
}
