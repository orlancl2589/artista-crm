'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import NewEventModal from './NewEventModal'

interface CalendarEvent {
  id: string
  title: string
  status: string
  startDate: string
}

const STATUS_COLOR: Record<string, string> = {
  pending:   '#f59e0b',
  confirmed: '#c8ff00',
  completed: '#22c55e',
  cancelled: '#ef4444',
}

const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export default function EventCalendar() {
  const router = useRouter()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | undefined>()

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`
      const res = await fetch(`/api/events?month=${monthStr}&limit=100`)
      if (res.ok) {
        const json = await res.json()
        setEvents(json.data)
      }
    } finally {
      setLoading(false)
    }
  }, [year, month])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  const eventsByDay = events.reduce<Record<number, CalendarEvent[]>>((acc, ev) => {
    const d = new Date(ev.startDate).getDate()
    ;(acc[d] ??= []).push(ev)
    return acc
  }, {})

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const prevMonthDays = new Date(year, month, 0).getDate()
  let startOffset = new Date(year, month, 1).getDay() - 1
  if (startOffset < 0) startOffset = 6

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  type Cell = { day: number; current: boolean; dateStr: string }
  const cells: Cell[] = []

  for (let i = startOffset - 1; i >= 0; i--) {
    const d = prevMonthDays - i
    const pm = month === 0 ? 12 : month
    const py = month === 0 ? year - 1 : year
    cells.push({ day: d, current: false, dateStr: toDateStr(py, pm, d) })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, current: true, dateStr: toDateStr(year, month + 1, d) })
  }
  const nm = month === 11 ? 1 : month + 2
  const ny = month === 11 ? year + 1 : year
  for (let d = 1; cells.length < 42; d++) {
    cells.push({ day: d, current: false, dateStr: toDateStr(ny, nm, d) })
  }

  const todayStr = toDateStr(now.getFullYear(), now.getMonth() + 1, now.getDate())

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-extrabold tracking-[-0.5px]" style={{ color: 'var(--text)' }}>
            Eventos
          </h1>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--muted2)' }}>
            {loading ? 'Cargando...' : `${events.length} evento${events.length !== 1 ? 's' : ''} este mes`}
          </p>
        </div>
        <button
          onClick={() => { setSelectedDate(undefined); setShowModal(true) }}
          className="flex items-center gap-2 px-4 py-[9px] rounded-[var(--radius)] text-[13px] font-bold hover:opacity-90 transition-opacity"
          style={{ background: 'var(--accent)', color: 'var(--bg)' }}
        >
          + Nuevo evento
        </button>
      </div>

      {/* Calendar */}
      <div className="flex-1 flex flex-col rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--bg2)' }}>
        {/* Month nav */}
        <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <button
            onClick={prevMonth}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[15px] transition-colors"
            style={{ color: 'var(--muted2)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg3)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            ←
          </button>
          <span className="font-extrabold text-[15px]" style={{ color: 'var(--text)' }}>
            {MONTH_NAMES[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[15px] transition-colors"
            style={{ color: 'var(--muted2)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg3)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            →
          </button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>
          {DAY_LABELS.map(d => (
            <div key={d} className="text-center py-[7px] text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--muted2)' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 flex-1 overflow-y-auto">
          {cells.map((cell, i) => {
            const dayEvs = cell.current ? (eventsByDay[cell.day] ?? []) : []
            const isToday = cell.current && cell.dateStr === todayStr
            const isLastRow = i >= 35

            return (
              <div
                key={i}
                className="p-1.5 flex flex-col gap-0.5 transition-colors"
                style={{
                  borderRight: (i + 1) % 7 !== 0 ? '1px solid var(--border)' : undefined,
                  borderBottom: !isLastRow ? '1px solid var(--border)' : undefined,
                  opacity: cell.current ? 1 : 0.3,
                  minHeight: '70px',
                  cursor: cell.current ? 'pointer' : 'default',
                  background: isToday ? 'rgba(200,255,0,0.05)' : undefined,
                }}
                onClick={() => {
                  if (!cell.current) return
                  setSelectedDate(cell.dateStr)
                  setShowModal(true)
                }}
              >
                <span
                  className="text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0"
                  style={{
                    background: isToday ? 'var(--accent)' : undefined,
                    color: isToday ? 'var(--bg)' : cell.current ? 'var(--text)' : 'var(--muted)',
                  }}
                >
                  {cell.day}
                </span>

                {dayEvs.slice(0, 2).map(ev => (
                  <div
                    key={ev.id}
                    onClick={e => { e.stopPropagation(); router.push(`/events/${ev.id}`) }}
                    className="truncate text-[10px] font-medium px-1.5 py-[2px] rounded-[3px] cursor-pointer"
                    style={{
                      background: `${STATUS_COLOR[ev.status] ?? '#888'}25`,
                      color: STATUS_COLOR[ev.status] ?? 'var(--muted2)',
                      border: `1px solid ${STATUS_COLOR[ev.status] ?? '#888'}40`,
                    }}
                    title={ev.title}
                  >
                    {ev.title}
                  </div>
                ))}

                {dayEvs.length > 2 && (
                  <span className="text-[9px] pl-1" style={{ color: 'var(--muted2)' }}>
                    +{dayEvs.length - 2} más
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <NewEventModal
        open={showModal}
        onClose={() => { setShowModal(false); setSelectedDate(undefined) }}
        onCreated={fetchEvents}
        initialDate={selectedDate}
      />
    </div>
  )
}
