interface CardProps {
  children: React.ReactNode
  title?: string
  className?: string
  style?: React.CSSProperties
}

export default function Card({ children, title, className = '', style }: CardProps) {
  return (
    <div
      className={`rounded-[var(--radius-lg)] p-5 ${className}`}
      style={{ background: 'var(--bg2)', border: '1px solid var(--border)', ...style }}
    >
      {title && (
        <div
          className="font-mono text-[12px] font-bold uppercase tracking-[0.8px] mb-[14px]"
          style={{ color: 'var(--muted2)' }}
        >
          {title}
        </div>
      )}
      {children}
    </div>
  )
}
