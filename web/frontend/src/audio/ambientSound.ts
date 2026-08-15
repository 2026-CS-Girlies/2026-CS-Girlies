import type { SoundId } from '@/types/theme'

export type StopFn = () => void

export function buildRain(ctx: AudioContext): StopFn {
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

export function buildOcean(ctx: AudioContext): StopFn {
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

export function buildFire(ctx: AudioContext): StopFn {
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

export function buildWind(ctx: AudioContext): StopFn {
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

export function buildForest(ctx: AudioContext): StopFn {
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

export const BUILDERS: Record<Exclude<SoundId, 'none'>, (ctx: AudioContext) => StopFn> = {
  rain: buildRain, ocean: buildOcean, fire: buildFire, wind: buildWind, forest: buildForest,
}
