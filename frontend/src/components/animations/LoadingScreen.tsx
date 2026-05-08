import { useEffect, useRef, useState } from 'react'
import { getAnimationCollection } from '../../data/animationCollections'

interface Props {
  collectionId: string
  eventTitle?: string
  onComplete: () => void
}

export function LoadingScreen({ collectionId, eventTitle, onComplete }: Props) {
  const collection = getAnimationCollection(collectionId)
  const [phase, setPhase] = useState(0)
  const [exiting, setExiting] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const after = (ms: number, fn: () => void) => {
    const t = setTimeout(fn, ms)
    timerRef.current.push(t)
    return t
  }

  useEffect(() => {
    const dur = collection.loadingDuration
    // Advance through phases, then exit
    after(400,       () => setPhase(1))
    after(1400,      () => setPhase(2))
    after(2800,      () => setPhase(3))
    after(4200,      () => setPhase(4))
    after(5600,      () => setPhase(5))
    after(dur - 900, () => setExiting(true))
    after(dur,       () => onComplete())
    return () => timerRef.current.forEach(clearTimeout)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const overlayStyle: React.CSSProperties = {
    position: 'fixed', inset: 0, zIndex: 9999,
    backgroundColor: collection.loadingBg,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
    animation: exiting ? 'loading-fade-out 0.9s ease forwards' : 'envelope-bg-in 0.6s ease forwards',
    pointerEvents: exiting ? 'none' : 'all',
  }

  return (
    <div style={overlayStyle}>
      {collectionId === 'butterfly-garden' && (
        <ButterflyGardenSequence phase={phase} collection={collection} eventTitle={eventTitle} />
      )}
      {collectionId === 'rose-petals' && (
        <RosePetalsSequence phase={phase} collection={collection} eventTitle={eventTitle} />
      )}
      {collectionId === 'golden-rings' && (
        <GoldenRingsSequence phase={phase} collection={collection} eventTitle={eventTitle} />
      )}
      {collectionId === 'cherry-blossom' && (
        <CherryBlossomSequence phase={phase} collection={collection} eventTitle={eventTitle} />
      )}
      {collectionId === 'minimalist-lace' && (
        <MinimalistLaceSequence phase={phase} collection={collection} eventTitle={eventTitle} />
      )}
      {!['butterfly-garden','rose-petals','golden-rings','cherry-blossom','minimalist-lace'].includes(collectionId) && (
        <DefaultSequence phase={phase} collection={collection} eventTitle={eventTitle} />
      )}
    </div>
  )
}

/* ────────── Shared helpers ────────── */

function AnimText({ text, phase, startPhase, color, style }: {
  text: string; phase: number; startPhase: number; color: string; style?: React.CSSProperties
}) {
  if (phase < startPhase) return null
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 2px', ...style }}>
      {text.split('').map((ch, i) => (
        <span
          key={i}
          style={{
            color,
            animation: `char-appear 0.5s ${i * 55}ms ease both`,
            display: 'inline-block',
            whiteSpace: ch === ' ' ? 'pre' : undefined,
          }}
        >
          {ch}
        </span>
      ))}
    </div>
  )
}

/* ────────── 1. BUTTERFLY GARDEN ────────── */

function ButterflyGardenSequence({ phase, collection, eventTitle }: {
  phase: number; collection: ReturnType<typeof getAnimationCollection>; eventTitle?: string
}) {
  const bg = collection.loadingBg
  const accent = collection.loadingAccent
  const text = collection.loadingText

  return (
    <>
      {/* Botanical side ornaments */}
      {phase >= 1 && (
        <>
          <BotanicalOrnamentLeft color={accent} />
          <BotanicalOrnamentRight color={accent} />
        </>
      )}

      {/* Envelope */}
      {phase >= 2 && phase < 4 && (
        <Envelope bg={bg} accent={accent} open={phase >= 3} />
      )}

      {/* Butterfly */}
      {phase >= 3 && (
        <div style={{
          animation: 'butterfly-rise 1.6s cubic-bezier(0.34,1.56,0.64,1) both',
          marginBottom: phase >= 4 ? 32 : 0,
          transition: 'margin 0.6s ease',
        }}>
          <ButterflySvg size={phase >= 4 ? 120 : 60} color={accent} animate />
        </div>
      )}

      {/* Text reveal */}
      {phase >= 4 && (
        <div style={{ textAlign: 'center', marginTop: 24, letterSpacing: '0.18em', userSelect: 'none' }}>
          <AnimText text="YOU'RE" phase={phase} startPhase={4} color={accent}
            style={{ fontSize: 13, fontWeight: 300, fontFamily: "'Lato', sans-serif", marginBottom: 4 }} />
          <AnimText text="CORDIALLY" phase={phase} startPhase={4} color={text}
            style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Playfair Display', serif", marginBottom: 4 }} />
          <AnimText text="INVITED" phase={phase} startPhase={4} color={accent}
            style={{ fontSize: 13, fontWeight: 300, fontFamily: "'Lato', sans-serif" }} />
          {eventTitle && (
            <p style={{
              marginTop: 16, color: text, fontSize: 15, fontFamily: "'Playfair Display', serif",
              opacity: 0, animation: 'anim-fade-in 0.8s 1.6s ease both',
              fontStyle: 'italic', letterSpacing: '0.06em',
            }}>
              {eventTitle}
            </p>
          )}
        </div>
      )}
    </>
  )
}

function Envelope({ bg, accent, open }: { bg: string; accent: string; open: boolean }) {
  const size = 160
  return (
    <div style={{ position: 'relative', width: size, height: size, perspective: 400, marginBottom: 20,
      animation: 'anim-fade-in 0.5s ease both' }}>
      {/* Body */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(135deg, ${accent}22, ${accent}44)`,
        border: `1.5px solid ${accent}88`, borderRadius: 4,
      }} />
      {/* Top flap */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
        background: `linear-gradient(180deg, ${accent}55, ${accent}22)`,
        clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
        transformOrigin: 'top center',
        transformStyle: 'preserve-3d',
        animation: open ? `env-top-open 0.7s 0.1s cubic-bezier(0.4,0,0.2,1) forwards` : undefined,
        borderBottom: `1px solid ${accent}66`,
      }} />
      {/* Bottom flap */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
        background: `${accent}33`,
        clipPath: 'polygon(0 100%, 100% 100%, 50% 0%)',
        transformOrigin: 'bottom center',
        transformStyle: 'preserve-3d',
        animation: open ? `env-bottom-open 0.7s 0.1s cubic-bezier(0.4,0,0.2,1) forwards` : undefined,
      }} />
      {/* X decoration lines */}
      <svg style={{ position: 'absolute', inset: 0 }} width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <line x1="0" y1="0" x2={size} y2={size} stroke={accent} strokeWidth="1" opacity="0.4" />
        <line x1={size} y1="0" x2="0" y2={size} stroke={accent} strokeWidth="1" opacity="0.4" />
        <circle cx={size/2} cy={size/2} r="10" fill="none" stroke={accent} strokeWidth="1.5" opacity="0.5" />
      </svg>
    </div>
  )
}

function ButterflySvg({ size, color, animate }: { size: number; color: string; animate?: boolean }) {
  const w = size, h = size * 0.75
  return (
    <svg width={w} height={h} viewBox="0 0 120 90" style={{ overflow: 'visible' }}>
      {/* Left wings */}
      <g style={{ transformOrigin: '60px 45px', animation: animate ? 'wing-beat 0.7s ease-in-out infinite' : undefined }}>
        <path d="M60,45 C40,20 5,15 8,40 C11,58 38,62 60,45Z" fill={color} opacity="0.85" />
        <path d="M60,45 C38,55 12,72 22,82 C34,90 55,72 60,45Z" fill={color} opacity="0.7" />
      </g>
      {/* Right wings */}
      <g style={{ transformOrigin: '60px 45px', animation: animate ? 'wing-beat 0.7s ease-in-out infinite' : undefined, transform: 'scaleX(-1) translateX(-120px)' }}>
        <path d="M60,45 C40,20 5,15 8,40 C11,58 38,62 60,45Z" fill={color} opacity="0.85" />
        <path d="M60,45 C38,55 12,72 22,82 C34,90 55,72 60,45Z" fill={color} opacity="0.7" />
      </g>
      {/* Body */}
      <ellipse cx="60" cy="45" rx="3" ry="20" fill={color} opacity="0.9" />
      {/* Antennae */}
      <path d="M58,27 C55,20 50,14 48,10" stroke={color} strokeWidth="1.2" fill="none" opacity="0.7" />
      <path d="M62,27 C65,20 70,14 72,10" stroke={color} strokeWidth="1.2" fill="none" opacity="0.7" />
      <circle cx="48" cy="9" r="2" fill={color} opacity="0.7" />
      <circle cx="72" cy="9" r="2" fill={color} opacity="0.7" />
    </svg>
  )
}

function BotanicalOrnamentLeft({ color }: { color: string }) {
  return (
    <div style={{
      position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
      animation: 'botanical-slide-in-left 1s ease both',
      pointerEvents: 'none',
    }}>
      <svg width="90" height="300" viewBox="0 0 90 300">
        <g fill="none" stroke={color} strokeWidth="1.2" opacity="0.5">
          <path d="M80,150 C60,120 30,110 20,90" />
          <path d="M80,150 C55,160 25,165 10,185" />
          <ellipse cx="35" cy="105" rx="18" ry="10" transform="rotate(-30 35 105)" />
          <ellipse cx="22" cy="175" rx="15" ry="8" transform="rotate(20 22 175)" />
          <path d="M80,150 C70,130 65,115 70,95" />
          <path d="M80,150 C72,170 68,188 74,205" />
          <circle cx="70" cy="93" r="4" fill={color} opacity="0.3" />
          <circle cx="74" cy="207" r="3" fill={color} opacity="0.3" />
        </g>
      </svg>
    </div>
  )
}

function BotanicalOrnamentRight({ color }: { color: string }) {
  return (
    <div style={{
      position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%) scaleX(-1)',
      animation: 'botanical-slide-in-right 1s ease both',
      pointerEvents: 'none',
    }}>
      <svg width="90" height="300" viewBox="0 0 90 300">
        <g fill="none" stroke={color} strokeWidth="1.2" opacity="0.5">
          <path d="M80,150 C60,120 30,110 20,90" />
          <path d="M80,150 C55,160 25,165 10,185" />
          <ellipse cx="35" cy="105" rx="18" ry="10" transform="rotate(-30 35 105)" />
          <ellipse cx="22" cy="175" rx="15" ry="8" transform="rotate(20 22 175)" />
          <path d="M80,150 C70,130 65,115 70,95" />
          <path d="M80,150 C72,170 68,188 74,205" />
          <circle cx="70" cy="93" r="4" fill={color} opacity="0.3" />
          <circle cx="74" cy="207" r="3" fill={color} opacity="0.3" />
        </g>
      </svg>
    </div>
  )
}

/* ────────── 2. ROSE PETALS ────────── */

function RosePetalsSequence({ phase, collection, eventTitle }: {
  phase: number; collection: ReturnType<typeof getAnimationCollection>; eventTitle?: string
}) {
  const accent = collection.loadingAccent
  const text = collection.loadingText
  const petals = Array.from({ length: 18 }, (_, i) => i)

  return (
    <>
      {phase >= 1 && petals.map((i) => (
        <FallingPetal key={i} index={i} color={accent} phase={phase} />
      ))}
      {phase >= 3 && (
        <div style={{ textAlign: 'center', zIndex: 2, letterSpacing: '0.2em', userSelect: 'none' }}>
          <p style={{ fontSize: 13, color: accent, fontFamily: "'Lato', sans-serif",
            animation: 'anim-fade-up 0.7s ease both', fontWeight: 300 }}>
            you are invited to
          </p>
          <AnimText
            text={eventTitle || 'A SPECIAL CELEBRATION'}
            phase={phase} startPhase={3} color={text}
            style={{ fontSize: 26, fontFamily: "'Playfair Display', serif", fontWeight: 700,
              marginTop: 8, letterSpacing: '0.12em' }}
          />
          {phase >= 4 && (
            <svg width="160" height="16" viewBox="0 0 160 16" style={{ margin: '14px auto 0' }}>
              <path d="M10,8 Q40,2 80,8 Q120,14 150,8" fill="none" stroke={accent}
                strokeWidth="1.2" strokeDasharray="150" strokeDashoffset="0"
                style={{ animation: 'ring-draw 1.2s ease both' }} />
            </svg>
          )}
        </div>
      )}
    </>
  )
}

function FallingPetal({ index, color, phase }: { index: number; color: string; phase: number }) {
  const left = `${5 + (index % 10) * 9 + Math.sin(index * 1.7) * 4}%`
  const delay = `${(index * 0.28) % 3}s`
  const size = 14 + (index % 5) * 4
  const dur = `${3.5 + (index % 4) * 0.8}s`
  const active = phase >= 1 && phase < 5
  return (
    <div style={{
      position: 'absolute', top: 0, left,
      animation: active ? `petal-fall ${dur} ${delay} ease-in infinite` : undefined,
      pointerEvents: 'none',
    }}>
      <PetalSvg size={size} color={color} />
    </div>
  )
}

function PetalSvg({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size * 1.4} viewBox="0 0 20 28">
      <ellipse cx="10" cy="14" rx="8" ry="13" fill={color} opacity="0.75"
        transform="rotate(-10 10 14)" />
    </svg>
  )
}

/* ────────── 3. GOLDEN RINGS ────────── */

function GoldenRingsSequence({ phase, collection, eventTitle }: {
  phase: number; collection: ReturnType<typeof getAnimationCollection>; eventTitle?: string
}) {
  const accent = collection.loadingAccent
  const text = collection.loadingText
  const r = 54, cx = 50, cy = 50
  const circumference = 2 * Math.PI * r  // ≈ 339

  return (
    <>
      {/* Gold shimmer background orbs */}
      {phase >= 1 && [0,1,2,3,4].map((i) => (
        <div key={i} style={{
          position: 'absolute',
          width: 80 + i * 40, height: 80 + i * 40,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`,
          left: `${10 + i * 18}%`, top: `${15 + (i % 3) * 25}%`,
          animation: `anim-fade-in ${0.4 + i * 0.2}s ease both`,
          pointerEvents: 'none',
        }} />
      ))}

      {/* Rings SVG */}
      {phase >= 2 && (
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32,
          animation: 'anim-fade-in 0.5s ease both' }}>
          {/* Left ring */}
          <svg width="100" height="100" viewBox="0 0 100 100"
            style={{ animation: phase >= 3 ? 'ring-slide-left 0.8s 0.1s ease forwards' : undefined }}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={accent} strokeWidth="3"
              strokeDasharray={circumference} strokeDashoffset={circumference}
              style={{ animation: 'ring-draw 1.4s ease forwards', strokeLinecap: 'round' }} />
            <circle cx={cx} cy={cy} r={r - 6} fill="none" stroke={accent} strokeWidth="0.8"
              opacity="0.3" strokeDasharray={circumference}
              style={{ animation: 'ring-draw 1.6s 0.2s ease forwards' }} />
          </svg>
          {/* Spacer */}
          <div style={{ width: 24 }} />
          {/* Right ring */}
          <svg width="100" height="100" viewBox="0 0 100 100"
            style={{ animation: phase >= 3 ? 'ring-slide-right 0.8s 0.1s ease forwards' : undefined }}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={accent} strokeWidth="3"
              strokeDasharray={circumference} strokeDashoffset={circumference}
              style={{ animation: 'ring-draw 1.4s 0.3s ease forwards', strokeLinecap: 'round' }} />
            <circle cx={cx} cy={cy} r={r - 6} fill="none" stroke={accent} strokeWidth="0.8"
              opacity="0.3" strokeDasharray={circumference}
              style={{ animation: 'ring-draw 1.6s 0.5s ease forwards' }} />
          </svg>
        </div>
      )}

      {/* Sparkle burst */}
      {phase >= 4 && Array.from({ length: 12 }, (_, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${30 + Math.cos(i / 12 * Math.PI * 2) * 25}%`,
          top: `${40 + Math.sin(i / 12 * Math.PI * 2) * 15}%`,
          animation: `sparkle-rise ${0.8 + (i % 3) * 0.3}s ${i * 0.08}s ease both`,
          pointerEvents: 'none',
        }}>
          <svg width="8" height="8" viewBox="0 0 8 8">
            <polygon points="4,0 5,3 8,4 5,5 4,8 3,5 0,4 3,3" fill={accent} />
          </svg>
        </div>
      ))}

      {/* Text */}
      {phase >= 4 && (
        <div style={{ textAlign: 'center', letterSpacing: '0.2em', userSelect: 'none' }}>
          <p style={{
            fontSize: 13, fontFamily: "'Lato', sans-serif", fontWeight: 300,
            background: `linear-gradient(90deg, ${accent}, #f5e08a, ${accent})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundSize: '200%',
            animation: 'shimmer-text 2s ease infinite, anim-fade-in 0.6s ease both',
          }}>
            ✦ TOGETHER IN LOVE ✦
          </p>
          <AnimText
            text={eventTitle || 'YOU ARE CORDIALLY INVITED'}
            phase={phase} startPhase={4} color={text}
            style={{ fontSize: 20, fontFamily: "'Playfair Display', serif", fontWeight: 600, marginTop: 8 }}
          />
        </div>
      )}
    </>
  )
}

