import { useEffect, useState } from 'react'

export const FROM = 'Feels True.'
export const TO = 'Still True?'

export function useEditEffect() {
  const [displayed, setDisplayed] = useState(FROM)
  const [phase, setPhase] = useState<'pause' | 'deleting' | 'typing'>('pause')
  const [cursorVisible, setCursorVisible] = useState(true)

  useEffect(() => {
    const id = setInterval(() => setCursorVisible(v => !v), 530)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>
    if (phase === 'pause') {
      t = setTimeout(() => setPhase('deleting'), 1800)
    } else if (phase === 'deleting') {
      if (displayed.length === 0) t = setTimeout(() => setPhase('typing'), 180)
      else t = setTimeout(() => setDisplayed(d => d.slice(0, -1)), 60 + Math.random() * 40)
    } else {
      if (displayed === TO) t = setTimeout(() => { setDisplayed(FROM); setPhase('pause') }, 3200)
      else t = setTimeout(() => setDisplayed(TO.slice(0, displayed.length + 1)), 80 + Math.random() * 60)
    }
    return () => clearTimeout(t)
  }, [phase, displayed])

  return { displayed, cursorVisible, phase }
}
