import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = '', style, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block font-mono text-[11px] font-semibold uppercase tracking-wide mb-[6px]"
            style={{ color: 'var(--muted2)' }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`w-full rounded-[var(--radius)] px-[14px] py-[10px] text-[13px] outline-none transition-colors duration-150 ${className}`}
          style={{
            background: 'var(--bg3)',
            border: `1px solid ${error ? 'var(--red)' : 'var(--border2)'}`,
            color: 'var(--text)',
            fontFamily: 'var(--font-syne)',
            ...style,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = error ? 'var(--red)' : 'var(--accent)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? 'var(--red)' : 'var(--border2)'
          }}
          {...props}
        />
        {error && (
          <p className="font-mono text-[11px] mt-1" style={{ color: 'var(--red)' }}>
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
