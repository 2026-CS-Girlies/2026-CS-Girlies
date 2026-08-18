import { useEffect, useState } from 'react'
import NavBar from './components/layout/NavBar'
import { useAmbientSound } from './hooks/useAmbientSound'
import ConversationPage from './pages/ConversationPage'
import FinalReflectionPage from './pages/FinalReflectionPage'
import HowItWorksPage from './pages/HowItWorksPage'
import LandingPage from './pages/LandingPage'
import ReceivingScreen from './pages/ReceivingPage'
import PrivacyPage from './pages/PrivacyPage'
import HackathonFooter from './components/layout/HackathonFooter'

import { startConversation } from './services/conversationApi'
import { DEMO_START_RESPONSE, DEMO_SUMMARY } from './data/demoConversation'
import { hexLuminance, measureImageBrightness } from './theme/background'
import type { ConversationResponse } from './types/conversation'
import type { Screen } from './types/navigation'
import type { BgConfig, SoundId, ThemeId } from './types/theme'

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing')
  const [conversationStart, setConversationStart] = useState<ConversationResponse | null>(null)
  const [receivingFinished, setReceivingFinished] = useState(false)
  const [thought, setThought] = useState('')
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [bg, setBg] = useState<BgConfig>({ type: 'color', value: '#0f0f0f' })
  const [isLight, setIsLight] = useState(false)
  const [soundId, setSoundId] = useState<SoundId>('none')
  const [activeThemeId, setActiveThemeId] = useState<ThemeId | null>('none')
  const [demoMode, setDemoMode] = useState(false)

  const navigate = (nextScreen: Screen) => {
    setScreen(nextScreen)
  }

  const isModelReady = Boolean(conversationStart?.message?.trim())

  useAmbientSound(soundId)

  useEffect(() => {
    if (bg.type === 'color') {
      setIsLight(hexLuminance(bg.value) > 0.4)
    } else {
      measureImageBrightness(bg.url).then(l => setIsLight(l > 0.5))
    }
  }, [bg])

  useEffect(() => {
    if (screen === 'receiving' && isModelReady && (!demoMode || receivingFinished)) {
      setScreen('conversation')
    }
  }, [screen, isModelReady, demoMode, receivingFinished])

  const beginReflection = async (newThought: string, useDemo = false) => {
    setThought(newThought)
    setDemoMode(useDemo)
    setConversationId(null)
    setConversationStart(null)
    setReceivingFinished(false)
    setScreen('receiving')

    try {
      const response = useDemo ? DEMO_START_RESPONSE : await startConversation(newThought)

      console.log('[START RESPONSE]', response)
      console.log('[START MESSAGE]', response.message)
      console.log('[MODEL READY]', Boolean(response.message?.trim()))

      setConversationStart(response)
    } catch (err) {
      console.error('[START CONVERSATION ERROR]', err)
      setScreen('landing')
    }
  }

  const restart = () => {
    setThought('')
    setConversationId(null)
    setConversationStart(null)
    setReceivingFinished(false)
    setDemoMode(false)
    setScreen('landing')
  }

  const isInfoPage = screen === 'howItWorks'

  return (
    <div
      className="w-full"
      style={{
        minHeight: '100vh',
        height: isInfoPage ? 'auto' : '100dvh',
        overflowY: isInfoPage ? 'auto' : 'hidden',
      }}
    >
      {screen === 'landing' && (
        <>
          <NavBar
            onRestart={restart}
            isLight={isLight}
            currentScreen={screen}
            onNavigate={navigate}
          />
          <LandingPage
            bg={bg}
            onBgChange={setBg}
            isLight={isLight}
            soundId={soundId}
            onSoundChange={setSoundId}
            onBegin={beginReflection}
            onHowItWorks={() => setScreen('howItWorks')}
            activeThemeId={activeThemeId}
            onThemeId={setActiveThemeId}
          />
          <HackathonFooter isLight={isLight} />
        </>
      )}

      {screen === 'receiving' && (
        <>
          <NavBar
            onRestart={restart}
            isLight={isLight}
            currentScreen={screen}
            onNavigate={navigate}
          />
          <ReceivingScreen
            thought={thought}
            bg={bg}
            isLight={isLight}
            modelReady={isModelReady}
            onComplete={() => setReceivingFinished(true)}
            onSkip={() => {
              if (isModelReady) setScreen('conversation')
            }}
          />
        </>
      )}

      {screen === 'conversation' && conversationStart && (
        <ConversationPage
          thought={thought}
          initialConversation={conversationStart}
          bg={bg}
          isLight={isLight}
          demoMode={demoMode}
          onComplete={id => {
            setConversationId(id)
            setScreen('finalReflection')
          }}
          onBack={() => setScreen('landing')}
          onRestart={restart}
        />
      )}

      {screen === 'finalReflection' && conversationId && (
        <FinalReflectionPage
          conversationId={conversationId}
          bg={bg}
          isLight={isLight}
          onBack={() => setScreen('conversation')}
          onRestart={restart}
          demoSummary={demoMode ? DEMO_SUMMARY : undefined}
        />
      )}

      {screen === 'howItWorks' && (
        <>
          <NavBar
            isLight={isLight}
            currentScreen={screen}
            onNavigate={navigate}
            onRestart={restart}
          />
          <HowItWorksPage
            bg={bg}
            isLight={isLight}
            onBack={() => setScreen('landing')}
            onBegin={() => setScreen('landing')}
          />
        </>
      )}

      {screen === 'privacy' && (
        <>
          <NavBar
            isLight={isLight}
            currentScreen={screen}
            onNavigate={navigate}
            onRestart={restart}
          />
          <PrivacyPage
            bg={bg}
            isLight={isLight}
            onBack={() => setScreen('landing')}
          />
        </>
      )}
    </div>
  )
}