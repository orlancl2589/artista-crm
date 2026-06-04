import type { Metadata } from 'next'
import ClientList from '@/components/clients/ClientList'

export const metadata: Metadata = { title: 'Clientes — Artista CRM' }

export default function ClientsPage() {
  return (
    <main className="flex-1 overflow-y-auto p-6 flex flex-col">
      <ClientList />
    </main>
  )
}
