import type { ReactNode } from 'react'
import { bgStyle } from '@/theme/background'
import { tk } from '@/theme/tokens'
import type { BgConfig } from '@/types/theme'

type Props = {
  bg: BgConfig
  isLight: boolean
  children: ReactNode
  className?: string
}

export default function ReflectionShell({ bg, isLight, children, className = '' }: Props) {
  const c = tk(isLight)

  return (
    <div className={`relative w-full h-full transition-all duration-500 ${className}`} style={bgStyle(bg)}>
      {bg.type === 'image' && <div className="absolute inset-0 pointer-events-none" style={{ background: c.imgOverlay }} />}
      {children}
    </div>
  )
}
