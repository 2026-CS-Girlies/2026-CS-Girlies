import { useEffect, useRef } from 'react'
import { BUILDERS } from '@/audio/ambientSound'
import type { StopFn } from '@/audio/ambientSound'
import type { SoundId } from '@/types/theme'

export function useAmbientSound(soundId: SoundId) {
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
