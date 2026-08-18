import Modal from '@/components/common/Modal'
import { tk } from '@/theme/tokens'

export default function ModelInfoModal({
  isLight,
  onClose,
}: {
  isLight: boolean
  onClose: () => void
}) {
  const c = tk(isLight)

  const PAPER_LINK = 'https://aclanthology.org/2025.emnlp-main.1652/'
  const HUGGING_FACE_LINK = 'https://huggingface.co/thu-coai/Crispers-7B-v1'

  return (
    <Modal isLight={isLight} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <p
          className="text-[11px] uppercase tracking-[0.16em] pr-10"
          style={{
            fontFamily: 'Fragment Mono, monospace',
            color: c.textFaint,
          }}
        >
          About the model
        </p>

        <h2
          className="text-[22px] font-medium leading-tight"
          style={{
            fontFamily: 'Inter, sans-serif',
            color: c.text,
          }}
        >
          Built to help you examine a thought, not simply replace it.
        </h2>

        <p
          className="text-sm leading-relaxed"
          style={{
            fontFamily: 'Inter, sans-serif',
            color: c.textMuted,
          }}
        >
          Still True uses an open-source language model guided by a
          CBT-inspired reflection flow. Instead of immediately turning a
          negative thought into a positive one, it helps you examine what makes
          the thought feel true and build a more balanced view.
        </p>

        <div className="flex gap-4 text-xs">
        <span style={{ color: c.textFaint }}>Model</span>
        <a
            href={HUGGING_FACE_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:opacity-70"
            style={{ color: c.text }}
        >
            CRISPERS 14B ↗
        </a>
        </div>

        <div className="flex gap-4 text-xs">
        <span style={{ color: c.textFaint }}>Paper</span>
        <a
            href={PAPER_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:opacity-70"
            style={{ color: c.text }}
        >
            Crisp: Cognitive Restructuring of Negative Thoughts through Multi-turn Supportive Dialogues ↗
        </a>
        </div>

        <button
          onClick={onClose}
          className="mt-2 w-full py-3 rounded-2xl text-sm font-medium transition-opacity hover:opacity-90"
          style={{
            fontFamily: 'Inter, sans-serif',
            background: c.btnPrimaryBg,
            color: c.btnPrimaryText,
          }}
        >
          Got it
        </button>
      </div>
    </Modal>
  )
}