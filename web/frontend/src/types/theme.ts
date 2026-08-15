import type { ReactNode } from 'react'

export type BgConfig =
  | { type: 'color'; value: string }
  | { type: 'image'; url: string }

export type SoundId = 'none' | 'rain' | 'ocean' | 'fire' | 'wind' | 'forest'
export type ThemeId = SoundId

export interface ThemePreset {
  id: ThemeId
  label: string
  icon: ReactNode
  bg: BgConfig
  sound: SoundId
  swatch: string
}