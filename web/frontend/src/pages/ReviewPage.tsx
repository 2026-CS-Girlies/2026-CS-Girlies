import { useEffect, useState } from 'react'
import { updateCTReview } from '@/services/conversationApi'
import { bgStyle } from '@/theme/background'
import { tk } from '@/theme/tokens'
import type { CTReviewData } from '@/types/conversation'
import type { BgConfig } from '@/types/theme'

type Props = {
  conversationId: string
  data: CTReviewData
  bg: BgConfig
  isLight: boolean
  onChange: (data: CTReviewData) => void
  onContinue: (data: CTReviewData) => void
  onBack: () => void
}

export default function ReviewPage({ conversationId, data, bg, isLight, onChange, onContinue, onBack }: Props) {
  const [draft, setDraft] = useState<CTReviewData>(data)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const c = tk(isLight)

  useEffect(() => setDraft(data), [data])

  const updateField = (field: keyof CTReviewData, value: string) => {
    setDraft(prev => ({ ...prev, [field]: value }))
  }

  const continueWithReview = async () => {
    try {
      setSaving(true)
      setError('')
      await updateCTReview(conversationId, draft)
      onChange(draft)
      onContinue(draft)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your review.')
    } finally {
      setSaving(false)
    }
  }

  const fields: Array<{ key: keyof CTReviewData; label: string }> = [
    { key: 'situation', label: 'What happened' },
    { key: 'automatic_thought', label: 'The thought that came up' },
    { key: 'intermediate_belief', label: 'What the thought may be connected to' },
    { key: 'core_belief', label: 'A thinking pattern that may be present' },
  ]

  return (
    <div className="relative w-full h-full flex flex-col items-center overflow-auto py-6 px-5 md:px-8 transition-all duration-500" style={bgStyle(bg)}>
      {bg.type === 'image' && <div className="absolute inset-0 pointer-events-none" style={{ background: c.imgOverlay }} />}

      <div className="w-full relative z-10 flex items-center justify-between pt-2 pb-3">
        <div className="flex items-baseline gap-1" style={{ fontFamily: 'Instrument Serif, serif' }}>
          <span className="text-[24px] md:text-[32px]" style={{ color: c.text }}>02</span>
          <span className="text-[18px] md:text-[24px]" style={{ color: c.textFaint }}> / </span>
          <span className="text-[14px] md:text-[18px]" style={{ color: c.textFaint }}>04</span>
        </div>
        <div className="hidden md:block text-sm" style={{ fontFamily: 'Fragment Mono, monospace', color: c.textMuted }}>REVIEW & EDIT</div>
      </div>

      <div className="relative z-10 w-full max-w-[900px] flex flex-col items-center gap-6 md:gap-8">
        <div className="text-center">
          <h1 className="text-[clamp(24px,3.5vw,44px)] leading-tight" style={{ fontFamily: 'Instrument Serif, serif', color: c.textOnCard }}>Does This Feel Accurate?</h1>
          <p className="text-xs md:text-sm mt-2 max-w-lg mx-auto" style={{ fontFamily: 'Inter, sans-serif', color: c.textMuted }}>Here’s what I understood from our conversation. You can change anything that doesn’t feel right.</p>
        </div>

        <div className="rounded-[24px] md:rounded-[30px] w-full px-5 md:px-8 py-8 md:py-10 flex flex-col gap-6" style={{ background: c.cardBg, backdropFilter: 'blur(20px)', boxShadow: isLight ? '0 4px 32px rgba(0,0,0,0.08)' : '0 4px 32px rgba(0,0,0,0.3)' }}>
          {fields.map(({ key, label }) => (
            <div key={key} className="text-center">
              <p className="text-sm mb-2" style={{ fontFamily: 'Inter, sans-serif', color: c.cardMuted }}>{label}</p>
              {editing ? (
                <textarea value={draft[key]} onChange={e => updateField(key, e.target.value)} rows={2} className="w-full resize-none rounded-xl px-4 py-3 text-center outline-none" style={{ fontFamily: 'Inter, sans-serif', color: c.cardText, background: c.inputBg, border: `1px solid ${c.inputBorder}` }} />
              ) : (
                <p className="text-[clamp(15px,2vw,22px)] leading-snug" style={{ fontFamily: 'Instrument Serif, serif', color: c.cardText }}>{draft[key] || '—'}</p>
              )}
            </div>
          ))}

          <p className="text-sm text-center" style={{ fontFamily: 'Inter, sans-serif', color: c.cardMuted }}>This is only an interpretation—not a diagnosis. You have the final say.</p>
          {error && <p className="text-sm text-center text-[#ff6b6b]">{error}</p>}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button onClick={() => setEditing(value => !value)} className="w-full sm:w-auto text-sm font-medium px-6 py-2.5 rounded-lg" style={{ fontFamily: 'Inter, sans-serif', background: '#fff', color: '#111', border: '1px solid rgba(0,0,0,0.12)' }}>
              {editing ? 'Done Editing' : 'Edit'}
            </button>
            <button onClick={() => void continueWithReview()} disabled={saving} className="w-full sm:w-auto text-sm font-medium px-6 py-2.5 rounded-lg disabled:opacity-50" style={{ fontFamily: 'Inter, sans-serif', background: '#111', color: '#fff' }}>
              {saving ? 'Saving…' : 'Continue →'}
            </button>
          </div>
        </div>

        <button onClick={onBack} className="text-sm pb-4" style={{ fontFamily: 'Fragment Mono, monospace', color: c.textMuted }}>← BACK</button>
      </div>
    </div>
  )
}
