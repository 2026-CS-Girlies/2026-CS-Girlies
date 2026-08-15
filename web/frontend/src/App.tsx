import { useState, useRef, useEffect, KeyboardEvent, type ReactNode } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Screen = 'landing' | 'capture' | 'analyze' | 'howItWorks'
type BgConfig = { type: 'color'; value: string } | { type: 'image'; url: string }

interface Message {
  id: number
  role: 'assistant' | 'user'
  text: string
}

// ─── Theme helpers ────────────────────────────────────────────────────────────

function hexLuminance(hex: string): number {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16) / 255
  const g = parseInt(clean.slice(2, 4), 16) / 255
  const b = parseInt(clean.slice(4, 6), 16) / 255
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function measureImageBrightness(url: string): Promise<number> {
  return new Promise(resolve => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 64
      canvas.height = 64
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, 64, 64)
      const { data } = ctx.getImageData(0, 0, 64, 64)
      let total = 0
      for (let i = 0; i < data.length; i += 4) {
        total += (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255
      }
      resolve(total / (data.length / 4))
    }
    img.onerror = () => resolve(0)
    img.src = url
  })
}

// t = theme tokens derived from isLight
function tk(isLight: boolean) {
  return {
    text:        isLight ? '#111111' : '#ffffff',
    textMuted:   isLight ? '#555555' : '#aaaaaa',
    textFaint:   isLight ? '#888888' : '#666666',
    textOnCard:  isLight ? '#111111' : '#ffffff',
    border:      isLight ? 'rgba(0,0,0,0.12)'  : 'rgba(255,255,255,0.13)',
    borderFaint: isLight ? 'rgba(0,0,0,0.08)'  : 'rgba(255,255,255,0.08)',
    // glossy panel
    panelBg:     isLight ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.07)',
    panelShadow: isLight
      ? '0 8px 48px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.8)'
      : '0 8px 48px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.12)',
    // bubbles
    userBubbleBg: isLight ? 'rgba(0,0,0,0.08)'  : 'rgba(255,255,255,0.18)',
    userBubbleBorder: isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.22)',
    userBubbleText: isLight ? '#111' : '#fff',
    asstBubbleBg: isLight ? 'rgba(0,0,0,0.05)'  : 'rgba(255,255,255,0.10)',
    asstBubbleBorder: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.14)',
    asstBubbleText: isLight ? '#333' : 'rgba(255,255,255,0.88)',
    // input
    inputBg:     isLight ? 'rgba(0,0,0,0.06)'  : 'rgba(255,255,255,0.10)',
    inputBorder: isLight ? 'rgba(0,0,0,0.12)'  : 'rgba(255,255,255,0.15)',
    inputText:   isLight ? '#111' : '#fff',
    inputPlaceholder: isLight ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.4)',
    // send button
    sendBg:      isLight ? 'rgba(0,0,0,0.10)'  : 'rgba(255,255,255,0.18)',
    sendBorder:  isLight ? 'rgba(0,0,0,0.15)'  : 'rgba(255,255,255,0.25)',
    // nav/action buttons
    btnPrimaryBg:   isLight ? '#111' : '#fff',
    btnPrimaryText: isLight ? '#fff' : '#111',
    btnSecondaryBg:   isLight ? '#fff' : '#111',
    btnSecondaryText: isLight ? '#111' : '#fff',
    btnSecondaryBorder: isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)',
    // customize button
    customizeBg:     isLight ? 'rgba(0,0,0,0.06)'  : 'rgba(255,255,255,0.06)',
    customizeBorder: isLight ? 'rgba(0,0,0,0.12)'  : 'rgba(255,255,255,0.12)',
    customizeText:   isLight ? '#444' : '#aaa',
    // divider
    divider: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.10)',
    // overlay for images
    imgOverlay: isLight ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.50)',
    // cursor
    cursor: isLight ? '#111' : '#fff',
    // card (summary)
    cardBg:     isLight ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,1)',
    cardText:   '#111',
    cardMuted:  '#888',
  }
}

// ─── Shared ───────────────────────────────────────────────────────────────────

const EXAMINE_PROMPTS: Message[] = [
  { id: 1, role: 'assistant', text: "You've given this thought a fair hearing. Is there anything that doesn't fully fit it — even a small exception?" },
]

