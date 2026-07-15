import type { Metadata } from 'next'
import ClientList from '@/components/clients/ClientList'

export const metadata: Metadata = { title: 'Clientes — R-TIST' }

export default function ClientsPage() {
  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col">
      <ClientList />
    </main>
  )
}
