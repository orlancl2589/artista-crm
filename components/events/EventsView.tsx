'use client'

import { useState } from 'react'
import EventList from './EventList'
import EventCalendar from './EventCalendar'

type View = 'list' | 'calendar'

export default function EventsView() {
  const [view, setView] = useState<View>('list')

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex justify-end">
        <div className="flex rounded-[var(--radius)] overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          {(['list', 'calendar'] as View[]).map((v, i) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="px-3 py-[6px] text-[12px] font-medium transition-colors"
              style={{
                background: view === v ? 'var(--bg4)' : 'var(--bg3)',
                color: view === v ? 'var(--text)' : 'var(--muted2)',
                borderRight: i === 0 ? '1px solid var(--border)' : undefined,
              }}
            >
              {v === 'list' ? '≡ Lista' : '⊞ Calendario'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {view === 'list' ? <EventList /> : <EventCalendar />}
      </div>
    </div>
  )
}
