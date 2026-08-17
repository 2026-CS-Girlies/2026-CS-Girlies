type Props = {
  isLight: boolean
}

export default function HackathonFooter({ isLight }: Props) {
  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] pointer-events-none select-none whitespace-nowrap"
      style={{
        fontFamily: 'Fragment Mono, monospace',
        fontSize: 10,
        letterSpacing: '0.08em',
        color: isLight
          ? 'rgba(0,0,0,0.34)'
          : 'rgba(255,255,255,0.34)',
      }}
    >
      2026 CS GIRLIES HACKATHON
    </div>
  )
}
