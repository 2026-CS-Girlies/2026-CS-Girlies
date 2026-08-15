import { useEffect, useState } from 'react'
import NavBar from './components/layout/NavBar'
import { useAmbientSound } from './hooks/useAmbientSound'
import AnalyzePage from './pages/AnalyzePage'
import CapturePage from './pages/CapturePage'
import HowItWorksPage from './pages/HowItWorksPage'
import LandingPage from './pages/LandingPage'
import { hexLuminance, measureImageBrightness } from './theme/background'
import type { Screen } from './types/navigation'
import type { BgConfig, SoundId, ThemeId } from './types/theme'

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing')
  const [thought, setThought] = useState('')
  const [emotion, setEmotion] = useState('')
  const [bg, setBg] = useState<BgConfig>({ type: 'color', value: '#0f0f0f' })
  const [isLight, setIsLight] = useState(false)
  const [soundId, setSoundId] = useState<SoundId>('none')
  const [activeThemeId, setActiveThemeId] = useState<ThemeId | null>('none')

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
          <LandingPage bg={bg} onBgChange={setBg} isLight={isLight} soundId={soundId} onSoundChange={setSoundId} onBegin={t => { setThought(t); setScreen('analyze') }} onHowItWorks={() => setScreen('howItWorks')} activeThemeId={activeThemeId} onThemeId={setActiveThemeId} />
        </>
      )}
      {screen === 'analyze' && (
        <AnalyzePage thought={thought} bg={bg} isLight={isLight}
          onSummary={e => { setEmotion(e); setScreen('capture') }}
          onBack={() => setScreen('landing')} onRestart={restart} />
      )}
      {screen === 'capture' && (
        <CapturePage thought={thought} emotion={emotion} bg={bg} isLight={isLight}
          onContinue={restart} onBack={() => setScreen('analyze')} />
      )}
      {screen === 'howItWorks' && (
        <>
          <NavBar onRestart={restart} isLight={isLight} onHowItWorks={() => setScreen('howItWorks')} />
          <HowItWorksPage bg={bg} isLight={isLight} onBack={() => setScreen('landing')} onBegin={() => setScreen('landing')} />
        </>
      )}
    </div>
  )
}
