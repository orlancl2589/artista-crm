interface Props {
  icon: string
  title: string
  description: string
  eta?: string
}

export default function ComingSoon({ icon, title, description, eta }: Props) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-[400px]">
      <div
        className="flex flex-col items-center gap-4 max-w-[380px] text-center rounded-2xl p-10"
        style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
      >
        <div className="text-[48px] leading-none">{icon}</div>

        <div>
          <div
            className="inline-block text-[10px] font-bold uppercase tracking-[1.5px] px-2.5 py-1 rounded-full mb-3"
            style={{ background: 'var(--accent)15', color: 'var(--accent)', border: '1px solid var(--accent)30' }}
          >
            Próximamente
          </div>
          <h2 className="text-[18px] font-extrabold tracking-[-0.3px]" style={{ color: 'var(--text)' }}>
            {title}
          </h2>
        </div>

        <p className="text-[13px] leading-relaxed" style={{ color: 'var(--muted2)' }}>
          {description}
        </p>

        {eta && (
          <div
            className="text-[11px] font-mono px-3 py-1.5 rounded-lg"
            style={{ background: 'var(--bg3)', color: 'var(--muted2)' }}
          >
            {eta}
          </div>
        )}
      </div>
    </div>
  )
}