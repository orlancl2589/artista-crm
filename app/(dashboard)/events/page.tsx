import type { Metadata } from 'next'
import EventList from '@/components/events/EventList'

export const metadata: Metadata = { title: 'Eventos — Artista CRM' }

export default function EventsPage() {
  return (
    <main className="flex-1 overflow-y-auto p-6 flex flex-col">
      <EventList />
    </main>
  )
}
