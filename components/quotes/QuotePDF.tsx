import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 10, color: '#111', backgroundColor: '#fff', padding: 40 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 },
  logoBox: { width: 36, height: 36, backgroundColor: '#c8ff00', borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  logoText: { fontSize: 18 },
  brandName: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#111' },
  brandSub: { fontSize: 8, color: '#888', marginTop: 2 },
  quoteNumWrap: { alignItems: 'flex-end' },
  quoteNum: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#111' },
  statusBadge: { marginTop: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusText: { fontSize: 9, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase' },

  // Divider
  divider: { borderBottomWidth: 1, borderBottomColor: '#e5e5e5', marginBottom: 24 },

  // Info row
  infoRow: { flexDirection: 'row', gap: 32, marginBottom: 24 },
  infoBlock: { flex: 1 },
  infoLabel: { fontSize: 8, color: '#888', fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  infoValue: { fontSize: 11, color: '#111' },
  infoValueBold: { fontSize: 11, color: '#111', fontFamily: 'Helvetica-Bold' },

  // Table
  tableHeader: { flexDirection: 'row', backgroundColor: '#f5f5f5', paddingVertical: 7, paddingHorizontal: 10, borderRadius: 4, marginBottom: 4 },
  tableRow: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  colDesc: { flex: 1 },
  colQty: { width: 50, textAlign: 'center' },
  colUnit: { width: 90, textAlign: 'right' },
  colTotal: { width: 90, textAlign: 'right' },
  thText: { fontSize: 8, color: '#888', fontFamily: 'Helvetica-Bold', textTransform: 'uppercase' },
  tdText: { fontSize: 10, color: '#111' },
  tdMono: { fontSize: 10, color: '#111', fontFamily: 'Helvetica' },

  // Totals
  totalsWrap: { alignItems: 'flex-end', marginTop: 16 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', width: 240, paddingVertical: 3 },
  totalLabel: { fontSize: 10, color: '#666' },
  totalValue: { fontSize: 10, color: '#111' },
  grandTotalRow: { flexDirection: 'row', justifyContent: 'space-between', width: 240, paddingVertical: 6, borderTopWidth: 1, borderTopColor: '#e5e5e5', marginTop: 4 },
  grandLabel: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#111' },
  grandValue: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#111' },

  // Notes
  notesWrap: { marginTop: 28, padding: 14, backgroundColor: '#fafafa', borderRadius: 6 },
  notesLabel: { fontSize: 8, color: '#888', fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', marginBottom: 6 },
  notesText: { fontSize: 10, color: '#555', lineHeight: 1.6 },

  // Footer
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, borderTopWidth: 1, borderTopColor: '#e5e5e5', paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 8, color: '#aaa' },
})

function fmt(n: number, currency = 'MXN') {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(n)
}

const STATUS_LABELS: Record<string, { label: string; bg: string; color: string }> = {
  draft:    { label: 'Borrador',  bg: '#f5f5f5', color: '#888' },
  sent:     { label: 'Enviada',   bg: '#eff6ff', color: '#2563eb' },
  accepted: { label: 'Aceptada',  bg: '#f0fdf4', color: '#16a34a' },
  rejected: { label: 'Rechazada', bg: '#fef2f2', color: '#dc2626' },
  expired:  { label: 'Expirada',  bg: '#fffbeb', color: '#d97706' },
}

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

const DEFAULT_CFG = { label: 'Borrador', bg: '#f5f5f5', color: '#888' }

export default function QuotePDF({
  quoteNumber, status, createdAt, validUntil,
  artistName, clientName, eventTitle,
  lineItems, subtotal, tax, total, currency, notes,
}: Props) {
  const cfg = STATUS_LABELS[status] ?? DEFAULT_CFG
  const cur = currency as 'MXN' | 'USD'
  const taxNum = Number(tax)

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* Header */}
        <View style={s.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={s.logoBox}>
              <Text style={s.logoText}>♪</Text>
            </View>
            <View>
              <Text style={s.brandName}>{artistName}</Text>
              <Text style={s.brandSub}>Cotización profesional</Text>
            </View>
          </View>
          <View style={s.quoteNumWrap}>
            <Text style={s.quoteNum}>{quoteNumber}</Text>
            <View style={[s.statusBadge, { backgroundColor: cfg.bg }]}>
              <Text style={[s.statusText, { color: cfg.color }]}>{cfg.label}</Text>
            </View>
          </View>
        </View>

        <View style={s.divider} />

        {/* Info: cliente + fechas */}
        <View style={s.infoRow}>
          <View style={s.infoBlock}>
            <Text style={s.infoLabel}>Para</Text>
            <Text style={s.infoValueBold}>{clientName ?? '—'}</Text>
            {eventTitle && <Text style={[s.infoValue, { color: '#666', marginTop: 2 }]}>{eventTitle}</Text>}
          </View>
          <View style={s.infoBlock}>
            <Text style={s.infoLabel}>Fecha de emisión</Text>
            <Text style={s.infoValue}>
              {new Date(createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
          </View>
          {validUntil && (
            <View style={s.infoBlock}>
              <Text style={s.infoLabel}>Válida hasta</Text>
              <Text style={s.infoValue}>
                {new Date(validUntil).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
              </Text>
            </View>
          )}
        </View>

        {/* Tabla de conceptos */}
        <View style={s.tableHeader}>
          <Text style={[s.thText, s.colDesc]}>Descripción</Text>
          <Text style={[s.thText, s.colQty]}>Cant.</Text>
          <Text style={[s.thText, s.colUnit]}>Precio unit.</Text>
          <Text style={[s.thText, s.colTotal]}>Total</Text>
        </View>

        {lineItems.map((item, i) => (
          <View key={i} style={s.tableRow}>
            <Text style={[s.tdText, s.colDesc]}>{item.description}</Text>
            <Text style={[s.tdMono, s.colQty]}>{item.quantity}</Text>
            <Text style={[s.tdMono, s.colUnit]}>{fmt(item.unitPrice, cur)}</Text>
            <Text style={[s.tdMono, s.colTotal, { fontFamily: 'Helvetica-Bold' }]}>{fmt(item.total, cur)}</Text>
          </View>
        ))}

        {/* Totales */}
        <View style={s.totalsWrap}>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Subtotal</Text>
            <Text style={s.totalValue}>{fmt(Number(subtotal), cur)}</Text>
          </View>
          {taxNum > 0 && (
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>IVA</Text>
              <Text style={s.totalValue}>{fmt(taxNum, cur)}</Text>
            </View>
          )}
          <View style={s.grandTotalRow}>
            <Text style={s.grandLabel}>Total</Text>
            <Text style={s.grandValue}>{fmt(Number(total), cur)}</Text>
          </View>
        </View>

        {/* Notas */}
        {notes && (
          <View style={s.notesWrap}>
            <Text style={s.notesLabel}>Notas y condiciones</Text>
            <Text style={s.notesText}>{notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Artista CRM · Cotización generada digitalmente</Text>
          <Text style={s.footerText}>{quoteNumber}</Text>
        </View>

      </Page>
    </Document>
  )
}