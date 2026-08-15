import { PRIVACY_NOTE } from '@/data/privacy'
import { tk } from '@/theme/tokens'

export default function PrivacyBottomSheet({ isLight, onClose }: { isLight: boolean; onClose: () => void }) {
  const c = tk(isLight)
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[28px] p-6 flex flex-col gap-4"
        style={{ background: isLight ? '#fff' : '#1a1a1a', boxShadow: '0 -8px 48px rgba(0,0,0,0.25)' }}
      >
        {/* Handle */}
        <div className="w-10 h-1 rounded-full mx-auto mb-1" style={{ background: isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.2)' }} />
        <p className="text-sm font-medium" style={{ fontFamily: 'Inter, sans-serif', color: c.text }}>{PRIVACY_NOTE.title}</p>
        <p className="text-sm leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', color: c.textMuted }}>{PRIVACY_NOTE.body}</p>
        <button className="text-sm underline underline-offset-2 text-left transition-colors" style={{ fontFamily: 'Inter, sans-serif', color: c.textMuted }}>
          {PRIVACY_NOTE.link}
        </button>
        <button
          onClick={onClose}
          className="mt-2 w-full py-3 rounded-2xl text-sm font-medium transition-colors"
          style={{ fontFamily: 'Inter, sans-serif', background: c.btnPrimaryBg, color: c.btnPrimaryText }}
        >
          Got it
        </button>
      </div>
    </>
  )
}
