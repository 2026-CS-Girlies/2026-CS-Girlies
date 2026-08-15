import type { ButtonHTMLAttributes } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'light' | 'dark'
}

export default function ActionButton({ variant = 'dark', className = '', style, ...props }: Props) {
  const isLightVariant = variant === 'light'

  return (
    <button
      {...props}
      className={`text-sm font-medium px-6 py-2.5 rounded-lg disabled:opacity-50 ${className}`}
      style={{
        fontFamily: 'Inter, sans-serif',
        background: isLightVariant ? '#fff' : '#111',
        color: isLightVariant ? '#111' : '#fff',
        border: isLightVariant ? '1px solid rgba(0,0,0,0.12)' : undefined,
        ...style,
      }}
    />
  )
}