function SendIcon({ color = '#BBBBBB' }: { color?: string }) {
  return (
    <svg width="13" height="15" viewBox="0 0 13 15" fill="none">
      <path d="M6.5 14.5V1M6.5 1L1 6.5M6.5 1L12 6.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function bgStyle(bg: BgConfig): React.CSSProperties {
  return bg.type === 'image'
    ? { backgroundImage: `url(${bg.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { backgroundColor: bg.value }
}

// ─── NavBar ───────────────────────────────────────────────────────────────────

function NavBar({ onRestart, isLight, onHowItWorks }: { onRestart: () => void; isLight: boolean; onHowItWorks?: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const c = tk(isLight)

  return (
    <nav className="absolute top-0 left-0 right-0 z-20 px-5 md:px-8 py-4 md:py-5">
      <div className="flex items-center justify-between">
        <span
          className="font-semibold text-[17px] cursor-pointer select-none transition-colors duration-300"
          style={{ fontFamily: 'Inter, sans-serif', color: c.text }}
          onClick={onRestart}
        >
          Still True?
        </span>

        <div className="hidden md:flex items-center gap-8">
          <button onClick={onHowItWorks} className="text-sm transition-colors duration-300 hover:opacity-70" style={{ fontFamily: 'Inter, sans-serif', color: c.textMuted, fontWeight: 400 }}>How It Works</button>
          {['Technical Docs', 'Privacy'].map(label => (
            <span key={label} className="text-sm transition-colors duration-300" style={{ fontFamily: 'Inter, sans-serif', color: c.textMuted, fontWeight: 400 }}>{label}</span>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <span className="text-sm font-medium flex items-center gap-1.5 transition-colors duration-300" style={{ fontFamily: 'Inter, sans-serif', color: c.text }}>
            Download Local App
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v8M7 9l-3-3M7 9l3-3" stroke={c.text} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12h10" stroke={c.text} strokeWidth="1.25" strokeLinecap="round"/>
            </svg>
          </span>
          <button
            className="text-sm font-medium px-3 py-1.5 rounded-2xl transition-colors duration-300"
            style={{ fontFamily: 'Inter, sans-serif', background: c.btnPrimaryBg, color: c.btnPrimaryText }}
          >
            Reflect Online
          </button>
        </div>

        <button className="md:hidden flex flex-col gap-1.5 p-1" onClick={() => setMenuOpen(o => !o)}>
          {[0, 1, 2].map(i => (
            <span key={i} className="block w-5 h-px transition-all origin-center" style={{ background: c.text, transform: menuOpen ? (i === 0 ? 'rotate(45deg) translateY(7px)' : i === 2 ? 'rotate(-45deg) translateY(-7px)' : undefined) : undefined, opacity: menuOpen && i === 1 ? 0 : 1 }} />
          ))}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden mt-4 flex flex-col gap-4 py-5 px-4 rounded-2xl" style={{ background: isLight ? 'rgba(255,255,255,0.92)' : 'rgba(30,30,30,0.95)', border: `1px solid ${c.border}`, backdropFilter: 'blur(12px)' }}>
          <button onClick={() => { setMenuOpen(false); onHowItWorks?.() }} className="text-sm text-left transition-opacity hover:opacity-70" style={{ fontFamily: 'Inter, sans-serif', color: c.textMuted }}>How It Works</button>
          {['Technical Docs', 'Privacy'].map(label => (
            <span key={label} className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: c.textMuted }}>{label}</span>
          ))}
          <div className="pt-3 flex flex-col gap-3" style={{ borderTop: `1px solid ${c.divider}` }}>
            <button className="text-sm font-medium px-3 py-2 rounded-2xl w-full" style={{ background: c.btnPrimaryBg, color: c.btnPrimaryText, fontFamily: 'Inter, sans-serif' }}>Reflect Online</button>
          </div>
        </div>
      )}
    </nav>
  )
}

// ─── Animated headline ────────────────────────────────────────────────────────

const FROM = 'Feels True.'
const TO = 'Still True?'

function useEditEffect() {
  const [displayed, setDisplayed] = useState(FROM)
  const [phase, setPhase] = useState<'pause' | 'deleting' | 'typing'>('pause')
  const [cursorVisible, setCursorVisible] = useState(true)

  useEffect(() => {
    const id = setInterval(() => setCursorVisible(v => !v), 530)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>
    if (phase === 'pause') {
      t = setTimeout(() => setPhase('deleting'), 1800)
    } else if (phase === 'deleting') {
      if (displayed.length === 0) t = setTimeout(() => setPhase('typing'), 180)
      else t = setTimeout(() => setDisplayed(d => d.slice(0, -1)), 60 + Math.random() * 40)
    } else {
      if (displayed === TO) t = setTimeout(() => { setDisplayed(FROM); setPhase('pause') }, 3200)
      else t = setTimeout(() => setDisplayed(TO.slice(0, displayed.length + 1)), 80 + Math.random() * 60)
    }
    return () => clearTimeout(t)
  }, [phase, displayed])

  return { displayed, cursorVisible, phase }
}

function AnimatedHeadline({ isLight }: { isLight: boolean }) {
  const { displayed, cursorVisible, phase } = useEditEffect()
  const c = tk(isLight)
  const isTyping = phase === 'typing'
  const isDeleting = phase === 'deleting'

  let secondLine: ReactNode
  if (isTyping || displayed === TO) {
    secondLine = displayed.length <= 5
      ? <em style={{ fontStyle: 'italic' }}>{displayed}</em>
      : <><em style={{ fontStyle: 'italic' }}>{displayed.slice(0, 5)}</em>{displayed.slice(5)}</>
  } else {
    secondLine = displayed.length <= 5
      ? <em style={{ fontStyle: 'italic' }}>{displayed}</em>
      : <><em style={{ fontStyle: 'italic' }}>{displayed.slice(0, 5)}</em>{displayed.slice(5)}</>
  }

  return (
    <h1 className="text-[clamp(36px,8vw,80px)] leading-tight text-center transition-colors duration-300" style={{ fontFamily: 'Instrument Serif, serif', color: c.text, textShadow: isLight ? 'none' : '0px 4px 14px rgba(0,0,0,0.35)' }}>
      All negative thoughts
      <br />
      {secondLine}
      {(isDeleting || isTyping || phase === 'pause') && (
        <span style={{ display: 'inline-block', width: '3px', height: '0.85em', background: c.cursor, marginLeft: '2px', verticalAlign: 'middle', borderRadius: '1px', opacity: cursorVisible ? 1 : 0, transition: 'opacity 0.1s' }} />
      )}
    </h1>
  )
}

// ─── Ambient sound synthesis ─────────────────────────────────────────────────

type SoundId = 'none' | 'rain' | 'ocean' | 'fire' | 'wind' | 'forest'
type ThemeId = SoundId

interface ThemePreset {
  id: ThemeId; label: string; icon: ReactNode
  bg: BgConfig; sound: SoundId; swatch: string
}

const SOUNDS: { id: SoundId; label: string; icon: ReactNode }[] = [
  { id: 'none',   label: 'Mute',   icon: <SoundOffIcon /> },
  { id: 'rain',   label: 'Rain',   icon: <SoundRainIcon /> },
  { id: 'ocean',  label: 'Ocean',  icon: <SoundOceanIcon /> },
  { id: 'forest', label: 'Forest', icon: <SoundForestIcon /> },
  { id: 'fire',   label: 'Fire',   icon: <SoundFireIcon /> },
  { id: 'wind',   label: 'Wind',   icon: <SoundWindIcon /> },
]

const THEMES: ThemePreset[] = [
  { id: 'rain',   label: 'Rain',   icon: <SoundRainIcon />,   sound: 'rain',   swatch: '#1a2535', bg: { type: 'color', value: '#1a2535' } },
  { id: 'ocean',  label: 'Ocean',  icon: <SoundOceanIcon />,  sound: 'ocean',  swatch: '#0d2137', bg: { type: 'color', value: '#0d2137' } },
  { id: 'forest', label: 'Forest', icon: <SoundForestIcon />, sound: 'forest', swatch: '#111e14', bg: { type: 'color', value: '#111e14' } },
  { id: 'fire',   label: 'Fire',   icon: <SoundFireIcon />,   sound: 'fire',   swatch: '#1e1008', bg: { type: 'color', value: '#1e1008' } },
  { id: 'wind',   label: 'Wind',   icon: <SoundWindIcon />,   sound: 'wind',   swatch: '#161620', bg: { type: 'color', value: '#161620' } },
  { id: 'none',   label: 'Simple', icon: <SoundOffIcon />,    sound: 'none',   swatch: '#0f0f0f', bg: { type: 'color', value: '#0f0f0f' } },
]

function SoundOffIcon()    { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 7h2l4-4v14l-4-4H3V7z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><line x1="13" y1="6" x2="16" y2="12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><line x1="16" y1="6" x2="13" y2="12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> }
function SoundRainIcon()   { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 8a5 5 0 1 1 10 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><rect x="3" y="8" width="12" height="3" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><line x1="6" y1="14" x2="5" y2="16" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><line x1="9" y1="14" x2="8" y2="16" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><line x1="12" y1="14" x2="11" y2="16" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> }
function SoundOceanIcon()  { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 10c1.5-2 3-2 4.5 0s3 2 4.5 0 3-2 4.5 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M2 13c1.5-2 3-2 4.5 0s3 2 4.5 0 3-2 4.5 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M6 4c0 2-2 3-2 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M10 2c0 3-3 4-3 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> }
function SoundForestIcon() { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2l4 6H5l4-6z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M9 7l3.5 5.5h-7L9 7z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><line x1="9" y1="13" x2="9" y2="16" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> }
function SoundFireIcon()   { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 16c-3 0-5-2-5-5 0-2 1-3.5 2-4.5 0 2 1 3 2 3-1-3 1-6 3-7.5 0 3 2 4.5 2 7 1-1 1-2.5 1-3.5 1 1.5 2 3 2 5 0 3-2 5-7 5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg> }
function SoundWindIcon()   { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 7h9a2 2 0 0 0 0-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M2 10h12a2 2 0 0 1 0 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M2 13h7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> }

// Stopwatch-style cleanup container for Web Audio nodes
type StopFn = () => void

function buildRain(ctx: AudioContext): StopFn {
  const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true
  const lpf = ctx.createBiquadFilter(); lpf.type = 'lowpass'; lpf.frequency.value = 1800
  const hpf = ctx.createBiquadFilter(); hpf.type = 'highpass'; hpf.frequency.value = 400
  const gain = ctx.createGain(); gain.gain.value = 0.35
  src.connect(lpf); lpf.connect(hpf); hpf.connect(gain); gain.connect(ctx.destination)
  src.start()
  return () => { try { src.stop(); src.disconnect() } catch {} }
}

function buildOcean(ctx: AudioContext): StopFn {
  const buf = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true
  const lpf = ctx.createBiquadFilter(); lpf.type = 'lowpass'; lpf.frequency.value = 800
  const gain = ctx.createGain(); gain.gain.value = 0.28
  // LFO for wave rhythm
  const lfo = ctx.createOscillator(); lfo.frequency.value = 0.18
  const lfoGain = ctx.createGain(); lfoGain.gain.value = 0.22
  lfo.connect(lfoGain); lfoGain.connect(gain.gain)
  src.connect(lpf); lpf.connect(gain); gain.connect(ctx.destination)
  lfo.start(); src.start()
  return () => { try { src.stop(); lfo.stop(); src.disconnect(); lfo.disconnect() } catch {} }
}

function buildFire(ctx: AudioContext): StopFn {
  // Brown noise: integrate white noise
  const buf = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate)
  const d = buf.getChannelData(0)
  let last = 0
  for (let i = 0; i < d.length; i++) {
    const w = Math.random() * 2 - 1
    last = (last + 0.02 * w) / 1.02
    d[i] = last * 3.5
  }
  const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true
  const lpf = ctx.createBiquadFilter(); lpf.type = 'lowpass'; lpf.frequency.value = 600
  const gain = ctx.createGain(); gain.gain.value = 0.55
  // Slow flicker LFO
  const lfo = ctx.createOscillator(); lfo.frequency.value = 0.6 + Math.random() * 0.4
  const lfoGain = ctx.createGain(); lfoGain.gain.value = 0.08
  lfo.connect(lfoGain); lfoGain.connect(gain.gain)
  src.connect(lpf); lpf.connect(gain); gain.connect(ctx.destination)
  lfo.start(); src.start()
  return () => { try { src.stop(); lfo.stop(); src.disconnect(); lfo.disconnect() } catch {} }
}

function buildWind(ctx: AudioContext): StopFn {
  const buf = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true
  const bpf = ctx.createBiquadFilter(); bpf.type = 'bandpass'; bpf.frequency.value = 320; bpf.Q.value = 0.8
  const gain = ctx.createGain(); gain.gain.value = 0.45
  const lfo = ctx.createOscillator(); lfo.frequency.value = 0.07
  const lfoFreq = ctx.createGain(); lfoFreq.gain.value = 180
  lfo.connect(lfoFreq); lfoFreq.connect(bpf.frequency)
  const lfoGain = ctx.createGain(); lfoGain.gain.value = 0.15
  const lfo2 = ctx.createOscillator(); lfo2.frequency.value = 0.22
  lfo2.connect(lfoGain); lfoGain.connect(gain.gain)
  src.connect(bpf); bpf.connect(gain); gain.connect(ctx.destination)
  lfo.start(); lfo2.start(); src.start()
  return () => { try { src.stop(); lfo.stop(); lfo2.stop(); src.disconnect(); lfo.disconnect(); lfo2.disconnect() } catch {} }
}

function buildForest(ctx: AudioContext): StopFn {
  // Soft background noise
  const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true
  const lpf = ctx.createBiquadFilter(); lpf.type = 'bandpass'; lpf.frequency.value = 1200; lpf.Q.value = 0.5
  const gain = ctx.createGain(); gain.gain.value = 0.08
  src.connect(lpf); lpf.connect(gain); gain.connect(ctx.destination)
  src.start()

  // Occasional bird chirps
  const chirpIds: ReturnType<typeof setTimeout>[] = []
  function scheduleChirp() {
    const delay = 1500 + Math.random() * 4000
    const id = setTimeout(() => {
      try {
        const osc = ctx.createOscillator()
        const env = ctx.createGain()
        const freq = 1800 + Math.random() * 1400
        osc.type = 'sine'; osc.frequency.value = freq
        env.gain.setValueAtTime(0, ctx.currentTime)
        env.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.04)
        env.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)
        osc.connect(env); env.connect(ctx.destination)
        osc.start(); osc.stop(ctx.currentTime + 0.3)
        // Second note
        setTimeout(() => {
          try {
            const o2 = ctx.createOscillator(); const e2 = ctx.createGain()
            o2.type = 'sine'; o2.frequency.value = freq * (Math.random() > 0.5 ? 1.2 : 0.85)
            e2.gain.setValueAtTime(0, ctx.currentTime)
            e2.gain.linearRampToValueAtTime(0.09, ctx.currentTime + 0.03)
            e2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2)
            o2.connect(e2); e2.connect(ctx.destination)
            o2.start(); o2.stop(ctx.currentTime + 0.25)
          } catch {}
        }, 180)
      } catch {}
      scheduleChirp()
    }, delay)
    chirpIds.push(id)
  }
  scheduleChirp()

  return () => {
    try { src.stop(); src.disconnect() } catch {}
    chirpIds.forEach(clearTimeout)
  }
}

const BUILDERS: Record<Exclude<SoundId, 'none'>, (ctx: AudioContext) => StopFn> = {
  rain: buildRain, ocean: buildOcean, fire: buildFire, wind: buildWind, forest: buildForest,
}

function useAmbientSound(soundId: SoundId) {
  const ctxRef = useRef<AudioContext | null>(null)
  const stopRef = useRef<StopFn | null>(null)

  useEffect(() => {
    // Tear down previous
    stopRef.current?.()
    stopRef.current = null

    if (soundId === 'none') {
      ctxRef.current?.close()
      ctxRef.current = null
      return
    }

    const ctx = ctxRef.current ?? new AudioContext()
    ctxRef.current = ctx
    if (ctx.state === 'suspended') ctx.resume()

    stopRef.current = BUILDERS[soundId](ctx)

    return () => {
      stopRef.current?.()
      stopRef.current = null
    }
  }, [soundId])

  // Cleanup on unmount
  useEffect(() => () => {
    stopRef.current?.()
    ctxRef.current?.close()
  }, [])
}

// ─── Customize panel ──────────────────────────────────────────────────────────

const PRESET_COLORS = [
  '#0f0f0f', '#1a1a2e', '#0d1b2a', '#2d1b33',
  '#f5f0e8', '#e8f0f5', '#f0f5e8', '#f5e8e8',
]

function CustomizePanel({ current, onChange, onClose, isLight, soundId, onSoundChange }: {
  current: BgConfig; onChange: (bg: BgConfig) => void; onClose: () => void; isLight: boolean
  soundId: SoundId; onSoundChange: (s: SoundId) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const c = tk(isLight)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
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

// ─── Landing ──────────────────────────────────────────────────────────────────

const PRIVACY_NOTE = {
  title: 'A note before you begin',
  body: 'Still True is a guided self-reflection tool, not therapy, diagnosis, or medical advice. Your conversations are not saved by Still True. Some content may be processed temporarily by the selected AI provider to generate responses.',
  link: 'Learn how your privacy is protected',
}

function PrivacyBottomSheet({ isLight, onClose }: { isLight: boolean; onClose: () => void }) {
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

// ─── Theme Button (radial menu) ───────────────────────────────────────────────

function ThemeButton({ isLight, onTheme, onCustomize }: {
  isLight: boolean
  onTheme: (bg: BgConfig, sound: SoundId) => void
  onCustomize: () => void
}) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const c = tk(isLight)

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => requestAnimationFrame(() => setMounted(true)))
    } else {
      setMounted(false)
    }
  }, [open])

  // 6 items spread 240° arc (top-left quadrant through top-right, bottom)
  // Position: fixed bottom-right corner, radial expands upward+left
  const R = 82
  // Angles: spread from 180° (left) to -60° (upper-right), evenly spaced
  const startAngle = 180
  const endAngle = -60
  const count = THEMES.length
  const angles = THEMES.map((_, i) => {
    const t = i / (count - 1)
    return (startAngle + t * (endAngle - startAngle)) * (Math.PI / 180)
  })

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
      )}

      {/* Anchor point at bottom-right */}
      <div className="absolute bottom-6 right-5 md:bottom-8 md:right-8 z-40" style={{ width: 0, height: 0 }}>
        {/* Radial items */}
        {open && THEMES.map((theme, i) => {
          const x = Math.cos(angles[i]) * R
          const y = Math.sin(angles[i]) * R
          const delay = i * 30
          return (
            <div
              key={theme.id}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                transform: 'translate(-50%, -50%)',
                transition: `transform 280ms cubic-bezier(0.34,1.56,0.64,1) ${delay}ms, opacity 200ms ease ${delay}ms`,
                opacity: mounted ? 1 : 0,
                scale: mounted ? '1' : '0',
              }}
            >
              <button
                onClick={() => { onTheme(theme.bg, theme.sound); setOpen(false) }}
                className="flex flex-col items-center gap-1 group"
                title={theme.label}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-110"
                  style={{
                    background: theme.swatch,
                    border: '2px solid rgba(255,255,255,0.18)',
                    color: '#fff',
                  }}
                >
                  {theme.icon}
                </div>
                <span className="text-[10px] font-medium leading-none" style={{ fontFamily: 'Inter, sans-serif', color: c.text, textShadow: isLight ? 'none' : '0 1px 4px rgba(0,0,0,0.8)' }}>
                  {theme.label}
                </span>
              </button>
            </div>
          )
        })}

        {/* Center: Theme toggle / Customize */}
        <div style={{ position: 'absolute', left: 0, top: 0, transform: 'translate(-50%, -50%)' }}>
          {open ? (
            <button
              onClick={e => { e.stopPropagation(); onCustomize(); setOpen(false) }}
              className="flex flex-col items-center gap-1 group z-50 relative"
              title="Customize"
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-105"
                style={{ background: c.customizeBg, border: `1.5px solid ${c.customizeBorder}`, backdropFilter: 'blur(12px)', color: c.customizeText }}
              >
                <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.93 2.93l1.06 1.06M9.01 9.01l1.06 1.06M2.93 11.07l1.06-1.06M9.01 4.99l1.06-1.06" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="text-[10px] font-medium leading-none" style={{ fontFamily: 'Inter, sans-serif', color: c.text, textShadow: isLight ? 'none' : '0 1px 4px rgba(0,0,0,0.8)' }}>
                Custom
              </span>
            </button>
          ) : (
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ fontFamily: 'Inter, sans-serif', color: c.customizeText, background: c.customizeBg, border: `1px solid ${c.customizeBorder}`, backdropFilter: 'blur(8px)' }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.93 2.93l1.06 1.06M9.01 9.01l1.06 1.06M2.93 11.07l1.06-1.06M9.01 4.99l1.06-1.06" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              Theme
            </button>
          )}
        </div>
      </div>
    </>
  )
}

function LandingScreen({ onBegin, bg, onBgChange, isLight, soundId, onSoundChange, onHowItWorks }: { onBegin: (t: string) => void; bg: BgConfig; onBgChange: (b: BgConfig) => void; isLight: boolean; soundId: SoundId; onSoundChange: (s: SoundId) => void; onHowItWorks: () => void }) {
  const [input, setInput] = useState('')
  const [panelOpen, setPanelOpen] = useState(false)
  const [noteOpen, setNoteOpen] = useState(false)
  const c = tk(isLight)

  const submit = () => { const t = input.trim(); if (t) onBegin(t) }
  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') submit() }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden transition-all duration-500" style={bgStyle(bg)}>
      {bg.type === 'image' && <div className="absolute inset-0 pointer-events-none transition-all duration-300" style={{ background: c.imgOverlay }} />}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 45%, rgba(128,128,128,0.10) 0%, transparent 70%)' }} />

      <div className="relative z-10 flex flex-col items-center gap-8 md:gap-16 w-full px-5 md:px-8">
        <AnimatedHeadline isLight={isLight} />

        <p className="text-[16px] md:text-[18px] font-medium text-center max-w-sm md:max-w-xl transition-colors duration-300" style={{ fontFamily: 'Inter, sans-serif', color: c.textMuted }}>
          What negative thought feels true right now?
        </p>

        <div className="relative flex items-center gap-3 px-4 md:px-8 py-4 md:py-5 rounded-[20px] w-full max-w-[550px] transition-all duration-300"
          style={{ background: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(221,221,221,0.10)', border: `1.33px solid ${c.border}`, backdropFilter: 'blur(12px)' }}>
          <input
            className="flex-1 bg-transparent outline-none text-[14px] min-w-0 transition-colors duration-300"
            style={{ fontFamily: 'Inter, sans-serif', color: c.text }}
            placeholder="I keep thinking that..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            autoFocus
          />
          <button onClick={submit} className="flex-none w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ background: c.sendBg, border: `0.5px solid ${c.sendBorder}` }}>
            <SendIcon color={isLight ? '#444' : '#BBBBBB'} />
          </button>
        </div>
      </div>

      {/* Desktop privacy note — bottom center, very subtle */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-1.5 text-center pointer-events-none select-none" style={{ opacity: 0.42 }}>
        <p className="text-[11px] leading-relaxed max-w-md" style={{ fontFamily: 'Inter, sans-serif', color: c.text }}>
          <span className="font-medium">{PRIVACY_NOTE.title}.</span>{' '}{PRIVACY_NOTE.body}
        </p>
        <button
          className="text-[11px] underline underline-offset-2 pointer-events-auto transition-opacity hover:opacity-80"
          style={{ fontFamily: 'Inter, sans-serif', color: c.text }}
          onClick={() => {}}
        >
          {PRIVACY_NOTE.link}
        </button>
      </div>

      {/* Mobile privacy link — bottom left */}
      <button
        onClick={() => setNoteOpen(true)}
        className="absolute bottom-6 left-5 z-20 md:hidden text-[11px] transition-colors"
        style={{ fontFamily: 'Inter, sans-serif', color: c.textFaint, opacity: 0.6 }}
      >
        A note before you begin ↗
      </button>

      {/* Mobile bottom sheet */}
      {noteOpen && <PrivacyBottomSheet isLight={isLight} onClose={() => setNoteOpen(false)} />}

      <ThemeButton
        isLight={isLight}
        onTheme={(newBg, newSound) => { onBgChange(newBg); onSoundChange(newSound) }}
        onCustomize={() => setPanelOpen(true)}
      />

      {panelOpen && <CustomizePanel current={bg} onChange={onBgChange} onClose={() => setPanelOpen(false)} isLight={isLight} soundId={soundId} onSoundChange={onSoundChange} />}
    </div>
  )
}

// ─── Capture (summary) ────────────────────────────────────────────────────────

function CaptureScreen({ thought, emotion, bg, isLight, onContinue, onBack }: { thought: string; emotion: string; bg: BgConfig; isLight: boolean; onContinue: () => void; onBack: () => void }) {
  const c = tk(isLight)

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-auto py-24 px-5 md:px-8 transition-all duration-500" style={bgStyle(bg)}>
      {bg.type === 'image' && <div className="absolute inset-0 pointer-events-none" style={{ background: c.imgOverlay }} />}

      <div className="absolute top-6 left-5 md:top-8 md:left-8 flex items-baseline gap-1 relative z-10" style={{ fontFamily: 'Instrument Serif, serif' }}>
        <span className="text-[28px] md:text-[36px] transition-colors duration-300" style={{ color: c.text }}>03</span>
        <span className="text-[22px] md:text-[28px]" style={{ color: c.textFaint }}> / </span>
        <span className="text-[16px] md:text-[22px]" style={{ color: c.textFaint }}>04</span>
      </div>
      <div className="absolute top-6 right-5 md:top-8 md:right-8 z-10">
        <span className="text-xs md:text-sm transition-colors duration-300" style={{ fontFamily: 'Fragment Mono, monospace', color: c.textMuted }}>· EXAMINE</span>
      </div>

      <div className="relative z-10 w-full max-w-[900px] flex flex-col items-center gap-8 md:gap-10">
        <h1 className="text-[clamp(36px,5vw,60px)] text-center leading-tight transition-colors duration-300" style={{ fontFamily: 'Instrument Serif, serif', color: c.text }}>
          Still True?
        </h1>

        <div className="rounded-[24px] md:rounded-[30px] w-full px-5 md:px-8 py-8 md:py-10 flex flex-col gap-6 md:gap-8 transition-all duration-300"
          style={{ background: c.cardBg, backdropFilter: 'blur(20px)', boxShadow: isLight ? '0 4px 32px rgba(0,0,0,0.08)' : '0 4px 32px rgba(0,0,0,0.3)' }}>
          <div className="text-center">
            <p className="text-sm mb-2" style={{ fontFamily: 'Inter, sans-serif', color: c.cardMuted }}>I keep thinking that...</p>
            <p className="text-[clamp(18px,3vw,36px)] leading-tight" style={{ fontFamily: 'Instrument Serif, serif', color: c.cardText }}>"{thought}"</p>
          </div>

          <div style={{ borderTop: '1px solid #f0f0f0' }} />

          <div className="text-center">
            <p className="text-sm mb-3" style={{ fontFamily: 'Inter, sans-serif', color: c.cardMuted }}>What you discovered...</p>
            <p className="text-[clamp(15px,2vw,22px)] leading-snug" style={{ fontFamily: 'Instrument Serif, serif', color: c.cardText }}>{emotion || '—'}</p>
          </div>

          <p className="text-sm text-center" style={{ fontFamily: 'Inter, sans-serif', color: '#ccc' }}>
            Does this capture what you're experiencing? Edit anything that doesn't feel quite right.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button onClick={onBack} className="w-full sm:w-auto text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
              style={{ fontFamily: 'Inter, sans-serif', background: '#fff', color: '#111', border: '1px solid rgba(0,0,0,0.12)' }}>
              Edit
            </button>
            <button onClick={onContinue} className="w-full sm:w-auto text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
              style={{ fontFamily: 'Inter, sans-serif', background: '#111', color: '#fff' }}>
              Start Over →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Analyze (chat) ───────────────────────────────────────────────────────────

function AnalyzeScreen({ thought, bg, isLight, onSummary, onBack, onRestart }: { thought: string; bg: BgConfig; isLight: boolean; onSummary: (e: string) => void; onBack: () => void; onRestart: () => void }) {
  const [messages, setMessages] = useState<Message[]>(EXAMINE_PROMPTS)
  const [input, setInput] = useState('')
  const [step, setStep] = useState(2)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const c = tk(isLight)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sendMessage = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    setInput('')
    const nextStep = step + 1
    const responses: Record<number, string> = {
      3: "That's a meaningful observation. Let's look at the evidence for and against this thought. What facts do you know that support it?",
      4: "And now — what facts or experiences suggest this thought might not be entirely true, or tell a different story?",
      5: "Given everything you've examined, what's a more balanced way to describe the situation — one that holds both the difficult parts and the fuller picture?",
    }
    const assistantText = responses[nextStep] ?? "You've done real work here. Remember: a thought feeling true isn't the same as it being true. Is there anything else you'd like to explore?"
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: trimmed }, { id: Date.now() + 1, role: 'assistant', text: assistantText }])
    setStep(nextStep)
  }

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') sendMessage() }

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden transition-all duration-500" style={bgStyle(bg)}>
      {bg.type === 'image' && <div className="absolute inset-0 pointer-events-none" style={{ background: c.imgOverlay }} />}

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-5 md:px-8 pt-6 md:pt-8 pb-3 md:pb-4 flex-none gap-2">
        <div className="flex items-baseline gap-1 flex-none" style={{ fontFamily: 'Instrument Serif, serif' }}>
          <span className="text-[24px] md:text-[32px] transition-colors duration-300" style={{ color: c.text }}>02</span>
          <span className="text-[18px] md:text-[24px]" style={{ color: c.textFaint }}> / </span>
          <span className="text-[14px] md:text-[18px]" style={{ color: c.textFaint }}>04</span>
        </div>
        <span className="text-xs md:text-sm hidden sm:block transition-colors duration-300" style={{ fontFamily: 'Fragment Mono, monospace', color: c.textMuted }}>· EXAMINE</span>

        <button onClick={onRestart} className="hidden md:block text-sm transition-colors duration-300 hover:opacity-80" style={{ fontFamily: 'Fragment Mono, monospace', color: c.textMuted }}>
          ← START FROM BEGINNING
        </button>

        {/* Mobile kebab */}
        <div className="relative flex-none md:hidden" ref={menuRef}>
          <button onClick={() => setMenuOpen(o => !o)} className="w-8 h-8 flex flex-col items-center justify-center gap-[5px] rounded-full transition-colors" style={{ background: menuOpen ? c.inputBg : 'transparent' }}>
            {[0, 1, 2].map(i => <span key={i} className="block w-[3px] h-[3px] rounded-full" style={{ background: c.textMuted }} />)}
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-10 w-48 rounded-2xl overflow-hidden z-30 flex flex-col"
              style={{ background: isLight ? 'rgba(255,255,255,0.97)' : 'rgba(28,28,28,0.97)', border: `1px solid ${c.border}`, boxShadow: '0 8px 32px rgba(0,0,0,0.2)', backdropFilter: 'blur(12px)' }}>
              <button onClick={() => { setMenuOpen(false); onBack() }} className="text-left px-5 py-3.5 text-sm transition-colors hover:opacity-70" style={{ fontFamily: 'Fragment Mono, monospace', color: c.textMuted }}>← Back</button>
              <div style={{ margin: '0 16px', borderTop: `1px solid ${c.divider}` }} />
              <button onClick={() => { setMenuOpen(false); onRestart() }} className="text-left px-5 py-3.5 text-sm text-[#ff6b6b] transition-colors hover:opacity-70" style={{ fontFamily: 'Fragment Mono, monospace' }}>↺ Start Over</button>
            </div>
          )}
        </div>
      </div>

      {/* Glossy chat panel */}
      <div className="relative z-10 flex-1 flex flex-col mx-3 md:mx-6 mb-3 md:mb-5 rounded-[24px] overflow-hidden transition-all duration-300"
        style={{ background: c.panelBg, border: `1px solid ${c.border}`, backdropFilter: 'blur(28px) saturate(1.4)', WebkitBackdropFilter: 'blur(28px) saturate(1.4)', boxShadow: c.panelShadow }}>

        {/* Title */}
        <div className="px-5 md:px-8 pt-5 md:pt-6 pb-4 md:pb-5 flex-none" style={{ borderBottom: `1px solid ${c.divider}` }}>
          <h1 className="text-[clamp(20px,3.5vw,44px)] leading-tight text-center transition-colors duration-300" style={{ fontFamily: 'Instrument Serif, serif', color: c.textOnCard }}>
            Why Does This Thought <em style={{ fontStyle: 'italic' }}>Feel True</em>?
          </h1>
          <p className="text-xs md:text-sm text-center mt-2 max-w-lg mx-auto transition-colors duration-300" style={{ fontFamily: 'Inter, sans-serif', color: c.textMuted }}>
            Now let's look for facts, exceptions, and other explanations the first conclusion may have left out.
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 flex flex-col gap-3 md:gap-4">
          <div className="self-end max-w-[85%] md:max-w-[75%]">
            <div className="rounded-tl-[18px] rounded-tr-[18px] rounded-bl-[18px] px-4 py-3 text-sm" style={{ fontFamily: 'Inter, sans-serif', background: c.userBubbleBg, border: `1px solid ${c.userBubbleBorder}`, color: c.userBubbleText }}>
              <p className="font-medium">"{thought}"</p>
            </div>
          </div>

          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[85%] md:max-w-[75%] px-4 py-3 text-sm rounded-tl-[18px] rounded-tr-[18px]"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500,
                  ...(msg.role === 'assistant'
                    ? { background: c.asstBubbleBg, border: `1px solid ${c.asstBubbleBorder}`, color: c.asstBubbleText, borderBottomRightRadius: '18px' }
                    : { background: c.userBubbleBg, border: `1px solid ${c.userBubbleBorder}`, color: c.userBubbleText, borderBottomLeftRadius: '18px' })
                }}>
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 md:px-8 pt-3 pb-2 flex-none flex items-center gap-3" style={{ borderTop: `1px solid ${c.divider}` }}>
          <div className="flex items-center gap-3 rounded-2xl px-4 py-2.5 md:py-3 flex-1 transition-all duration-300"
            style={{ background: c.inputBg, border: `1px solid ${c.inputBorder}`, backdropFilter: 'blur(8px)' }}>
            <input
              className="flex-1 text-sm outline-none bg-transparent min-w-0 transition-colors duration-300"
              style={{ fontFamily: 'Inter, sans-serif', color: c.inputText }}
              placeholder="Type your response..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={step >= 6}
            />
            <button onClick={sendMessage} disabled={step >= 6}
              className="w-8 h-8 rounded-full flex items-center justify-center flex-none disabled:opacity-40 transition-all duration-300"
              style={{ background: c.sendBg, border: `1px solid ${c.sendBorder}` }}>
              <SendIcon color={isLight ? '#444' : '#BBBBBB'} />
            </button>
          </div>
        </div>

        {/* Bottom nav */}
        <div className="px-4 md:px-8 pt-2 pb-4 flex-none flex items-center justify-between" style={{ borderTop: `1px solid ${c.divider}` }}>
          <button onClick={onBack} className="hidden md:block text-sm transition-colors duration-300 hover:opacity-80" style={{ fontFamily: 'Fragment Mono, monospace', color: c.textMuted }}>← BACK</button>
          <div className="md:hidden" />
          <button onClick={() => { const u = messages.filter(m => m.role === 'user'); onSummary(u[u.length - 1]?.text ?? '') }}
            className="text-sm transition-colors duration-300 hover:opacity-80" style={{ fontFamily: 'Fragment Mono, monospace', color: c.textMuted }}>
            NEXT →
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── How It Works ─────────────────────────────────────────────────────────────

const HOW_STEPS = [
  {
    n: '01',
    title: 'Name the thought',
    sub: 'Write',
    body: "Type the negative thought that keeps surfacing — the one that feels undeniably real. No filtering, no polishing. The raw version is what matters.",
    detail: "The act of writing a thought down creates the first small distance between you and it.",
    tag: 'AWARENESS',
  },
  {
    n: '02',
    title: 'Examine the evidence',
    sub: 'Examine',
    body: "A guided conversation walks you through four CBT questions. Where did this thought come from? What facts support it? What facts contradict it? What's the fuller picture?",
    detail: "Cognitive distortions survive by staying unexamined. Questioning them — calmly, factually — is how they lose their grip.",
    tag: 'INQUIRY',
  },
  {
    n: '03',
    title: 'Capture the insight',
    sub: 'Capture',
    body: "The session closes with a summary of what you found: the original thought, the emotion behind it, and a more balanced perspective you built yourself.",
    detail: "You didn't receive an answer from outside. You arrived at one through your own reasoning — which is exactly why it sticks.",
    tag: 'CLARITY',
  },
]

function HowItWorksScreen({ onBack, onBegin, isLight, bg }: { onBack: () => void; onBegin: () => void; isLight: boolean; bg: BgConfig }) {
  const [activeStep, setActiveStep] = useState<number | null>(null)
  const c = tk(isLight)
  const textBase = isLight ? 'rgba(0,0,0,0.85)' : 'rgba(240,237,232,1)'
  const textMid  = isLight ? 'rgba(0,0,0,0.45)' : 'rgba(240,237,232,0.5)'
  const textFaint= isLight ? 'rgba(0,0,0,0.28)' : 'rgba(240,237,232,0.28)'
  const borderFaint = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'
  const tagBorder   = isLight ? 'rgba(0,0,0,0.14)' : 'rgba(255,255,255,0.12)'
  const tagColor    = isLight ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.35)'
  const ctaBg       = isLight ? 'rgba(0,0,0,0.88)' : 'rgba(240,237,232,0.95)'
  const ctaText     = isLight ? '#fff' : '#0a0a0a'

  return (
    <div className="w-full min-h-full relative" style={{ ...bgStyle(bg) }}>
      {bg.type === 'image' && <div className="absolute inset-0 pointer-events-none" style={{ background: c.imgOverlay }} />}

      {/* Scrollable content — padded top for the fixed NavBar */}
      <div className="relative z-10 px-6 md:px-12 pb-24 pt-20 md:pt-24">

        {/* Begin CTA top-right (mirrors bottom) — hidden on mobile */}
        <div className="hidden md:flex justify-end mb-0">
          <button
          onClick={onBegin}
          className="text-xs tracking-widest transition-opacity hover:opacity-70 px-4 py-2 rounded-full"
          style={{ fontFamily: 'Fragment Mono, monospace', color: '#0a0a0a', background: 'rgba(240,237,232,0.92)', letterSpacing: '0.06em' }}
        >
          BEGIN →
        </button>
        </div>

        {/* Hero */}
        <div className="pt-8 md:pt-12 pb-20 md:pb-28 max-w-3xl">
          <p className="text-xs tracking-widest mb-5" style={{ fontFamily: 'Fragment Mono, monospace', color: textFaint }}>HOW IT WORKS</p>
          <h1 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 'clamp(40px,7vw,88px)', lineHeight: 1.05, letterSpacing: '-0.02em', color: textBase }}>
            A thought that feels<br />true isn't always{' '}
            <em style={{ fontStyle: 'italic', color: textMid }}>true.</em>
          </h1>
          <p className="mt-8 text-base md:text-lg leading-relaxed max-w-xl" style={{ fontFamily: 'Inter, sans-serif', color: textMid, fontWeight: 400 }}>
            Still True? uses Cognitive Behavioral Therapy techniques to help you slow down, look at the evidence, and arrive at a clearer picture — without anyone telling you what to think.
          </p>
        </div>

        {/* Divider */}
        <div style={{ borderTop: `1px solid ${borderFaint}`, marginBottom: 0 }} />

        {/* Steps */}
        <div className="mt-0">
          {HOW_STEPS.map((step, i) => {
            const isActive = activeStep === i
            return (
              <div
                key={step.n}
                onClick={() => setActiveStep(isActive ? null : i)}
                className="group cursor-pointer"
                style={{ borderBottom: `1px solid ${borderFaint}` }}
              >
                <div className="py-8 md:py-10 grid grid-cols-[auto_1fr] md:grid-cols-[80px_1fr_1fr] gap-x-8 md:gap-x-12 gap-y-4 items-start">

                  {/* Step number */}
                  <div className="row-span-2 md:row-span-1 flex items-center">
                    <span style={{ fontFamily: 'Fragment Mono, monospace', fontSize: 'clamp(28px,4vw,48px)', color: isActive ? textBase : textFaint, transition: 'color 0.25s' }}>
                      {step.n}
                    </span>
                  </div>

                  {/* Title block */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] tracking-widest px-2 py-0.5 rounded" style={{ fontFamily: 'Fragment Mono, monospace', color: tagColor, border: `1px solid ${tagBorder}` }}>
                        {step.tag}
                      </span>
                    </div>
                    <h2 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 'clamp(22px,3vw,34px)', color: textBase, lineHeight: 1.15, letterSpacing: '-0.01em' }}>
                      {step.title}
                    </h2>
                    <p className="text-sm" style={{ fontFamily: 'Fragment Mono, monospace', color: textFaint }}>
                      STEP {step.sub.toUpperCase()}
                    </p>
                  </div>

                  {/* Body + expand */}
                  <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
                    <p className="text-sm md:text-base leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', color: textMid, fontWeight: 400 }}>
                      {step.body}
                    </p>
                    <div style={{ maxHeight: isActive ? 120 : 0, overflow: 'hidden', transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1)' }}>
                      <p className="text-sm leading-relaxed pt-1 pb-2" style={{ fontFamily: 'Inter, sans-serif', color: textFaint, borderLeft: `2px solid ${borderFaint}`, paddingLeft: 14 }}>
                        {step.detail}
                      </p>
                    </div>
                    <button
                      className="self-start text-xs tracking-wider transition-opacity hover:opacity-80"
                      style={{ fontFamily: 'Fragment Mono, monospace', color: isActive ? textMid : textFaint }}
                      onClick={e => { e.stopPropagation(); setActiveStep(isActive ? null : i) }}
                    >
                      {isActive ? '− LESS' : '+ MORE'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Philosophy block */}
        <div className="mt-20 md:mt-28 grid md:grid-cols-2 gap-12 md:gap-20 items-start">
          <div>
            <p className="text-xs tracking-widest mb-6" style={{ fontFamily: 'Fragment Mono, monospace', color: textFaint }}>THE APPROACH</p>
            <h2 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 'clamp(28px,4vw,48px)', color: textBase, lineHeight: 1.15, letterSpacing: '-0.015em' }}>
              Built on CBT,<br />not self-help.
            </h2>
          </div>
          <div className="flex flex-col gap-6">
            <p className="text-sm md:text-base leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', color: textMid, fontWeight: 400 }}>
              Cognitive Behavioral Therapy is one of the most studied psychological interventions in existence. Its core insight: emotions follow thoughts, and thoughts can be examined.
            </p>
            <p className="text-sm md:text-base leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', color: textMid, fontWeight: 400 }}>
              Still True? doesn't diagnose, treat, or replace professional support. It gives you a private space to apply a well-understood technique, without noise, judgment, or an account to create.
            </p>
            <div className="flex gap-6 pt-2">
              {['Private', 'Offline-first', 'No account'].map(label => (
                <div key={label} className="flex items-center gap-2">
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: textFaint, display: 'inline-block', flexShrink: 0 }} />
                  <span className="text-xs" style={{ fontFamily: 'Fragment Mono, monospace', color: textFaint }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-24 md:mt-32 flex flex-col items-center text-center gap-6 pb-4">
          <h2 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 'clamp(28px,5vw,60px)', color: textBase, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Ready to examine<br /><em style={{ fontStyle: 'italic', color: textMid }}>that thought?</em>
          </h2>
          <button
            onClick={onBegin}
            className="mt-2 px-8 py-4 rounded-full text-sm tracking-widest transition-all duration-200 hover:scale-105 active:scale-95"
            style={{ fontFamily: 'Fragment Mono, monospace', background: ctaBg, color: ctaText, letterSpacing: '0.07em' }}
          >
            BEGIN →
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing')
  const [thought, setThought] = useState('')
  const [emotion, setEmotion] = useState('')
  const [bg, setBg] = useState<BgConfig>({ type: 'color', value: '#0f0f0f' })
  const [isLight, setIsLight] = useState(false)
  const [soundId, setSoundId] = useState<SoundId>('none')

  useAmbientSound(soundId)

  // bg가 바뀔 때 밝기 자동 감지
  useEffect(() => {
    if (bg.type === 'color') {
      setIsLight(hexLuminance(bg.value) > 0.4)
    } else {
      measureImageBrightness(bg.url).then(l => setIsLight(l > 0.5))
    }
  }, [bg])

  const restart = () => { setThought(''); setEmotion(''); setScreen('landing') }

  return (
    <div className="w-full" style={{ minHeight: '100vh', height: screen === 'howItWorks' ? 'auto' : '100dvh', overflowY: screen === 'howItWorks' ? 'auto' : 'hidden' }}>
      {screen === 'landing' && (
        <>
          <NavBar onRestart={restart} isLight={isLight} onHowItWorks={() => setScreen('howItWorks')} />
          <LandingScreen bg={bg} onBgChange={setBg} isLight={isLight} soundId={soundId} onSoundChange={setSoundId} onBegin={t => { setThought(t); setScreen('analyze') }} onHowItWorks={() => setScreen('howItWorks')} />
        </>
      )}
      {screen === 'analyze' && (
        <AnalyzeScreen thought={thought} bg={bg} isLight={isLight}
          onSummary={e => { setEmotion(e); setScreen('capture') }}
          onBack={() => setScreen('landing')} onRestart={restart} />
      )}
      {screen === 'capture' && (
        <CaptureScreen thought={thought} emotion={emotion} bg={bg} isLight={isLight}
          onContinue={restart} onBack={() => setScreen('analyze')} />
      )}
      {screen === 'howItWorks' && (
        <>
          <NavBar onRestart={restart} isLight={isLight} onHowItWorks={() => setScreen('howItWorks')} />
          <HowItWorksScreen bg={bg} isLight={isLight} onBack={() => setScreen('landing')} onBegin={() => setScreen('landing')} />
        </>
      )}
    </div>
  )
}
