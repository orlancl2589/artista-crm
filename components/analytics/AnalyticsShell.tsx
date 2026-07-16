'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { formatCurrency } from '@/lib/utils/currency'

interface KPIs {
  totalRevenue: number
  bestMonth: { month: string; revenue: number }
  completedEvents: number
  totalEvents: number
  conversionRate: number
}

interface MonthData { month: string; revenue: number; count: number }
interface TypeData { type: string; revenue: number }
interface ClientData { name: string; city: string; state: string; totalSpent: number; totalEvents: number }
interface PipelineData { draft: number; sent: number; accepted: number; rejected: number; expired: number }
interface GeoData { state: string; count: number }

interface Props {
  kpis: KPIs
  revenueByMonth: MonthData[]
  revenueByType: TypeData[]
  topClients: ClientData[]
  pipeline: PipelineData
  clientsByState: GeoData[]
  eventsByState: GeoData[]
  currency: string
}

const TYPE_LABEL: Record<string, string> = {
  wedding: 'Boda',
  corporate: 'Corporativo',
  birthday: 'Cumpleaños',
  quinceanera: 'Quinceañera',
  club: 'Club / Bar',
  private: 'Privado',
  other: 'Otro',
}

const PIE_COLORS = ['#c8ff00', '#a0d400', '#7aaa00', '#548000', '#2e5600', '#182e00', '#0a1600']

const CHART_STYLE = {
  fontSize: 11,
  fontFamily: 'var(--font-mono)',
  fill: 'var(--muted2)',
}

type Currency = 'MXN' | 'USD' | 'COP' | 'ARS' | 'CLP' | 'EUR'

function fmt(n: number, currency: string) {
  return formatCurrency(n, currency as Currency)
}

function KpiCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-1"
      style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
    >
      <div className="text-[11px] font-mono uppercase tracking-[0.8px]" style={{ color: 'var(--muted)' }}>
        {label}
      </div>
      <div className="text-[22px] font-extrabold tracking-[-0.5px]" style={{ color: 'var(--text)' }}>
        {value}
      </div>
      {sub && (
        <div className="text-[11px] font-mono" style={{ color: 'var(--muted2)' }}>
          {sub}
        </div>
      )}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-[11px] font-bold uppercase tracking-[0.8px] mb-4"
      style={{ color: 'var(--muted)' }}
    >
      {children}
    </h2>
  )
}

function GeoBar({ data, max }: { data: GeoData[]; max: number }) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-[13px]" style={{ color: 'var(--muted)' }}>
        Sin datos geográficos aún. Agrega ciudad/estado en tus registros.
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-2">
      {data.map((d) => (
        <div key={d.state} className="flex items-center gap-3">
          <div className="w-[80px] text-right text-[12px] font-mono shrink-0" style={{ color: 'var(--muted2)' }}>
            {d.state}
          </div>
          <div className="flex-1 rounded-full overflow-hidden h-[6px]" style={{ background: 'var(--bg3)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${Math.round((d.count / max) * 100)}%`, background: 'var(--accent)' }}
            />
          </div>
          <div className="w-[24px] text-[11px] font-mono shrink-0" style={{ color: 'var(--muted2)' }}>
            {d.count}
          </div>
        </div>
      ))}
    </div>
  )
}

function CustomTooltip({ active, payload, label, currency }: {
  active?: boolean; payload?: { value: number; name: string }[]; label?: string; currency: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-xl px-4 py-3 text-[12px] font-mono"
      style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)' }}
    >
      <div className="font-bold mb-1" style={{ color: 'var(--accent)' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i}>
          {p.name === 'revenue' ? fmt(p.value, currency) : `${p.value} eventos`}
        </div>
      ))}
    </div>
  )
}

