import { useEffect, useState } from 'react'
import ActionButton from '@/components/reflection/ActionButton'
import ContentCard from '@/components/reflection/ContentCard'
import PageIntro from '@/components/reflection/PageIntro'
import ReflectionField from '@/components/reflection/ReflectionField'
import ReflectionShell from '@/components/reflection/ReflectionShell'
import StepHeader from '@/components/reflection/StepHeader'
import { updateCTReview } from '@/services/conversationApi'
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

const fields: Array<{ key: keyof CTReviewData; label: string }> = [
  { key: 'situation', label: 'What happened' },
  { key: 'automatic_thought', label: 'The thought that came up' },
  { key: 'intermediate_belief', label: 'What the thought may be connected to' },
  { key: 'core_belief', label: 'A thinking pattern that may be present' },
]

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

  return (
    <ReflectionShell bg={bg} isLight={isLight} className="flex flex-col items-center overflow-auto py-6 px-5 md:px-8">
      <StepHeader current="02" total="04" isLight={isLight} desktopLabel="REVIEW & EDIT" className="w-full pt-2 pb-3" />

      <div className="relative z-10 w-full max-w-[900px] flex flex-col items-center gap-6 md:gap-8">
        <PageIntro isLight={isLight} title="Does This Feel Accurate?" description="Here’s what I understood from our conversation. You can change anything that doesn’t feel right." />

        <ContentCard isLight={isLight}>
          {fields.map(({ key, label }) => (
            <ReflectionField key={key} label={label} value={draft[key]} isLight={isLight} editing={editing} onChange={value => updateField(key, value)} />
          ))}

          <p className="text-sm text-center" style={{ fontFamily: 'Inter, sans-serif', color: c.cardMuted }}>This is only an interpretation not a final decision. You have the final say.</p>
          {error && <p className="text-sm text-center text-[#ff6b6b]">{error}</p>}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <ActionButton variant="light" onClick={() => setEditing(value => !value)} className="w-full sm:w-auto">{editing ? 'Done Editing' : 'Edit'}</ActionButton>
            <ActionButton onClick={() => void continueWithReview()} disabled={saving} className="w-full sm:w-auto">{saving ? 'Saving…' : 'Continue →'}</ActionButton>
          </div>
        </ContentCard>

        <button onClick={onBack} className="text-sm pb-4" style={{ fontFamily: 'Fragment Mono, monospace', color: c.textMuted }}>← BACK</button>
      </div>
    </ReflectionShell>
  )
}
