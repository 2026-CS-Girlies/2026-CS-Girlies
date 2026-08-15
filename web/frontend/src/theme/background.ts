import type { CSSProperties } from 'react'
import type { BgConfig } from '@/types/theme'

export function hexLuminance(hex: string): number {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16) / 255
  const g = parseInt(clean.slice(2, 4), 16) / 255
  const b = parseInt(clean.slice(4, 6), 16) / 255
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function measureImageBrightness(url: string): Promise<number> {
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

export function bgStyle(bg: BgConfig): CSSProperties {
  return bg.type === 'image'
    ? { backgroundImage: `url(${bg.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { backgroundColor: bg.value }
}