export default function AnalyticsShell({
  kpis,
  revenueByMonth,
  revenueByType,
  topClients,
  pipeline,
  clientsByState,
  eventsByState,
  currency,
}: Props) {
  const totalPipeline = pipeline.draft + pipeline.sent + pipeline.accepted + pipeline.rejected + pipeline.expired
  const maxClientState = clientsByState[0]?.count ?? 1
  const maxEventState = eventsByState[0]?.count ?? 1

  const pieData = revenueByType
    .filter((d) => d.revenue > 0)
    .map((d) => ({ name: TYPE_LABEL[d.type] ?? d.type, value: d.revenue }))

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-[1100px]">
      <div className="mb-6">
        <h1 className="text-[22px] font-extrabold tracking-[-0.5px]" style={{ color: 'var(--text)' }}>
          Analytics
        </h1>
        <p className="text-[13px] mt-1" style={{ color: 'var(--muted2)' }}>
          Resumen del año en curso · datos reales
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Ingresos del año"
          value={fmt(kpis.totalRevenue, currency)}
          sub={`${kpis.totalEvents} eventos`}
        />
        <KpiCard
          label="Mejor mes"
          value={kpis.bestMonth.month}
          sub={fmt(kpis.bestMonth.revenue, currency)}
        />
        <KpiCard
          label="Eventos completados"
          value={String(kpis.completedEvents)}
          sub={`de ${kpis.totalEvents} confirmados`}
        />
        <KpiCard
          label="Conversión cotizaciones"
          value={`${kpis.conversionRate}%`}
          sub="enviadas → aceptadas"
        />
      </div>

      {/* Ingresos por mes */}
      <div
        className="rounded-xl p-5 mb-4"
        style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
      >
        <SectionTitle>Ingresos por mes (últimos 12 meses)</SectionTitle>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={revenueByMonth} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <XAxis dataKey="month" tick={CHART_STYLE} axisLine={false} tickLine={false} />
            <YAxis
              tick={CHART_STYLE}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => v >= 1000 ? `$${Math.round(v / 1000)}k` : `$${v}`}
              width={40}
            />
            <Tooltip content={<CustomTooltip currency={currency} />} cursor={{ fill: 'rgba(200,255,0,0.05)' }} />
            <Bar dataKey="revenue" name="revenue" fill="#c8ff00" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tipo de evento + Top clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Donut por tipo */}
        <div
          className="rounded-xl p-5"
          style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
        >
          <SectionTitle>Ingresos por tipo de evento</SectionTitle>
          {pieData.length === 0 ? (
            <div className="text-center py-8 text-[13px]" style={{ color: 'var(--muted)' }}>
              Sin eventos con precio registrado este año
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  dataKey="value"
                  paddingAngle={2}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span style={{ color: 'var(--muted2)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                      {value}
                    </span>
                  )}
                />
                <Tooltip
                  formatter={(value: number) => [fmt(value, currency), '']}
                  contentStyle={{
                    background: 'var(--bg3)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    fontSize: 12,
                    fontFamily: 'var(--font-mono)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top clientes */}
        <div
          className="rounded-xl p-5"
          style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
        >
          <SectionTitle>Top clientes por ingresos</SectionTitle>
          {topClients.filter((c) => c.totalSpent > 0).length === 0 ? (
            <div className="text-center py-8 text-[13px]" style={{ color: 'var(--muted)' }}>
              Sin ingresos registrados por cliente aún
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {topClients.filter((c) => c.totalSpent > 0).slice(0, 5).map((c, i) => (
                <div key={c.name} className="flex items-center gap-3">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                    style={{ background: i === 0 ? 'var(--accent)' : 'var(--bg3)', color: i === 0 ? 'var(--bg)' : 'var(--muted2)' }}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold truncate" style={{ color: 'var(--text)' }}>
                      {c.name}
                    </div>
                    <div className="text-[11px] font-mono" style={{ color: 'var(--muted)' }}>
                      {[c.city, c.state].filter(Boolean).join(', ') || 'Sin ubicación'} · {c.totalEvents} evento{c.totalEvents !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="text-[13px] font-bold font-mono shrink-0" style={{ color: 'var(--accent)' }}>
                    {fmt(c.totalSpent, currency)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pipeline de cotizaciones */}
      <div
        className="rounded-xl p-5 mb-4"
        style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
      >
        <SectionTitle>Pipeline de cotizaciones (año en curso)</SectionTitle>
        {totalPipeline === 0 ? (
          <div className="text-center py-4 text-[13px]" style={{ color: 'var(--muted)' }}>
            Sin cotizaciones este año
          </div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {[
              { key: 'draft', label: 'Borrador', color: 'var(--muted2)' },
              { key: 'sent', label: 'Enviadas', color: '#60a5fa' },
              { key: 'accepted', label: 'Aceptadas', color: 'var(--accent)' },
              { key: 'rejected', label: 'Rechazadas', color: '#ef4444' },
              { key: 'expired', label: 'Expiradas', color: 'var(--muted)' },
            ].map(({ key, label, color }) => {
              const count = pipeline[key as keyof PipelineData]
              const pct = totalPipeline ? Math.round((count / totalPipeline) * 100) : 0
              return (
                <div
                  key={key}
                  className="flex-1 min-w-[120px] rounded-xl p-4 text-center"
                  style={{ background: 'var(--bg3)', border: '1px solid var(--border)' }}
                >
                  <div className="text-[22px] font-extrabold" style={{ color }}>{count}</div>
                  <div className="text-[11px] font-mono mt-1" style={{ color: 'var(--muted2)' }}>{label}</div>
                  <div className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--muted)' }}>{pct}%</div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Geografía */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          className="rounded-xl p-5"
          style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
        >
          <SectionTitle>Clientes por estado</SectionTitle>
          <GeoBar data={clientsByState} max={maxClientState} />
        </div>
        <div
          className="rounded-xl p-5"
          style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
        >
          <SectionTitle>Eventos cerrados por estado</SectionTitle>
          <GeoBar data={eventsByState} max={maxEventState} />
        </div>
      </div>
    </div>
  )
}
