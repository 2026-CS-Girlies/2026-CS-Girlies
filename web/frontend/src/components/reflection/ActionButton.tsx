import type { ButtonHTMLAttributes } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'light' | 'dark'
  isLight?: boolean
}

export default function ActionButton({ variant = 'dark', isLight = false, className = '', style, ...props }: Props) {
  const emphasized = variant === 'light'

  return (
    <button
      {...props}
      className={`text-sm font-semibold flex items-center gap-2 px-4 py-2 rounded-full transition-all hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed ${className}`}
      style={{
        fontFamily: 'Inter, sans-serif',
        color: emphasized ? '#222' : isLight ? 'rgba(0,0,0,0.58)' : 'rgba(255,255,255,0.58)',
        background: emphasized ? isLight ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.90)' : isLight ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${isLight ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.12)'}`,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        ...style,
      }}
    />
  )
}