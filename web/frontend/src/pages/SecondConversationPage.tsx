import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { RotateCcw } from 'lucide-react'
import SendIcon from '@/components/common/SendIcon'
import { sendDATMessage, startDAT } from '@/services/conversationApi'
import { bgStyle } from '@/theme/background'
import { tk } from '@/theme/tokens'
import type { Message } from '@/types/chat'
import type { CTReviewData, DATStateData, FinalReflectionData } from '@/types/conversation'
import type { BgConfig } from '@/types/theme'

type Props = {
  conversationId: string
  reviewData: CTReviewData
  bg: BgConfig
  isLight: boolean
  onComplete: (result: FinalReflectionData) => void
  onBack: () => void
  onRestart: () => void
}

export default function SecondConversationPage({ conversationId, reviewData, bg, isLight, onComplete, onBack, onRestart }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [datState, setDatState] = useState<DATStateData | null>(null)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isComplete, setIsComplete] = useState(false)
  const [result, setResult] = useState<FinalReflectionData | null>(null)
  const [error, setError] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const startedRef = useRef(false)
  const c = tk(isLight)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    const begin = async () => {
      try {
        setIsLoading(true)
        setError('')
        const response = await startDAT(conversationId, reviewData)
        setDatState(response.data)
        setIsComplete(response.stage_complete)
        setResult(response.result ?? null)
        if (response.message) {
          setMessages([{ id: Date.now(), role: 'assistant', text: response.message }])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not start the second conversation.')
      } finally {
        setIsLoading(false)
      }
    }

    void begin()
  }, [conversationId, reviewData])

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const sendMessage = async () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading || isComplete) return

    setInput('')
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: trimmed }])

    try {
      setIsLoading(true)
      setError('')
      const response = await sendDATMessage(conversationId, trimmed)
      setDatState(response.data)
      setIsComplete(response.stage_complete)
      setResult(response.result ?? null)
      if (response.message) {
        setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', text: response.message }])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the message.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') void sendMessage()
  }

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden transition-all duration-500" style={bgStyle(bg)}>
      {bg.type === 'image' && <div className="absolute inset-0 pointer-events-none" style={{ background: c.imgOverlay }} />}

      <div className="relative z-10 flex items-center justify-between px-5 md:px-8 pt-6 md:pt-8 pb-3 md:pb-4 flex-none gap-2">
        <div className="flex items-baseline gap-1" style={{ fontFamily: 'Instrument Serif, serif' }}>
          <span className="text-[24px] md:text-[32px]" style={{ color: c.text }}>03</span>
          <span className="text-[18px] md:text-[24px]" style={{ color: c.textFaint }}> / </span>
          <span className="text-[14px] md:text-[18px]" style={{ color: c.textFaint }}>04</span>
        </div>

        <button onClick={onRestart} className="hidden md:flex gap-2 text-sm hover:opacity-80" style={{ fontFamily: 'Fragment Mono, monospace', color: c.textMuted }}>
          <RotateCcw size={18} /> RESET CONVERSATION
        </button>

        <div className="relative md:hidden" ref={menuRef}>
          <button onClick={() => setMenuOpen(o => !o)} className="w-8 h-8 flex flex-col items-center justify-center gap-[5px] rounded-full" style={{ background: menuOpen ? c.inputBg : 'transparent' }}>
            {[0, 1, 2].map(i => <span key={i} className="block w-[3px] h-[3px] rounded-full" style={{ background: c.textMuted }} />)}
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-10 w-48 rounded-2xl overflow-hidden z-30 flex flex-col" style={{ background: isLight ? 'rgba(255,255,255,0.97)' : 'rgba(28,28,28,0.97)', border: `1px solid ${c.border}` }}>
              <button onClick={() => { setMenuOpen(false); onBack() }} className="text-left px-5 py-3.5 text-sm" style={{ fontFamily: 'Fragment Mono, monospace', color: c.textMuted }}>← Back</button>
              <button onClick={() => { setMenuOpen(false); onRestart() }} className="text-left px-5 py-3.5 text-sm text-[#ff6b6b]" style={{ fontFamily: 'Fragment Mono, monospace' }}>↺ Start Over</button>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 md:px-8 pt-5 md:pt-6 pb-4 md:pb-5 flex-none">
        <h1 className="text-[clamp(20px,3.5vw,44px)] leading-tight text-center" style={{ fontFamily: 'Instrument Serif, serif', color: c.textOnCard }}>
          Examine the <em>Evidence</em>
        </h1>
        <p className="text-xs md:text-sm text-center mt-2 max-w-lg mx-auto" style={{ fontFamily: 'Inter, sans-serif', color: c.textMuted }}>
          Now let’s test the thought—not to prove it wrong, but to see whether it tells the whole story.
        </p>
      </div>

      <div className="relative z-10 flex-1 flex flex-col mx-3 md:mx-6 mb-3 md:mb-5 rounded-[24px] overflow-hidden" style={{ background: c.panelBg, border: `1px solid ${c.border}`, backdropFilter: 'blur(28px) saturate(1.4)', boxShadow: c.panelShadow }}>
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 flex flex-col gap-3 md:gap-4">
          <div className="self-end max-w-[85%] md:max-w-[75%]">
            <div className="rounded-tl-[18px] rounded-tr-[18px] rounded-bl-[18px] px-4 py-3 text-sm" style={{ fontFamily: 'Inter, sans-serif', background: c.userBubbleBg, border: `1px solid ${c.userBubbleBorder}`, color: c.userBubbleText }}>
              <p className="font-medium">"{reviewData.automatic_thought}"</p>
            </div>
          </div>

          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[85%] md:max-w-[75%] px-4 py-3 text-sm rounded-[18px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, ...(msg.role === 'assistant' ? { background: c.asstBubbleBg, border: `1px solid ${c.asstBubbleBorder}`, color: c.asstBubbleText } : { background: c.userBubbleBg, border: `1px solid ${c.userBubbleBorder}`, color: c.userBubbleText }) }}>
                {msg.text}
              </div>
            </div>
          ))}

          {isLoading && <div className="text-sm" style={{ color: c.textMuted }}>Thinking…</div>}
          {error && <div className="text-sm text-[#ff6b6b]">{error}</div>}
          <div ref={bottomRef} />
        </div>

        <div className="px-4 md:px-8 pt-3 pb-2 flex-none" style={{ borderTop: `1px solid ${c.divider}` }}>
          <div className="flex items-center gap-3 rounded-2xl px-4 py-2.5 md:py-3" style={{ background: c.inputBg, border: `1px solid ${c.inputBorder}` }}>
            <input className="flex-1 text-sm outline-none bg-transparent min-w-0" style={{ fontFamily: 'Inter, sans-serif', color: c.inputText }} placeholder={isComplete ? 'Ready for your reflection' : 'Type your response...'} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey} disabled={isLoading || isComplete} />
            <button onClick={() => void sendMessage()} disabled={isLoading || isComplete} className="w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-40" style={{ background: c.sendBg, border: `1px solid ${c.sendBorder}` }}>
              <SendIcon color={isLight ? '#444' : '#BBBBBB'} />
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 pt-2 pb-4 flex-none flex items-center justify-between">
        <button onClick={onBack} className="hidden md:block text-sm hover:opacity-80" style={{ fontFamily: 'Fragment Mono, monospace', color: c.textMuted }}>← BACK</button>
        <div className="md:hidden" />
        <button onClick={() => result && onComplete(result)} disabled={!isComplete || !result || !datState} className="text-sm disabled:opacity-30 hover:opacity-80" style={{ fontFamily: 'Fragment Mono, monospace', color: c.textMuted }}>
          RESULT →
        </button>
      </div>
    </div>
  )
}
