'use client'

import { usePDF } from '@react-pdf/renderer'
import QuotePDF from './QuotePDF'

interface LineItem { description: string; quantity: number; unitPrice: number; total: number }

interface Props {
  quoteNumber: string
  status: string
  createdAt: string
  validUntil: string | null
  artistName: string
  clientName: string | null
  eventTitle: string | null
  lineItems: LineItem[]
  subtotal: string
  tax: string
  total: string
  currency: string
  notes: string | null
}

export default function QuotePDFButton(props: Props) {
  const [instance] = usePDF({
    document: (
      <QuotePDF
        quoteNumber={props.quoteNumber}
        status={props.status}
        createdAt={props.createdAt}
        validUntil={props.validUntil}
        artistName={props.artistName}
        clientName={props.clientName}
        eventTitle={props.eventTitle}
        lineItems={props.lineItems}
        subtotal={props.subtotal}
        tax={props.tax}
        total={props.total}
        currency={props.currency}
        notes={props.notes}
      />
    ),
  })

  const btnStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600,
    background: 'var(--bg3)',
    border: '1px solid var(--border)',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
  }

  if (instance.loading) {
    return (
      <span style={{ ...btnStyle, color: 'var(--muted)', cursor: 'wait' }}>
        ⏳ Generando...
      </span>
    )
  }

  return (
    <a
      href={instance.url ?? '#'}
      download={`${props.quoteNumber}.pdf`}
      style={{ ...btnStyle, color: 'var(--text)' }}
    >
      📄 Descargar PDF
    </a>
  )
}