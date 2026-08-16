import { useEffect, useState } from 'react'
import DustCanvas from '@/components/animation/DustCanvas'
import ActionButton from '@/components/reflection/ActionButton'
import ContentCard from '@/components/reflection/ContentCard'
import PageIntro from '@/components/reflection/PageIntro'
import ReflectionField from '@/components/reflection/ReflectionField'
import ReflectionShell from '@/components/reflection/ReflectionShell'
import StepHeader from '@/components/reflection/StepHeader'
import { getConversationSummary } from '@/services/conversationApi'
import { tk } from '@/theme/tokens'
import type { ModelSummaryData } from '@/types/conversation'
import type { BgConfig } from '@/types/theme'

type Props = {
  conversationId: string
  bg: BgConfig
  isLight: boolean
  onBack: () => void
  onRestart: () => void
}

export const getSummaryItems = (summary?: ModelSummaryData) => [
  ['Original Thought', summary?.original_thought],
  ['Why It Felt True', summary?.why_it_felt_true],
  ['What Changed', summary?.what_changed],
  ['A More Balanced Thought', summary?.balanced_thought],
] as const


export default function FinalReflectionPage({ conversationId, bg, isLight, onBack, onRestart }: Props) {
  const c = tk(isLight)
  const [leaving, setLeaving] = useState(false)
  const [summary, setSummary] = useState<ModelSummaryData>()
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [summaryError, setSummaryError] = useState('')
  const items = getSummaryItems(summary)

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setSummaryLoading(true)
        setSummaryError('')

        const response = await getConversationSummary(conversationId)
        console.log('[QWEN FINAL SUMMARY]', response.data)
        setSummary(response.data)
      } catch (err) {
        console.error('[SUMMARY ERROR]', err)
        setSummaryError(err instanceof Error ? err.message : 'Could not generate summary.')
      } finally {
        setSummaryLoading(false)
      }
    }

    void loadSummary()
  }, [conversationId])

  const handleDownload = () => {
    const now = new Date()
    const formattedDate = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    const content = `
      Still True — Final Reflection

      Date
      ${formattedDate}

      ${items.map(([label, value]) => `${label}\n${value || '—'}`).join('\n\n')}
      `.trim()

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'still-true-reflection.txt'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <>
      {leaving && <DustCanvas isLight={isLight} onDone={onRestart} />}

      <ReflectionShell bg={bg} isLight={isLight} className="flex flex-col overflow-auto px-5 md:px-8 py-6">
        <div style={{ opacity: leaving ? 0 : 1, transform: leaving ? 'scale(0.96)' : 'scale(1)', filter: leaving ? 'blur(10px)' : 'blur(0)', transition: leaving ? 'opacity 0.55s ease-in, transform 0.6s ease-in, filter 0.5s ease-in' : 'none' }}>
          <StepHeader current="03" total="03" isLight={isLight} onRestart={() => setLeaving(true)} restartLabel="START A NEW REFLECTION" className="pb-4" />

          <div className="relative z-10 w-full max-w-[900px] mx-auto flex flex-col items-center gap-6 md:gap-8 pb-8">
            <PageIntro isLight={isLight} title="A Clearer View" description="Here’s how your perspective changed through the conversation — including what stayed uncertain." maxWidth="max-w-xl" />

            <ContentCard isLight={isLight}>
              {summaryLoading ? (
                <p className="text-sm text-center py-8" style={{ fontFamily: 'Inter, sans-serif', color: c.cardMuted }}>Putting your reflection together…</p>
              ) : summaryError ? (
                <p className="text-sm text-center py-8" style={{ fontFamily: 'Inter, sans-serif', color: c.cardMuted }}>{summaryError}</p>
              ) : (
                <>
                  {items.map(([label, value]) => <ReflectionField key={label} label={label} value={value} isLight={isLight} />)}
                  <p className="text-sm text-center pt-2" style={{ fontFamily: 'Inter, sans-serif', color: c.cardMuted }}>This reflection belongs to you. Keep what feels useful and revise anything that doesn’t.</p>
                </>
              )}
            </ContentCard>

            <div className="flex flex-col sm:flex-row gap-3">
              <ActionButton variant="light" onClick={onBack}>← Back</ActionButton>
              <ActionButton onClick={handleDownload} disabled={!summary}>Download Reflection</ActionButton>
            </div>
          </div>
        </div>
      </ReflectionShell>
    </>
  )
}
