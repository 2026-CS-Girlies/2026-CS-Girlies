import type { ReactNode } from 'react'
import { tk } from '@/theme/tokens'

type Props = {
  title: ReactNode
  description: ReactNode
  isLight: boolean
  className?: string
  maxWidth?: string
}

export default function PageIntro({ title, description, isLight, className = '', maxWidth = 'max-w-lg' }: Props) {
  const c = tk(isLight)

  return (
    <div className={`text-center ${className}`}>
      <h1 className="text-[clamp(24px,3.5vw,44px)] leading-tight" style={{ fontFamily: 'Instrument Serif, serif', color: c.textOnCard }}>{title}</h1>
      <p className={`text-xs md:text-sm mt-2 ${maxWidth} mx-auto`} style={{ fontFamily: 'Inter, sans-serif', color: c.textMuted }}>{description}</p>
    </div>
  )
}
