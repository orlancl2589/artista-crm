type BadgeVariant = 'green' | 'blue' | 'purple' | 'orange' | 'red' | 'gray' | 'accent'

const BADGE_STYLES: Record<BadgeVariant, React.CSSProperties> = {
  green:  { background: 'rgba(34,197,94,.12)',   color: 'var(--green)'  },
  blue:   { background: 'rgba(59,130,246,.12)',   color: 'var(--blue)'   },
  purple: { background: 'rgba(168,85,247,.12)',   color: 'var(--purple)' },
  orange: { background: 'rgba(249,115,22,.12)',   color: 'var(--orange)' },
  red:    { background: 'rgba(239,68,68,.12)',    color: 'var(--red)'    },
  gray:   { background: 'rgba(136,136,136,.12)', color: 'var(--muted2)' },
  accent: { background: 'rgba(200,255,0,.12)',    color: 'var(--accent)' },
}

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

export default function Badge({ variant = 'gray', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-[5px] px-[9px] py-[3px] rounded-[20px] text-[10px] font-semibold font-mono tracking-[0.3px] ${className}`}
      style={BADGE_STYLES[variant]}
    >
      {children}
    </span>
  )
}
