import { RotateCcw } from 'lucide-react'
import { bgStyle } from '@/theme/background'
import { tk } from '@/theme/tokens'
import type { CTReviewData, FinalReflectionData } from '@/types/conversation'
import type { BgConfig } from '@/types/theme'

type ReflectionFlow = 'two-step' | 'one-step'

type Props = {
  ctReview: CTReviewData
  result: FinalReflectionData
  bg: BgConfig
  isLight: boolean
  flow: ReflectionFlow
  onBack: () => void
  onRestart: () => void
}

export default function FinalReflectionPage({ ctReview, result, bg, isLight, flow, onBack, onRestart }: Props) {
  const c = tk(isLight)
  // dynamic flow
  const currentStep =
    flow === 'one-step' ? '02' : '04'

  const totalSteps =
    flow === 'one-step' ? '02' : '04'

  // file download function
  //TODO: Encrypt the reflection data and save it to a file for download
  const handleDownload = () => {

    const now = new Date()

    const formattedDate = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    const fileDate = now.toISOString().split('T')[0]
     
    const content = `
      Still True — Final Reflection

      Date
      ${formattedDate}

      The Situation
      ${result.situation || ctReview.situation}

      The Original Thought
      ${result.original_thought || ctReview.automatic_thought}

      Why It Felt True
      ${result.why_it_felt_true}

      What It May Have Left Out
      ${result.what_it_may_have_left_out}

      A More Balanced Thought
      ${result.balanced_thought}

      One Small Next Step
      ${result.next_step}
      `.trim()

    const blob = new Blob([content], {
      type: 'text/plain;charset=utf-8',
    })

    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = 'still-true-reflection.txt'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }


  const items = [
    ['The Situation', result.situation || ctReview.situation],
    ['The Original Thought', result.original_thought || ctReview.automatic_thought],
    ['A More Balanced Thought', result.balanced_thought],
    ['One Small Next Step', result.next_step],
  ] as const

  return (
    <div className="relative w-full h-full flex flex-col overflow-auto px-5 md:px-8 py-6 transition-all duration-500" style={bgStyle(bg)}>
      {bg.type === 'image' && <div className="absolute inset-0 pointer-events-none" style={{ background: c.imgOverlay }} />}

      <div className="relative z-10 flex items-center justify-between pb-4">
        <div className="flex items-baseline gap-1" style={{ fontFamily: 'Instrument Serif, serif' }}>
          <span className="text-[24px] md:text-[32px]" style={{ color: c.text }}>{currentStep}</span>
          <span className="text-[18px] md:text-[24px]" style={{ color: c.textFaint }}> / </span>
          <span className="text-[14px] md:text-[18px]" style={{ color: c.textFaint }}>{totalSteps}</span>
        </div>
        <button onClick={onRestart} className="hidden md:flex gap-2 text-sm hover:opacity-80" style={{ fontFamily: 'Fragment Mono, monospace', color: c.textMuted }}>
          <RotateCcw size={18} /> START A NEW REFLECTION
        </button>
      </div>

      <div className="relative z-10 w-full max-w-[900px] mx-auto flex flex-col items-center gap-6 md:gap-8 pb-8">
        <div className="text-center">
          <h1 className="text-[clamp(24px,3.5vw,44px)] leading-tight" style={{ fontFamily: 'Instrument Serif, serif', color: c.textOnCard }}>A Clearer View</h1>
          <p className="text-xs md:text-sm mt-2 max-w-xl mx-auto" style={{ fontFamily: 'Inter, sans-serif', color: c.textMuted }}>You examined the thought from more than one side. Here’s the perspective you arrived at.</p>
        </div>

        <div className="rounded-[24px] md:rounded-[30px] w-full px-5 md:px-8 py-8 md:py-10 flex flex-col gap-6" style={{ background: c.cardBg, backdropFilter: 'blur(20px)', boxShadow: isLight ? '0 4px 32px rgba(0,0,0,0.08)' : '0 4px 32px rgba(0,0,0,0.3)' }}>
          {items.map(([label, value]) => (
            <div key={label} className="text-center">
              <p className="text-sm mb-2" style={{ fontFamily: 'Inter, sans-serif', color: c.cardMuted }}>{label}</p>
              <p className="text-[clamp(18px,2vw,22px)] leading-snug" style={{ fontFamily: 'Instrument Serif, serif', color: c.cardText }}>{value || '—'}</p>
            </div>
          ))}

          <p className="text-sm text-center pt-2" style={{ fontFamily: 'Inter, sans-serif', color: c.cardMuted }}>This reflection belongs to you. Keep what feels useful and revise anything that doesn’t.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={onBack} className="text-sm font-medium px-6 py-2.5 rounded-lg" style={{ fontFamily: 'Inter, sans-serif', background: '#fff', color: '#111', border: '1px solid rgba(0,0,0,0.12)' }}>← Back</button>
          <button onClick={handleDownload} className="text-sm font-medium px-6 py-2.5 rounded-lg" style={{ fontFamily: 'Inter, sans-serif', background: '#111', color: '#fff' }}>Download Reflection</button>
        </div>
      </div>
    </div>
  )
}
