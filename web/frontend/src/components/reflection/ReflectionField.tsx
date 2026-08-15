import { tk } from '@/theme/tokens'

type Props = {
  label: string
  value?: string | null
  isLight: boolean
  editing?: boolean
  onChange?: (value: string) => void
}

export default function ReflectionField({ label, value, isLight, editing = false, onChange }: Props) {
  const c = tk(isLight)

  return (
    <div className="text-center">
      <p className="text-sm mb-2" style={{ fontFamily: 'Inter, sans-serif', color: c.cardMuted }}>{label}</p>
      {editing ? (
        <textarea value={value ?? ''} onChange={event => onChange?.(event.target.value)} rows={2} className="w-full resize-none rounded-xl px-4 py-3 text-center outline-none" style={{ fontFamily: 'Inter, sans-serif', color: c.cardText, background: c.inputBg, border: `1px solid ${c.inputBorder}` }} />
      ) : (
        <p className="text-[clamp(18px,2vw,22px)] leading-snug" style={{ fontFamily: 'Instrument Serif, serif', color: c.cardText }}>{value || '—'}</p>
      )}
    </div>
  )
}
