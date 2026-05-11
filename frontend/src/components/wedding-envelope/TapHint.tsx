import { useEffect, useRef } from 'react'
import { gsap } from '../../lib/gsap-init'

interface Props {
  visible: boolean
}

export function TapHint({ visible }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (visible) {
      gsap.fromTo(el,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out', delay: 0.3 }
      )
    } else {
      gsap.to(el, { opacity: 0, y: -8, duration: 0.35, ease: 'power2.in' })
    }
  }, [visible])

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        bottom: '18%',
        left: '50%',
        transform: 'translateX(-50%)',
        opacity: 0,
        pointerEvents: 'none',
        zIndex: 60,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <TapIcon />

      <span style={{
        fontFamily: "'Cormorant Garamond', 'Georgia', serif",
        fontSize: 'clamp(13px, 2vw, 16px)',
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        color: 'transparent',
        background: 'linear-gradient(90deg, #B08060 0%, #D4A878 40%, #B08060 60%, #D4A878 100%)',
        backgroundSize: '200% auto',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        animation: 'tap-shimmer 2.8s linear infinite',
        whiteSpace: 'nowrap',
        fontStyle: 'italic',
      }}>
        Tap to open
      </span>

      <style>{`
        @keyframes tap-shimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes tap-bounce {
          0%, 100% { transform: translateY(0) scale(1); }
          45%       { transform: translateY(-7px) scale(1.06); }
          72%       { transform: translateY(-2px) scale(0.98); }
        }
        @keyframes tap-ring {
          0%   { transform: scale(0.5); opacity: 0.6; }
          100% { transform: scale(2.4); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

function TapIcon() {
  return (
    <div style={{ position: 'relative', width: 44, height: 52 }}>
      {[0, 0.45, 0.9].map((delay, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '1.5px solid rgba(180,140,100,0.5)',
            animation: `tap-ring 1.8s ${delay}s ease-out infinite`,
          }}
        />
      ))}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        animation: 'tap-bounce 1.8s ease-in-out infinite',
        fontSize: 26,
        lineHeight: 1,
        filter: 'drop-shadow(0 2px 6px rgba(180,120,80,0.3))',
      }}>
        👆
      </div>
    </div>
  )
}
