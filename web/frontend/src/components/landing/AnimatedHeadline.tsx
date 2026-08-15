import type { ReactNode } from 'react'
import { TO, useEditEffect } from '@/hooks/useEditEffect'
import { tk } from '@/theme/tokens'

export default function AnimatedHeadline({ isLight }: { isLight: boolean }) {
  const { displayed, cursorVisible, phase } = useEditEffect()
  const c = tk(isLight)
  const isTyping = phase === 'typing'
  const isDeleting = phase === 'deleting'

  let secondLine: ReactNode
  if (isTyping || displayed === TO) {
    secondLine = displayed.length <= 5
      ? <em style={{ fontStyle: 'italic' }}>{displayed}</em>
      : <><em style={{ fontStyle: 'italic' }}>{displayed.slice(0, 5)}</em>{displayed.slice(5)}</>
  } else {
    secondLine = displayed.length <= 5
      ? <em style={{ fontStyle: 'italic' }}>{displayed}</em>
      : <><em style={{ fontStyle: 'italic' }}>{displayed.slice(0, 5)}</em>{displayed.slice(5)}</>
  }

  return (
    <h1 className="text-[clamp(36px,8vw,80px)] leading-tight text-center transition-colors duration-300" style={{ fontFamily: 'Instrument Serif, serif', color: c.text, textShadow: isLight ? 'none' : '0px 4px 14px rgba(0,0,0,0.35)' }}>
      All negative thoughts
      <br />
      {secondLine}
      {(isDeleting || isTyping || phase === 'pause') && (
        <span style={{ display: 'inline-block', width: '3px', height: '0.85em', background: c.cursor, marginLeft: '2px', verticalAlign: 'middle', borderRadius: '1px', opacity: cursorVisible ? 1 : 0, transition: 'opacity 0.1s' }} />
      )}
    </h1>
  )
}
