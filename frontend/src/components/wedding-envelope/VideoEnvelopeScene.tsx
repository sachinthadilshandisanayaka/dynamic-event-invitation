import { useRef, useEffect, useCallback } from 'react'
import { gsap } from '../../lib/gsap-init'

type State = 'idle' | 'hinted' | 'opening' | 'revealing' | 'revealed'

interface Props {
  state:           State
  onEnvelopeClick: () => void
  onOpenComplete:  () => void
  accentColor?:    string
}

export function VideoEnvelopeScene({
  state,
  onEnvelopeClick,
  onOpenComplete,
  accentColor = '#C8A96E',
}: Props) {
  const sceneRef      = useRef<HTMLDivElement>(null)
  const videoRef      = useRef<HTMLVideoElement>(null)
  const hintRef       = useRef<HTMLDivElement>(null)
  const openCalledRef = useRef(false)

  const interactive = state === 'idle' || state === 'hinted'

  // Entry fade-in
  useEffect(() => {
    gsap.fromTo(
      sceneRef.current,
      { opacity: 0, scale: 0.96 },
      { opacity: 1, scale: 1, duration: 1.6, ease: 'power3.out', delay: 0.5 },
    )
    // Render first frame on mobile (iOS needs this)
    const v = videoRef.current
    if (v) { v.currentTime = 0.001 }
  }, [])

  // Hint appears when state becomes 'hinted'
  useEffect(() => {
    if (state !== 'hinted') return
    gsap.fromTo(
      hintRef.current,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 1.1, ease: 'power2.out', delay: 0.2 },
    )
  }, [state])

  // Start video when opening
  useEffect(() => {
    if (state !== 'opening' || openCalledRef.current) return
    openCalledRef.current = true
    gsap.to(hintRef.current, { opacity: 0, y: -8, duration: 0.28 })
    videoRef.current?.play().catch(() => {})
  }, [state])

  const handleEnded = useCallback(() => {
    gsap.to(sceneRef.current, {
      opacity: 0,
      scale: 1.05,
      duration: 0.9,
      ease: 'power2.inOut',
      onComplete: onOpenComplete,
    })
  }, [onOpenComplete])

  const handleClick = useCallback(() => {
    if (!interactive) return
    onEnvelopeClick()
  }, [interactive, onEnvelopeClick])

  return (
    <div
      ref={sceneRef}
      onClick={handleClick}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20,
        cursor: interactive ? 'pointer' : 'default',
        userSelect: 'none',
      }}
    >
      {/* Video + edge-blend wrapper */}
      <div style={{ position: 'relative', width: 'clamp(300px, 84vw, 720px)' }}>

        {/* Radial vignette — fades video rect into the ivory background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 3,
            pointerEvents: 'none',
            background: [
              'radial-gradient(ellipse 92% 92% at 50% 50%,',
              '  transparent 38%,',
              '  rgba(240,229,200,0.22) 55%,',
              '  rgba(240,229,200,0.62) 70%,',
              '  rgba(240,229,200,0.88) 82%,',
              '  rgba(240,229,200,0.97) 94%,',
              '  rgba(240,229,200,1.00) 100%',
              ')',
            ].join(''),
          }}
        />

        <video
          ref={videoRef}
          src="/assets/envelope-open.mp4"
          playsInline
          preload="auto"
          style={{
            display: 'block',
            width: '100%',
            height: 'auto',
            pointerEvents: 'none',
          }}
          onEnded={handleEnded}
        />
      </div>

      {/* Tap hint — hidden until 'hinted' state */}
      <div
        ref={hintRef}
        style={{
          marginTop: 26,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
          opacity: 0,
          pointerEvents: 'none',
        }}
      >
        <div style={{ position: 'relative', width: 36, height: 36 }}>
          {[0, 0.55, 1.10].map((d, i) => (
            <div
              key={i}
              style={{
                position: 'absolute', inset: 0,
                borderRadius: '50%',
                border: `1.5px solid ${accentColor}58`,
                animation: `venv-ring 2.2s ${d}s ease-out infinite`,
              }}
            />
          ))}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15,
            animation: 'venv-bounce 2.0s ease-in-out infinite',
            filter: `drop-shadow(0 2px 6px ${accentColor}60)`,
          }}>✦</div>
        </div>

        <span style={{
          fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
          fontStyle: 'italic',
          fontSize: 'clamp(12px, 1.9vw, 15px)',
          letterSpacing: '0.28em',
          color: 'transparent',
          background: `linear-gradient(90deg, ${accentColor} 0%, #E8C88A 38%, ${accentColor} 68%, #E8C88A 100%)`,
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          animation: 'venv-shimmer 3.4s linear infinite',
          whiteSpace: 'nowrap',
        }}>
          Tap to open
        </span>
      </div>

      <style>{`
        video::-webkit-media-controls,
        video::-webkit-media-controls-enclosure,
        video::-webkit-media-controls-panel,
        video::-webkit-media-controls-overlay-play-button,
        video::-webkit-media-controls-start-playback-button { display: none !important; }
        @keyframes venv-ring    { 0% { transform: scale(0.5); opacity: 0.65; } 100% { transform: scale(2.8); opacity: 0; } }
        @keyframes venv-bounce  { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        @keyframes venv-shimmer { 0% { background-position: 200% center; } 100% { background-position: -200% center; } }
      `}</style>
    </div>
  )
}
