import { useEffect, useRef } from 'react'
import type { SoundId } from '@/types/theme'

const SOUND_FILES: Record<Exclude<SoundId, 'none'>, string> = {
  rain: '/sounds/rain.wav',
  ocean: '/sounds/ocean.wav',
  forest: '/sounds/forest.mp3',
  fire: '/sounds/fire.mp3',
  wind: '/sounds/wind.wav',
}

export function useAmbientSound(soundId: SoundId) {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }

    if (soundId === 'none') return

    const audio = new Audio(SOUND_FILES[soundId])

    audio.loop = true
    audio.volume = 0.35
    audio.preload = 'auto'

    audioRef.current = audio

    audio.play().catch(error => {
      console.warn('[AMBIENT SOUND] Could not autoplay:', error)
    })

    return () => {
      audio.pause()
      audio.currentTime = 0
    }
  }, [soundId])

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])
}