type Props = {
  isLight: boolean
  isLoading?: boolean
  onReady: () => void
  onHelp: () => void
  emphasizeReady?: boolean
}

function ChangedIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2.5 7a4.5 4.5 0 0 1 7.5-3.35M11.5 7a4.5 4.5 0 0 1-7.5 3.35" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M10.5 3.5 12 3.65l.15 1.5M3.5 10.5 2 10.35l-.15-1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M7 6.5v3M7 4.5v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

export default function ReflectionGuideActions({ isLight, isLoading = false, onReady, onHelp, emphasizeReady = false }: Props) {
  const buttonStyle = {
    fontFamily: 'Inter, sans-serif',
    fontWeight: 500,
    background: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)',
    border: `0.5px solid ${isLight ? 'rgba(0,0,0,0.09)' : 'rgba(255,255,255,0.11)'}`,
    color: isLight ? '#555555' : '#aaaaaa',
  } as const

  return (
    <div className="flex gap-2 overflow-x-auto pb-0.5">
      <button type="button" onClick={onReady} disabled={isLoading} className={`flex items-center gap-[6px] px-3 py-1.5 rounded-[10px] text-xs whitespace-nowrap transition-all duration-150 hover:opacity-80 active:scale-95 disabled:opacity-40 ${emphasizeReady ? 'demo-ready-sparkle' : ''}`} style={buttonStyle}>
        <span className="flex items-center opacity-70"><ChangedIcon /></span>
        I'm Ready to See What Changed
      </button>

      <button type="button" onClick={onHelp} disabled={isLoading} className="flex items-center gap-[6px] px-3 py-1.5 rounded-[10px] text-xs whitespace-nowrap transition-all duration-150 hover:opacity-80 active:scale-95 disabled:opacity-40" style={buttonStyle}>
        <span className="flex items-center opacity-70"><InfoIcon /></span>
        Tell Me About This Step
      </button>
    </div>
  )
}
