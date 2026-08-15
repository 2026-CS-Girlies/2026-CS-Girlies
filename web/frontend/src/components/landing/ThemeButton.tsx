import { useState } from 'react'
import { THEMES } from '../../theme/presets'
import { tk } from '../../theme/tokens'
import type { BgConfig, SoundId, ThemeId } from '../../types/theme'

interface ThemeButtonProps {
  isLight: boolean
  onTheme: (bg: BgConfig, sound: SoundId, id: ThemeId) => void
  onCustomize: () => void
  activeThemeId: ThemeId | null
}

export default function ThemeButton({
  isLight,
  onTheme,
  onCustomize,
  activeThemeId,
}: ThemeButtonProps) {
  const [open, setOpen] = useState(false)
  const c = tk(isLight)

  const activeTheme = THEMES.find(theme => theme.id === activeThemeId)
  const label = activeTheme ? activeTheme.label.toLowerCase() : null

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="absolute bottom-6 right-5 md:bottom-8 md:right-8 z-40 flex flex-col items-end gap-0">
        {/* Drop-up panel */}
        <div
          style={{
            maxHeight: open ? 420 : 0,
            overflow: 'hidden',
            transition: 'max-height 0.3s cubic-bezier(0.4,0,0.2,1)',
            marginBottom: open ? 8 : 0,
          }}
        >
          <div
            className="flex flex-col rounded-2xl overflow-hidden"
            style={{
              background: isLight ? 'rgba(255,255,255,0.92)' : 'rgba(22,22,22,0.92)',
              border: `1px solid ${c.customizeBorder}`,
              backdropFilter: 'blur(16px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
              minWidth: 160,
            }}
          >
            {THEMES.map((theme, index) => {
              const isActive = theme.id === activeThemeId

              return (
                <button
                  key={theme.id}
                  onClick={() => {
                    onTheme(theme.bg, theme.sound, theme.id)
                    setOpen(false)
                  }}
                  className="flex items-center gap-3 px-4 py-3 text-left transition-opacity hover:opacity-70 relative"
                  style={{
                    borderBottom:
                      index < THEMES.length - 1
                        ? `1px solid ${c.divider}`
                        : 'none',
                  }}
                >
                  <span
                    className="w-4 h-4 rounded-full flex-none"
                    style={{
                      background: theme.swatch,
                      border: '1.5px solid rgba(255,255,255,0.15)',
                    }}
                  />

                  <span
                    className="text-sm flex-1"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      color: isActive ? c.text : c.textMuted,
                      fontWeight: isActive ? 500 : 400,
                    }}
                  >
                    {theme.label}
                  </span>

                  {isActive && (
                    <span
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        background: c.text,
                        flexShrink: 0,
                      }}
                    />
                  )}
                </button>
              )
            })}

            {/* Divider + Customize */}
            <div style={{ borderTop: `1px solid ${c.divider}` }}>
              <button
                onClick={() => {
                  onCustomize()
                  setOpen(false)
                }}
                className="flex items-center gap-3 px-4 py-3 w-full text-left transition-opacity hover:opacity-70"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  style={{ flexShrink: 0 }}
                >
                  <circle
                    cx="7"
                    cy="7"
                    r="2"
                    stroke={c.textMuted}
                    strokeWidth="1.2"
                  />
                  <path
                    d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.93 2.93l1.06 1.06M9.01 9.01l1.06 1.06M2.93 11.07l1.06-1.06M9.01 4.99l1.06-1.06"
                    stroke={c.textMuted}
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
                <span
                  className="text-sm"
                  style={{ fontFamily: 'Inter, sans-serif', color: c.textMuted }}
                >
                  Customize
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Trigger button */}
        <button
          onClick={() => setOpen(value => !value)}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all duration-200 hover:opacity-80 active:scale-95"
          style={{
            fontFamily: 'Inter, sans-serif',
            color: c.customizeText,
            background: c.customizeBg,
            border: `1px solid ${c.customizeBorder}`,
            backdropFilter: 'blur(8px)',
          }}
        >
          {activeTheme && (
            <span
              className="w-2.5 h-2.5 rounded-full flex-none"
              style={{ background: activeTheme.swatch }}
            />
          )}
          <span>
            theme
            {label ? <span style={{ opacity: 0.5 }}>: {label}</span> : null}
          </span>
        </button>
      </div>
    </>
  )
}
