type StatColor = 'green' | 'blue' | 'purple' | 'orange'

const GLOW_COLORS: Record<StatColor, string> = {
  green:  'var(--green)',
  blue:   'var(--blue)',
  purple: 'var(--purple)',
  orange: 'var(--orange)',
}

interface StatProps {
  label: string
  value: string | number
  delta?: string
  deltaDirection?: 'up' | 'down' | 'neutral'
  color?: StatColor
  accent?: boolean
}

export default function Stat({ label, value, delta, deltaDirection = 'neutral', color = 'green', accent = false }: StatProps) {
  return (
    <div
      className="rounded-[var(--radius-lg)] p-[18px] relative overflow-hidden transition-all duration-200"
      style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
    >
      <div
        className="absolute top-0 right-0 w-[60px] h-[60px] rounded-full pointer-events-none"
        style={{
          background: GLOW_COLORS[color],
          filter: 'blur(30px)',
          opacity: 0.15,
        }}
      />
      <div className="font-mono text-[10px] uppercase tracking-[0.8px] mb-2" style={{ color: 'var(--muted2)' }}>
        {label}
      </div>
      <div
        className="text-[26px] font-extrabold leading-none mb-[6px]"
        style={{ color: accent ? 'var(--accent)' : 'var(--text)' }}
      >
        {value}
      </div>
      {delta && (
        <div
          className="font-mono text-[11px]"
          style={{
            color: deltaDirection === 'up' ? 'var(--green)' : deltaDirection === 'down' ? 'var(--red)' : 'var(--muted2)',
          }}
        >
          {deltaDirection === 'up' ? '↑ ' : deltaDirection === 'down' ? '↓ ' : ''}
          {delta}
        </div>
      )}
    </div>
  )
}
