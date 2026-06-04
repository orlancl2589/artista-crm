interface AvatarProps {
  name: string
  size?: number
  emoji?: string
  gradient?: string
}

export default function Avatar({ name, size = 30, emoji, gradient }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((w) => w[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
      style={{
        width: size,
        height: size,
        fontSize: emoji ? size * 0.5 : size * 0.4,
        background: gradient ?? 'var(--bg4)',
      }}
      aria-label={name}
    >
      {emoji ?? initials}
    </div>
  )
}
