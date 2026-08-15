import { useRef, type ChangeEvent } from 'react'
import { SOUNDS, PRESET_COLORS } from '@/theme/presets'
import { tk } from '@/theme/tokens'
import type { BgConfig, SoundId } from '@/types/theme'

export default function CustomizePanel({ current, onChange, onClose, isLight, soundId, onSoundChange }: {
  current: BgConfig; onChange: (bg: BgConfig) => void; onClose: () => void; isLight: boolean
  soundId: SoundId; onSoundChange: (s: SoundId) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const c = tk(isLight)

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    onChange({ type: 'image', url: URL.createObjectURL(file) })
    onClose()
  }

  return (
    <div className="absolute bottom-20 right-5 md:right-8 z-30 w-72 rounded-2xl p-5 flex flex-col gap-5 transition-all duration-300"
      style={{ background: isLight ? 'rgba(255,255,255,0.95)' : 'rgba(20,20,20,0.96)', border: `1px solid ${c.border}`, boxShadow: isLight ? '0 16px 48px rgba(0,0,0,0.15)' : '0 16px 48px rgba(0,0,0,0.6)', backdropFilter: 'blur(16px)' }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium" style={{ fontFamily: 'Inter, sans-serif', color: c.text }}>Customize</span>
        <button onClick={onClose} className="text-lg leading-none transition-colors" style={{ color: c.textFaint }}>×</button>
      </div>

      {/* Sound */}
      <div>
        <p className="text-xs mb-3" style={{ fontFamily: 'Inter, sans-serif', color: c.textFaint }}>SOUND</p>
        <div className="grid grid-cols-3 gap-2">
          {SOUNDS.map(s => {
            const active = soundId === s.id
            return (
              <button key={s.id} onClick={() => onSoundChange(s.id)}
                className="flex flex-col items-center gap-1.5 py-2.5 rounded-xl text-xs font-medium transition-all"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  background: active ? (isLight ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.18)') : 'transparent',
                  border: `1.5px solid ${active ? c.text : c.borderFaint}`,
                  color: active ? c.text : c.textMuted,
                }}>
                <span style={{ color: active ? c.text : c.textMuted }}>{s.icon}</span>
                {s.label}
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${c.divider}` }} />

      {/* Background color */}
      <div>
        <p className="text-xs mb-3" style={{ fontFamily: 'Inter, sans-serif', color: c.textFaint }}>COLOR</p>
        <div className="grid grid-cols-4 gap-2">
          {PRESET_COLORS.map(color => (
            <button key={color} onClick={() => onChange({ type: 'color', value: color })}
              className="w-full aspect-square rounded-xl transition-transform hover:scale-105"
              style={{ background: color, border: current.type === 'color' && current.value === color ? `2px solid ${c.text}` : `1.5px solid ${c.border}` }} />
          ))}
          <label className="w-full aspect-square rounded-xl flex items-center justify-center cursor-pointer hover:scale-105 transition-transform" style={{ border: `1.5px dashed ${c.border}` }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke={c.textFaint} strokeWidth="1.2"/>
              <path d="M8 5v6M5 8h6" stroke={c.textFaint} strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <input type="color" className="sr-only" defaultValue="#0f0f0f" onChange={e => onChange({ type: 'color', value: e.target.value })} />
          </label>
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${c.divider}` }} />

      {/* Photo */}
      <div>
        <p className="text-xs mb-3" style={{ fontFamily: 'Inter, sans-serif', color: c.textFaint }}>PHOTO</p>
        <button onClick={() => fileRef.current?.click()}
          className="w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
          style={{ border: `1.5px dashed ${c.border}`, fontFamily: 'Inter, sans-serif', color: c.textMuted }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 12l4-4 2 2 3-4 3 6H2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
            <circle cx="5" cy="5" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
            <rect x="1" y="1" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.2"/>
          </svg>
          Upload photo
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        {current.type === 'image' && (
          <button onClick={() => onChange({ type: 'color', value: '#0f0f0f' })}
            className="w-full mt-2 py-2 text-xs transition-colors"
            style={{ fontFamily: 'Inter, sans-serif', color: c.textFaint }}>
            Remove photo
          </button>
        )}
      </div>
    </div>
  )
}