/* ────────── 4. CHERRY BLOSSOM ────────── */

function CherryBlossomSequence({ phase, collection, eventTitle }: {
  phase: number; collection: ReturnType<typeof getAnimationCollection>; eventTitle?: string
}) {
  const accent = collection.loadingAccent   // #FFB7C5
  const sage = '#7D9B76'
  const text = collection.loadingText

  return (
    <>
      {/* Branch SVG */}
      {phase >= 1 && (
        <div style={{ position: 'absolute', top: '5%', left: '-2%', pointerEvents: 'none',
          animation: 'anim-fade-in 0.5s ease both' }}>
          <svg width="320" height="240" viewBox="0 0 320 240">
            <path d="M10,220 C60,180 120,160 160,130 C200,100 240,80 300,50"
              fill="none" stroke={sage} strokeWidth="3"
              strokeDasharray="700"
              style={{ animation: 'branch-grow 1.8s ease both' }} />
            <path d="M160,130 C170,100 180,70 175,45"
              fill="none" stroke={sage} strokeWidth="2"
              strokeDasharray="100"
              style={{ animation: 'branch-grow 1.2s 0.6s ease both' }} />
            <path d="M220,100 C230,75 228,55 235,38"
              fill="none" stroke={sage} strokeWidth="2"
              strokeDasharray="80"
              style={{ animation: 'branch-grow 1s 0.9s ease both' }} />
            {/* Blossoms on branch */}
            {phase >= 2 && [[165,42],[235,35],[148,65],[260,58],[120,95]].map(([x,y],i) => (
              <g key={i} style={{ animation: `scale-in 0.5s ${0.3 + i*0.15}s ease both`, transformOrigin: `${x}px ${y}px` }}>
                <BlossomsOnBranch cx={x} cy={y} color={accent} />
              </g>
            ))}
          </svg>
        </div>
      )}

      {/* Falling blossoms */}
      {phase >= 2 && Array.from({ length: 16 }, (_, i) => (
        <div key={i} style={{
          position: 'absolute', top: 0,
          left: `${8 + (i % 9) * 10 + Math.sin(i * 2.1) * 5}%`,
          animation: `blossom-drift ${3 + (i % 4) * 0.7}s ${(i * 0.35) % 3}s ease-in infinite`,
          pointerEvents: 'none',
        }}>
          <BlossomSvg size={10 + (i % 4) * 4} color={accent} />
        </div>
      ))}

      {/* Text */}
      {phase >= 4 && (
        <div style={{ textAlign: 'center', letterSpacing: '0.18em', userSelect: 'none', zIndex: 2 }}>
          <AnimText text="WITH JOY WE INVITE YOU" phase={phase} startPhase={4} color={sage}
            style={{ fontSize: 12, fontFamily: "'Lato', sans-serif", fontWeight: 300 }} />
          <AnimText
            text={eventTitle || 'TO CELEBRATE WITH US'}
            phase={phase} startPhase={4} color={text}
            style={{ fontSize: 22, fontFamily: "'Playfair Display', serif", fontWeight: 700,
              marginTop: 8, letterSpacing: '0.1em' }}
          />
          <div style={{ fontSize: 22, marginTop: 12,
            animation: 'anim-fade-in 0.6s 1.4s ease both', opacity: 0 }}>
            🌸 🌸 🌸
          </div>
        </div>
      )}
    </>
  )
}

