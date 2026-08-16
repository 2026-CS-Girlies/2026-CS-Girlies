import type { ReactNode } from 'react'
import { tk } from '@/theme/tokens'

type Props = {
  isLight: boolean
  children: ReactNode
  className?: string
}

export default function ContentCard({ isLight, children, className = '' }: Props) {
  const c = tk(isLight)

  return (
    <div className={`rounded-[24px] md:rounded-[30px] w-full px-5 md:px-8 py-8 md:py-10 flex flex-col gap-6 ${className}`} style={{ background: c.cardBg, backdropFilter: 'blur(20px)', boxShadow: isLight ? '0 4px 32px rgba(0,0,0,0.08)' : '0 4px 32px rgba(0,0,0,0.3)' }}>
      {children}
    </div>
  )
}
