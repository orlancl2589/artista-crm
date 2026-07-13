import type { Metadata } from 'next'
import EventsView from '@/components/events/EventsView'

export const metadata: Metadata = { title: 'Eventos — Artista CRM' }

export default function EventsPage() {
  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col">
      <EventsView />
    </main>
  )
}
