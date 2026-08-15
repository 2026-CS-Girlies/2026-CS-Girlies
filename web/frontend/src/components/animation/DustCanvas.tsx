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
    ctx.scale(pixelRatio, pixelRatio)

    const cx = W * 0.5
    const cy = H * 0.5
    const count = 900

    type Particle = {
      x: number
      y: number
      vx: number
      vy: number
      size: number
      alpha: number
      delay: number
      r: number
      g: number
      b: number
    }

    const particles: Particle[] = Array.from({ length: count }, () => {
      const rx = (Math.random() + Math.random() + Math.random() - 1.5) * (W * 0.38)
      const ry = (Math.random() + Math.random() + Math.random() - 1.5) * (H * 0.32)
      const angle = (-0.3 + Math.random() * 0.9) * Math.PI
      const speed = 0.4 + Math.random() * 1.2
      const r = isLight ? Math.floor(60 + Math.random() * 120) : Math.floor(160 + Math.random() * 95)
      const g = isLight ? Math.floor(60 + Math.random() * 100) : Math.floor(155 + Math.random() * 95)
      const b = isLight ? Math.floor(70 + Math.random() * 110) : Math.floor(150 + Math.random() * 100)

      return {
        x: cx + rx,
        y: cy + ry,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.3,
        size: Math.random() * 2 + 0.4,
        alpha: 0.8 + Math.random() * 0.5,
        delay: Math.random() * 320,
        r,
        g,
        b,
      }
    })

    const DURATION = 1600
    const start = performance.now()
    let raf = 0

    const tick = (now: number) => {
      const elapsed = now - start
      ctx.clearRect(0, 0, W, H)

      let alive = false

      for (const p of particles) {
        if (elapsed < p.delay) {
          alive = true
          continue
        }

        const t = Math.min((elapsed - p.delay) / (DURATION - p.delay), 1)
        if (t >= 1) continue
        alive = true

        const wind = t * t * 5.5
        p.x += p.vx + wind
        p.y += p.vy + t * 0.15
        p.vx *= 1.012
        p.vy *= 0.998

        const alpha = p.alpha * Math.pow(1 - t, 1.6)
        const visibleAlpha = Math.min(alpha * 1.5, 1)

        // ctx.fillStyle = `rgba(255,0,0,${alpha})`
        ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${visibleAlpha})`
        ctx.fillRect(p.x, p.y, p.size, p.size)
      }

      if (alive) {
        raf = requestAnimationFrame(tick)
      } else {
        onDone()
      }
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [isLight, onDone])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-50 pointer-events-none"
      style={{ width: '100%', height: '100%' }}
    />
  )
}
