import { tk } from '@/theme/tokens'

type Props = {
  isLight: boolean
  onBack: () => void
  backLabel?: string
  onNext: () => void
  nextLabel: string
  nextDisabled?: boolean
}

export default function BottomNav({ isLight, onBack, backLabel = 'BACK', onNext, nextLabel, nextDisabled = false }: Props) {
  const c = tk(isLight)
  const buttonStyle = { fontFamily: 'Fragment Mono, monospace', color: c.textMuted }

  return (
    <div className="px-4 md:px-8 pt-2 pb-4 flex-none flex items-center justify-between">
      <button onClick={onBack} className="hidden md:block text-sm hover:opacity-80" style={buttonStyle}>← {backLabel}</button>
      <div className="md:hidden" />
      <button onClick={onNext} disabled={nextDisabled} className="text-sm disabled:opacity-30 hover:opacity-80" style={buttonStyle}>{nextLabel} →</button>
    </div>
  )
}
