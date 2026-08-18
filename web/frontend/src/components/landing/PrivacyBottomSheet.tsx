import Modal from '@/components/common/Modal'
import { PRIVACY_NOTE } from '@/data/privacy'
import { tk } from '@/theme/tokens'

export default function PrivacyBottomSheet({
  isLight,
  onClose,
}: {
  isLight: boolean
  onClose: () => void
}) {
  const c = tk(isLight)

  return (
    <Modal isLight={isLight} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <p
          className="text-sm font-medium pr-10"
          style={{ fontFamily: 'Inter, sans-serif', color: c.text }}
        >
          {PRIVACY_NOTE.title}
        </p>

        <p
          className="text-sm leading-relaxed"
          style={{ fontFamily: 'Inter, sans-serif', color: c.textMuted }}
        >
          {PRIVACY_NOTE.body}
        </p>

        <button
          className="text-sm underline underline-offset-2 text-left transition-opacity hover:opacity-70"
          style={{ fontFamily: 'Inter, sans-serif', color: c.textMuted }}
        >
          {PRIVACY_NOTE.link}
        </button>

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