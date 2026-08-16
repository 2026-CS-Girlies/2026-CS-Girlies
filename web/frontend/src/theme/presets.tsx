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



export const SOUNDS: { id: SoundId; label: string; icon: ReactNode, src?: string }[] = [
  { id: 'none', label: 'Mute', icon: <SoundOffIcon /> },
  { id: 'rain', label: 'Rain', icon: <SoundRainIcon />, src: '/sounds/rain.wav' },
  { id: 'ocean', label: 'Ocean', icon: <SoundOceanIcon />, src: '/sounds/ocean.wav' },
  { id: 'forest', label: 'Forest', icon: <SoundForestIcon />, src: '/sounds/forest.wav' },
  { id: 'fire', label: 'Fire', icon: <SoundFireIcon />, src: '/sounds/fire.wav' },
  { id: 'wind', label: 'Wind', icon: <SoundWindIcon />, src: '/sounds/wind.wav' },
]

export const THEMES: ThemePreset[] = [
  { id: 'rain',   label: 'Rain',   icon: <SoundRainIcon />,   sound: 'rain',   swatch: '#1a2535', bg: { type: 'image', url: '/images/rain.png' } },
  { id: 'ocean',  label: 'Ocean',  icon: <SoundOceanIcon />,  sound: 'ocean',  swatch: '#0d2137', bg: { type: 'image', url: '/images/ocean.png' } },
  { id: 'forest', label: 'Forest', icon: <SoundForestIcon />, sound: 'forest', swatch: '#111e14', bg: { type: 'image', url: '/images/forest.png' } },
  { id: 'fire',   label: 'Fire',   icon: <SoundFireIcon />,   sound: 'fire',   swatch: '#1e1008', bg: { type: 'image', url: '/images/fire.png' } },
  { id: 'wind',   label: 'Wind',   icon: <SoundWindIcon />,   sound: 'wind',   swatch: '#161620', bg: { type: 'image', url: '/images/wind.png' } },
  { id: 'none',   label: 'Simple', icon: <SoundOffIcon />,    sound: 'none',   swatch: '#0f0f0f', bg: { type: 'color', value:'#0f0f0f' } },
]

export const PRESET_COLORS = [
  '#0f0f0f', '#1a1a2e', '#0d1b2a', '#2d1b33',
  '#f5f0e8', '#e8f0f5', '#f0f5e8', '#f5e8e8',
]
