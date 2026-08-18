import { useEffect, useState } from 'react'

export default function MobileWarning() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setShow(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-5 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-[24px] border border-white/10 bg-black/80 p-6 text-white shadow-2xl">
        <p
          className="mb-2 text-xs uppercase tracking-[0.14em] opacity-50"
          style={{ fontFamily: 'Fragment Mono, monospace' }}
        >
          Desktop recommended
        </p>

        <h2
          className="mb-3 text-lg font-medium"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Still True is currently optimized for desktop.
        </h2>

        <p
          className="text-sm leading-relaxed opacity-65"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Some features may not display correctly on smaller screens.
          Sorry for the inconvenience.
        </p>

        <button
          type="button"
          onClick={() => setShow(false)}
          className="mt-5 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm transition-opacity hover:opacity-80"
        >
          Continue anyway
        </button>
      </div>
    </div>
  )
}