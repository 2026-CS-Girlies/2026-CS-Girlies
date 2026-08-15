import { useEffect, useState } from 'react'
import NavBar from './components/layout/NavBar'
import { useAmbientSound } from './hooks/useAmbientSound'

import LandingPage from './pages/LandingPage'
import FirstConversationPage from './pages/FirstConversationPage'
import ReviewPage from './pages/ReviewPage'
import SecondConversationPage from './pages/SecondConversationPage'
import FinalReflectionPage from './pages/FinalReflectionPage'
import HowItWorksPage from './pages/HowItWorksPage'
import ConversationPage from './pages/ConversationPage'


import { hexLuminance, measureImageBrightness } from './theme/background'
import type { CTReviewData, FinalReflectionData } from './types/conversation'
import type { Screen } from './types/navigation'
import type { BgConfig, SoundId, ThemeId } from './types/theme'

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing')

  // Reflection state shared across pages
  const [thought, setThought] = useState('')
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [ctReview, setCtReview] = useState<CTReviewData | null>(null)
  const [finalReflection, setFinalReflection] = useState<FinalReflectionData | null>(null)

  // Theme
  const [bg, setBg] = useState<BgConfig>({ type: 'color', value: '#0f0f0f' })
  const [isLight, setIsLight] = useState(false)
  const [soundId, setSoundId] = useState<SoundId>('none')
  const [activeThemeId, setActiveThemeId] = useState<ThemeId | null>('none')

  // Flow
  const [reflectionFlow, setReflectionFlow] = useState<'two-step' | 'one-step'>('one-step')

  // theme and sound effects
  useAmbientSound(soundId)

  useEffect(() => {
    if (bg.type === 'color') {
      setIsLight(hexLuminance(bg.value) > 0.4)
    } else {
      measureImageBrightness(bg.url).then(l => setIsLight(l > 0.5))
    }
  }, [bg])

  const restart = () => {
    setThought('')
    setConversationId(null)
    setCtReview(null)
    setFinalReflection(null)
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
            onHowItWorks={() => setScreen('howItWorks')}
          />
          <LandingPage
            bg={bg}
            onBgChange={setBg}
            isLight={isLight}
            soundId={soundId}
            onSoundChange={setSoundId}
            onBegin={value => {
              setThought(value)
              // setScreen('firstConversation')
              setScreen('conversation')
            }}
            onHowItWorks={() => setScreen('howItWorks')}
            activeThemeId={activeThemeId}
            onThemeId={setActiveThemeId}
          />
        </>
      )}

      {/* One Conversation Page */}
      {screen === 'conversation' && (
        <ConversationPage
          thought={thought}
          bg={bg}
          isLight={isLight}
          onComplete={(id, ctData, result) => {
            setConversationId(id)
            setCtReview(ctData)
            setFinalReflection(result)
            setReflectionFlow('one-step')
            setScreen('finalReflection')
          }}
          onBack={() => setScreen('landing')}
          onRestart={restart}
        />
      )}

      {/* 01 / 04 — CT guided identification */}
      {screen === 'firstConversation' && (
        <FirstConversationPage
          thought={thought}
          bg={bg}
          isLight={isLight}
          onComplete={(id, data) => {
            setConversationId(id)
            setCtReview(data)
            setScreen('review')
          }}
          onBack={() => setScreen('landing')}
          onRestart={restart}
        />
      )}

      {/* 02 / 04 — Review & Edit */}
      {screen === 'review' && conversationId && ctReview && (
        <ReviewPage
          conversationId={conversationId}
          data={ctReview}
          bg={bg}
          isLight={isLight}
          onChange={setCtReview}
          onContinue={updatedData => {
            setCtReview(updatedData)
            setScreen('secondConversation')
          }}
          onBack={() => setScreen('firstConversation')}
        />
      )}

      {/* 03 / 04 — DAT driven restructuring */}
      {screen === 'secondConversation' && conversationId && ctReview && (
        <SecondConversationPage
          conversationId={conversationId}
          reviewData={ctReview}
          bg={bg}
          isLight={isLight}
          onComplete={result => {
            setFinalReflection(result)
            setScreen('finalReflection')
            setReflectionFlow('two-step')
          }}
          onBack={() => setScreen('review')}
          onRestart={restart}
        />
      )}

      {/* 04 / 04 — Final reflection */}
      {screen === 'finalReflection' && ctReview && finalReflection && (
        <FinalReflectionPage
          ctReview={ctReview}
          result={finalReflection}
          bg={bg}
          isLight={isLight}
          flow={reflectionFlow}
          onBack={() => {
            if (reflectionFlow === 'one-step') {
              setScreen('conversation')
            } else {
              setScreen('secondConversation')
            }
          }}
          onRestart={restart}
        />
      )}

      {screen === 'howItWorks' && (
        <>
          <NavBar
            onRestart={restart}
            isLight={isLight}
            onHowItWorks={() => setScreen('howItWorks')}
          />
          <HowItWorksPage
            bg={bg}
            isLight={isLight}
            onBack={() => setScreen('landing')}
            onBegin={() => setScreen('landing')}
          />
        </>
      )}
    </div>
  )
}
