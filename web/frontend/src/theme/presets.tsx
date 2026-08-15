import type { ReactNode } from 'react'
import {
  SoundFireIcon,
  SoundForestIcon,
  SoundOffIcon,
  SoundOceanIcon,
  SoundRainIcon,
  SoundWindIcon,
} from '@/components/theme/SoundIcons'
import type { SoundId, ThemePreset } from '@/types/theme'



export const SOUNDS: { id: SoundId; label: string; icon: ReactNode }[] = [
  { id: 'none',   label: 'Mute',   icon: <SoundOffIcon /> },
  { id: 'rain',   label: 'Rain',   icon: <SoundRainIcon /> },
  { id: 'ocean',  label: 'Ocean',  icon: <SoundOceanIcon /> },
  { id: 'forest', label: 'Forest', icon: <SoundForestIcon /> },
  { id: 'fire',   label: 'Fire',   icon: <SoundFireIcon /> },
  { id: 'wind',   label: 'Wind',   icon: <SoundWindIcon /> },
]

export const THEMES: ThemePreset[] = [
  { id: 'rain',   label: 'Rain',   icon: <SoundRainIcon />,   sound: 'rain',   swatch: '#1a2535', bg: { type: 'color', value: '#1a2535' } },
  { id: 'ocean',  label: 'Ocean',  icon: <SoundOceanIcon />,  sound: 'ocean',  swatch: '#0d2137', bg: { type: 'color', value: '#0d2137' } },
  { id: 'forest', label: 'Forest', icon: <SoundForestIcon />, sound: 'forest', swatch: '#111e14', bg: { type: 'color', value: '#111e14' } },
  { id: 'fire',   label: 'Fire',   icon: <SoundFireIcon />,   sound: 'fire',   swatch: '#1e1008', bg: { type: 'color', value: '#1e1008' } },
  { id: 'wind',   label: 'Wind',   icon: <SoundWindIcon />,   sound: 'wind',   swatch: '#161620', bg: { type: 'color', value: '#161620' } },
  { id: 'none',   label: 'Simple', icon: <SoundOffIcon />,    sound: 'none',   swatch: '#0f0f0f', bg: { type: 'color', value: '#0f0f0f' } },
]

export const PRESET_COLORS = [
  '#0f0f0f', '#1a1a2e', '#0d1b2a', '#2d1b33',
  '#f5f0e8', '#e8f0f5', '#f0f5e8', '#f5e8e8',
]
