import { useEffect, useRef } from 'react'

type Props = {
  isLight: boolean
  onDone: () => void
}

export default function DustCanvas({ isLight, onDone }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = window.innerWidth
    const H = window.innerHeight
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)

    canvas.width = Math.round(W * pixelRatio)
    canvas.height = Math.round(H * pixelRatio)
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)

    const cx = W * 0.5
    const cy = H * 0.5
    const count = 1800

    type Particle = { x: number; y: number; vx: number; vy: number; size: number; alpha: number; delay: number; tone: number }

    const particles: Particle[] = Array.from({ length: count }, () => {
      const rx = (Math.random() + Math.random() + Math.random() - 1.5) * (W * 0.38)
      const ry = (Math.random() + Math.random() + Math.random() - 1.5) * (H * 0.32)
      const angle = (-0.3 + Math.random() * 0.9) * Math.PI
      const speed = 0.25 + Math.pow(Math.random(), 2) * 1.8
      const tone = isLight ? Math.floor(10 + Math.random() * 35) : Math.floor(220 + Math.random() * 35)
      const sizeRoll = Math.random()
      const size = sizeRoll > 0.96 ? 1.4 + Math.random() * 1.2 : 0.15 + Math.random() * 0.9

      return { x: cx + rx, y: cy + ry, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 0.25, size, alpha: 0.45 + Math.random() * 0.5, delay: Math.random() * 420, tone }
    })

    const DURATION = 1900
    const start = performance.now()
    let raf = 0

    const tick = (now: number) => {
      const elapsed = now - start
      ctx.clearRect(0, 0, W, H)
      let alive = false

      for (const p of particles) {
        if (elapsed < p.delay) { alive = true; continue }

        const t = Math.min((elapsed - p.delay) / (DURATION - p.delay), 1)
        if (t >= 1) continue
        alive = true

        const wind = t * t * 5.5
        p.x += p.vx + wind
        p.y += p.vy + t * 0.15
        p.vx *= 1.012
        p.vy *= 0.998

        const alpha = p.alpha * Math.pow(1 - t, 1.5)
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${p.tone},${p.tone},${p.tone},${alpha})`
        ctx.fill()
      }

      if (alive) raf = requestAnimationFrame(tick)
      else onDone()
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [isLight, onDone])

  return <canvas ref={canvasRef} className="fixed inset-0 z-50 pointer-events-none" style={{ width: '100%', height: '100%' }} />
}
