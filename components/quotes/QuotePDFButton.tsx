'use client'

import { PDFDownloadLink } from '@react-pdf/renderer'
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
  const doc = (
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
  )

  return (
    <PDFDownloadLink
      document={doc}
      fileName={`${props.quoteNumber}.pdf`}
      style={{ textDecoration: 'none' }}
    >
      {({ loading }) => (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            background: 'var(--bg3)',
            color: loading ? 'var(--muted)' : 'var(--text)',
            border: '1px solid var(--border)',
            cursor: loading ? 'wait' : 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {loading ? '⏳ Generando...' : '📄 Descargar PDF'}
        </span>
      )}
    </PDFDownloadLink>
  )
}