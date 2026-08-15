import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import SendIcon from '@/components/common/SendIcon'
import { EXAMINE_PROMPTS } from '@/data/examinePrompts'
import { bgStyle } from '@/theme/background'
import { tk } from '@/theme/tokens'
import type { Message } from '@/types/chat'
import type { BgConfig } from '@/types/theme'

export default function AnalyzePage({ thought, bg, isLight, onSummary, onBack, onRestart }: { thought: string; bg: BgConfig; isLight: boolean; onSummary: (e: string) => void; onBack: () => void; onRestart: () => void }) {
  const [messages, setMessages] = useState<Message[]>(EXAMINE_PROMPTS)
  const [input, setInput] = useState('')
  const [step, setStep] = useState(2)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const c = tk(isLight)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sendMessage = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    setInput('')
    const nextStep = step + 1
    const responses: Record<number, string> = {
      3: "That's a meaningful observation. Let's look at the evidence for and against this thought. What facts do you know that support it?",
      4: "And now — what facts or experiences suggest this thought might not be entirely true, or tell a different story?",
      5: "Given everything you've examined, what's a more balanced way to describe the situation — one that holds both the difficult parts and the fuller picture?",
    }
    const assistantText = responses[nextStep] ?? "You've done real work here. Remember: a thought feeling true isn't the same as it being true. Is there anything else you'd like to explore?"
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: trimmed }, { id: Date.now() + 1, role: 'assistant', text: assistantText }])
    setStep(nextStep)
  }

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') sendMessage() }

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden transition-all duration-500" style={bgStyle(bg)}>
      {bg.type === 'image' && <div className="absolute inset-0 pointer-events-none" style={{ background: c.imgOverlay }} />}

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-5 md:px-8 pt-6 md:pt-8 pb-3 md:pb-4 flex-none gap-2">
        <div className="flex items-baseline gap-1 flex-none" style={{ fontFamily: 'Instrument Serif, serif' }}>
          <span className="text-[24px] md:text-[32px] transition-colors duration-300" style={{ color: c.text }}>02</span>
          <span className="text-[18px] md:text-[24px]" style={{ color: c.textFaint }}> / </span>
          <span className="text-[14px] md:text-[18px]" style={{ color: c.textFaint }}>04</span>
        </div>
        <span className="text-xs md:text-sm hidden sm:block transition-colors duration-300" style={{ fontFamily: 'Fragment Mono, monospace', color: c.textMuted }}>· EXAMINE</span>

        <button onClick={onRestart} className="hidden md:block text-sm transition-colors duration-300 hover:opacity-80" style={{ fontFamily: 'Fragment Mono, monospace', color: c.textMuted }}>
          ← START FROM BEGINNING
        </button>

        {/* Mobile kebab */}
        <div className="relative flex-none md:hidden" ref={menuRef}>
          <button onClick={() => setMenuOpen(o => !o)} className="w-8 h-8 flex flex-col items-center justify-center gap-[5px] rounded-full transition-colors" style={{ background: menuOpen ? c.inputBg : 'transparent' }}>
            {[0, 1, 2].map(i => <span key={i} className="block w-[3px] h-[3px] rounded-full" style={{ background: c.textMuted }} />)}
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-10 w-48 rounded-2xl overflow-hidden z-30 flex flex-col"
              style={{ background: isLight ? 'rgba(255,255,255,0.97)' : 'rgba(28,28,28,0.97)', border: `1px solid ${c.border}`, boxShadow: '0 8px 32px rgba(0,0,0,0.2)', backdropFilter: 'blur(12px)' }}>
              <button onClick={() => { setMenuOpen(false); onBack() }} className="text-left px-5 py-3.5 text-sm transition-colors hover:opacity-70" style={{ fontFamily: 'Fragment Mono, monospace', color: c.textMuted }}>← Back</button>
              <div style={{ margin: '0 16px', borderTop: `1px solid ${c.divider}` }} />
              <button onClick={() => { setMenuOpen(false); onRestart() }} className="text-left px-5 py-3.5 text-sm text-[#ff6b6b] transition-colors hover:opacity-70" style={{ fontFamily: 'Fragment Mono, monospace' }}>↺ Start Over</button>
            </div>
          )}
        </div>
      </div>

      {/* Glossy chat panel */}
      <div className="relative z-10 flex-1 flex flex-col mx-3 md:mx-6 mb-3 md:mb-5 rounded-[24px] overflow-hidden transition-all duration-300"
        style={{ background: c.panelBg, border: `1px solid ${c.border}`, backdropFilter: 'blur(28px) saturate(1.4)', WebkitBackdropFilter: 'blur(28px) saturate(1.4)', boxShadow: c.panelShadow }}>

        {/* Title */}
        <div className="px-5 md:px-8 pt-5 md:pt-6 pb-4 md:pb-5 flex-none" style={{ borderBottom: `1px solid ${c.divider}` }}>
          <h1 className="text-[clamp(20px,3.5vw,44px)] leading-tight text-center transition-colors duration-300" style={{ fontFamily: 'Instrument Serif, serif', color: c.textOnCard }}>
            Why Does This Thought <em style={{ fontStyle: 'italic' }}>Feel True</em>?
          </h1>
          <p className="text-xs md:text-sm text-center mt-2 max-w-lg mx-auto transition-colors duration-300" style={{ fontFamily: 'Inter, sans-serif', color: c.textMuted }}>
            Now let's look for facts, exceptions, and other explanations the first conclusion may have left out.
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 flex flex-col gap-3 md:gap-4">
          <div className="self-end max-w-[85%] md:max-w-[75%]">
            <div className="rounded-tl-[18px] rounded-tr-[18px] rounded-bl-[18px] px-4 py-3 text-sm" style={{ fontFamily: 'Inter, sans-serif', background: c.userBubbleBg, border: `1px solid ${c.userBubbleBorder}`, color: c.userBubbleText }}>
              <p className="font-medium">"{thought}"</p>
            </div>
          </div>

          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[85%] md:max-w-[75%] px-4 py-3 text-sm rounded-tl-[18px] rounded-tr-[18px]"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500,
                  ...(msg.role === 'assistant'
                    ? { background: c.asstBubbleBg, border: `1px solid ${c.asstBubbleBorder}`, color: c.asstBubbleText, borderBottomRightRadius: '18px' }
                    : { background: c.userBubbleBg, border: `1px solid ${c.userBubbleBorder}`, color: c.userBubbleText, borderBottomLeftRadius: '18px' })
                }}>
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 md:px-8 pt-3 pb-2 flex-none flex items-center gap-3" style={{ borderTop: `1px solid ${c.divider}` }}>
          <div className="flex items-center gap-3 rounded-2xl px-4 py-2.5 md:py-3 flex-1 transition-all duration-300"
            style={{ background: c.inputBg, border: `1px solid ${c.inputBorder}`, backdropFilter: 'blur(8px)' }}>
            <input
              className="flex-1 text-sm outline-none bg-transparent min-w-0 transition-colors duration-300"
              style={{ fontFamily: 'Inter, sans-serif', color: c.inputText }}
              placeholder="Type your response..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={step >= 6}
            />
            <button onClick={sendMessage} disabled={step >= 6}
              className="w-8 h-8 rounded-full flex items-center justify-center flex-none disabled:opacity-40 transition-all duration-300"
              style={{ background: c.sendBg, border: `1px solid ${c.sendBorder}` }}>
              <SendIcon color={isLight ? '#444' : '#BBBBBB'} />
            </button>
          </div>
        </div>

        {/* Bottom nav */}
        <div className="px-4 md:px-8 pt-2 pb-4 flex-none flex items-center justify-between" style={{ borderTop: `1px solid ${c.divider}` }}>
          <button onClick={onBack} className="hidden md:block text-sm transition-colors duration-300 hover:opacity-80" style={{ fontFamily: 'Fragment Mono, monospace', color: c.textMuted }}>← BACK</button>
          <div className="md:hidden" />
          <button onClick={() => { const u = messages.filter(m => m.role === 'user'); onSummary(u[u.length - 1]?.text ?? '') }}
            className="text-sm transition-colors duration-300 hover:opacity-80" style={{ fontFamily: 'Fragment Mono, monospace', color: c.textMuted }}>
            NEXT →
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── How It Works ─────────────────────────────────────────────────────────────
