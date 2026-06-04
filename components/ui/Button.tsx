import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'

type Variant = 'accent' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const VARIANT_STYLES: Record<Variant, React.CSSProperties> = {
  accent: { background: 'var(--accent)', color: 'var(--bg)' },
  ghost: { background: 'transparent', color: 'var(--text2)', border: '1px solid var(--border2)' },
  danger: { background: 'rgba(239,68,68,0.1)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.2)' },
}

const SIZE_STYLES: Record<Size, string> = {
  sm: 'px-[11px] py-[6px] text-[11px]',
  md: 'px-[14px] py-2 text-[12px]',
  lg: 'px-5 py-[10px] text-[13px]',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'ghost', size = 'md', className = '', style, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`inline-flex items-center gap-[7px] rounded-[var(--radius)] font-semibold cursor-pointer transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${SIZE_STYLES[size]} ${className}`}
        style={{
          fontFamily: 'var(--font-syne)',
          letterSpacing: '0.2px',
          border: 'none',
          ...VARIANT_STYLES[variant],
          ...style,
        }}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