function BlossomsOnBranch({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  const petals = Array.from({ length: 5 }, (_, i) => {
    const angle = (i / 5) * Math.PI * 2
    return { x: cx + Math.cos(angle) * 7, y: cy + Math.sin(angle) * 7 }
  })
  return (
    <g>
      {petals.map((p, i) => (
        <ellipse key={i} cx={p.x} cy={p.y} rx="5" ry="3.5"
          fill={color} opacity="0.8"
          transform={`rotate(${(i/5)*360} ${p.x} ${p.y})`} />
      ))}
      <circle cx={cx} cy={cy} r="3" fill="#FFE0A3" opacity="0.9" />
    </g>
  )
}

function BlossomSvg({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      {Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2
        const x = 12 + Math.cos(a) * 5.5
        const y = 12 + Math.sin(a) * 5.5
        return <ellipse key={i} cx={x} cy={y} rx="4" ry="2.5"
          fill={color} opacity="0.82"
          transform={`rotate(${(i/5)*360 - 90} ${x} ${y})`} />
      })}
      <circle cx="12" cy="12" r="2.5" fill="#FFE0A3" />
    </svg>
  )
}

/* ────────── 5. MINIMALIST LACE ────────── */

function MinimalistLaceSequence({ phase, collection, eventTitle }: {
  phase: number; collection: ReturnType<typeof getAnimationCollection>; eventTitle?: string
}) {
  const accent = collection.loadingAccent
  const text = collection.loadingText

  return (
    <>
      {/* Lace SVG trace */}
      {phase >= 1 && (
        <svg width="300" height="300" viewBox="0 0 300 300" style={{ position: 'absolute', opacity: 0.35 }}>
          <rect x="30" y="30" width="240" height="240" fill="none" stroke={accent}
            strokeWidth="0.8" strokeDasharray="1000"
            style={{ animation: 'lace-trace 2.5s ease both' }} />
          <rect x="50" y="50" width="200" height="200" fill="none" stroke={accent}
            strokeWidth="0.5" strokeDasharray="900"
            style={{ animation: 'lace-trace 2.5s 0.2s ease both' }} />
          {[0,1,2,3].map((i) => (
            <path key={i}
              d={`M${30+60*i},30 C${50+60*i},60 ${70+60*i},60 ${90+60*i},30`}
              fill="none" stroke={accent} strokeWidth="0.6" strokeDasharray="120"
              style={{ animation: `lace-trace 1.5s ${0.4 + i*0.2}s ease both` }} />
          ))}
          <circle cx="150" cy="150" r="60" fill="none" stroke={accent}
            strokeWidth="0.8" strokeDasharray="380"
            style={{ animation: 'lace-trace 2s 0.5s ease both' }} />
          <circle cx="150" cy="150" r="40" fill="none" stroke={accent}
            strokeWidth="0.5" strokeDasharray="260"
            style={{ animation: 'lace-trace 1.8s 0.7s ease both' }} />
        </svg>
      )}

      {/* Center text */}
      {phase >= 2 && (
        <div style={{ textAlign: 'center', letterSpacing: '0.25em', zIndex: 2, userSelect: 'none' }}>
          <div style={{ width: 40, height: 1, background: accent, margin: '0 auto 16px',
            animation: 'anim-fade-in 0.5s ease both' }} />
          <AnimText text="YOU ARE INVITED" phase={phase} startPhase={2} color={text}
            style={{ fontSize: 18, fontFamily: "'Playfair Display', serif", fontWeight: 400 }} />
          {eventTitle && (
            <AnimText text={eventTitle.toUpperCase()} phase={phase} startPhase={3} color={accent}
              style={{ fontSize: 13, fontFamily: "'Lato', sans-serif", fontWeight: 300, marginTop: 10 }} />
          )}
          <div style={{ width: 40, height: 1, background: accent, margin: '16px auto 0',
            animation: 'anim-fade-in 0.5s 1s ease both' }} />
        </div>
      )}
    </>
  )
}

/* ────────── DEFAULT ────────── */

function DefaultSequence({ phase, collection, eventTitle }: {
  phase: number; collection: ReturnType<typeof getAnimationCollection>; eventTitle?: string
}) {
  const accent = collection.loadingAccent
  const text = collection.loadingText
  return (
    <div style={{ textAlign: 'center', userSelect: 'none' }}>
      <div style={{ fontSize: 48, animation: 'anim-fade-in 0.6s ease both', marginBottom: 16 }}>
        {collection.emoji}
      </div>
      {phase >= 2 && (
        <AnimText
          text={eventTitle || "YOU'RE INVITED"}
          phase={phase} startPhase={2} color={text}
          style={{ fontSize: 22, fontFamily: "'Playfair Display', serif", letterSpacing: '0.15em' }}
        />
      )}
      {phase >= 3 && (
        <p style={{ color: accent, fontSize: 13, marginTop: 12, fontFamily: 'sans-serif',
          animation: 'anim-fade-in 0.5s ease both' }}>
          {collection.name}
        </p>
      )}
    </div>
  )
}
