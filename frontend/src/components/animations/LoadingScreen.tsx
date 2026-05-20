import { useEffect, useRef } from 'react'
import { gsap, SplitText } from '../../lib/gsap-init'
import { getAnimationCollection, type AnimationCollection } from '../../data/animationCollections'

interface Props {
  collectionId: string
  eventTitle?: string
  onComplete: () => void
}

export function LoadingScreen({ collectionId, eventTitle, onComplete }: Props) {
  const collection = getAnimationCollection(collectionId)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    // gsap.context tracks all animations for clean revert on unmount
    const ctx = gsap.context(() => {}, wrapper)

    const run = () => {
      ctx.add(() => {
        const tl = gsap.timeline()
        switch (collectionId) {
          case 'butterfly-garden': buildButterflyGarden(tl, wrapper, collection, onComplete); break
          case 'rose-petals':      buildRosePetals(tl, wrapper, collection, eventTitle ?? '', onComplete); break
          case 'golden-rings':     buildGoldenRings(tl, wrapper, collection, eventTitle ?? '', onComplete); break
          case 'cherry-blossom':   buildCherryBlossom(tl, wrapper, collection, eventTitle ?? '', onComplete); break
          case 'minimalist-lace':  buildMinimalistLace(tl, wrapper, collection, eventTitle ?? '', onComplete); break
          default:                 buildDefault(tl, wrapper, collection, eventTitle ?? '', onComplete)
        }
      })
    }

    // document.fonts.ready is typically already resolved — .then() fires as microtask
    document.fonts.ready.then(run)

    return () => ctx.revert()
  }, [collectionId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Video intro: full-screen video player — no GSAP needed
  if (collectionId === 'video-intro' && collection.videoSrc) {
    return (
      <VideoIntroScreen
        videoSrc={collection.videoSrc}
        onComplete={onComplete}
      />
    )
  }

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        backgroundColor: collection.loadingBg,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {collectionId === 'butterfly-garden' && <ButterflyGardenDOM c={collection} title={eventTitle} />}
      {collectionId === 'rose-petals'      && <RosePetalsDOM c={collection} title={eventTitle} />}
      {collectionId === 'golden-rings'     && <GoldenRingsDOM c={collection} title={eventTitle} />}
      {collectionId === 'cherry-blossom'   && <CherryBlossomDOM c={collection} title={eventTitle} />}
      {collectionId === 'minimalist-lace'  && <MinimalistLaceDOM c={collection} title={eventTitle} />}
      {!['butterfly-garden','rose-petals','golden-rings','cherry-blossom','minimalist-lace'].includes(collectionId) && (
        <DefaultDOM c={collection} title={eventTitle} />
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   1. BUTTERFLY GARDEN
   Sequence: ornaments slide in → envelope rises → flap opens
             → butterfly emerges → hover → text reveals → fade out
───────────────────────────────────────────────────────────────*/

function ButterflyGardenDOM({ c, title }: { c: AnimationCollection; title?: string }) {
  const { loadingAccent: accent, loadingText: text } = c
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
      <div className="bg-orn-l" style={{ position: 'absolute', left: -120, top: '50%', transform: 'translateY(-60%)', opacity: 0, pointerEvents: 'none' }}>
        <BotanicalSvg color={accent} />
      </div>
      <div className="bg-orn-r" style={{ position: 'absolute', right: -120, top: '50%', transform: 'translateY(-60%) scaleX(-1)', opacity: 0, pointerEvents: 'none' }}>
        <BotanicalSvg color={accent} />
      </div>

      {/* Envelope */}
      <div className="bg-envelope" style={{ position: 'relative', width: 200, opacity: 0, marginBottom: 8 }}>
        <div style={{ position: 'relative', height: 140, background: `linear-gradient(160deg, ${accent}18, ${accent}38)`, border: `1.5px solid ${accent}55`, borderRadius: 4, overflow: 'hidden' }}>
          {/* Envelope side panels */}
          <svg style={{ position: 'absolute', inset: 0 }} width="200" height="140" viewBox="0 0 200 140" preserveAspectRatio="none">
            <path d="M0,0 L0,140 L100,75 Z" fill={accent + '18'} />
            <path d="M200,0 L200,140 L100,75 Z" fill={accent + '18'} />
            <path d="M0,140 L200,140 L100,75 Z" fill={accent + '28'} />
          </svg>
          {/* Wax seal */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 36, height: 36, borderRadius: '50%', background: accent + '33', border: `1px solid ${accent}55`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: accent, fontSize: 14, opacity: 0.7 }}>✦</span>
          </div>
        </div>
        {/* Top flap — opens via GSAP rotationX */}
        <div
          className="bg-env-flap"
          style={{
            position: 'absolute', top: 0, left: 0, width: '100%',
            transformOrigin: 'top center', transformStyle: 'preserve-3d',
          }}
        >
          <svg width="200" height="80" viewBox="0 0 200 80">
            <path d="M0,0 L200,0 L100,80 Z" fill={accent + '55'} />
            <path d="M0,0 L200,0 L100,80 Z" fill="none" stroke={accent + '44'} strokeWidth="1" />
          </svg>
        </div>
      </div>

      {/* Butterfly */}
      <div className="bg-butterfly" style={{ opacity: 0, marginBottom: 20 }}>
        <ButterflySvg size={110} color={accent} />
      </div>

      {/* Text */}
      <div className="bg-text-block" style={{ textAlign: 'center', opacity: 0 }}>
        <p className="bg-eyebrow" style={{ color: accent, fontSize: 11, fontFamily: "'Lato', sans-serif", fontWeight: 300, letterSpacing: '0.4em', margin: '0 0 12px', textTransform: 'uppercase' }}>
          You're Cordially
        </p>
        <h1 className="bg-title" style={{ color: c.loadingText, fontSize: 38, fontFamily: "'Playfair Display', serif", fontWeight: 700, margin: '0 0 12px', letterSpacing: '0.1em', lineHeight: 1.1 }}>
          Invited
        </h1>
        {title && (
          <p className="bg-subtitle" style={{ color: accent, fontSize: 15, fontFamily: "'Playfair Display', serif", fontStyle: 'italic', margin: 0, opacity: 0, letterSpacing: '0.05em' }}>
            {title}
          </p>
        )}
        <div className="bg-divider" style={{ width: 0, height: 1, background: accent, margin: '16px auto 0', opacity: 0.5 }} />
      </div>
    </div>
  )
}

function buildButterflyGarden(
  tl: gsap.core.Timeline,
  scope: HTMLElement,
  c: AnimationCollection,
  onComplete: () => void,
) {
  const q = (s: string) => scope.querySelector<HTMLElement>(s)

  gsap.set(q('.bg-envelope'), { y: 50 })
  gsap.set(q('.bg-butterfly'), { scale: 0, rotation: -30 })
  gsap.set(q('.bg-orn-l'), { x: -60 })
  gsap.set(q('.bg-orn-r'), { x: 60 })

  // Ornaments slide in from sides
  tl.to('.bg-orn-l', { x: 0, opacity: 1, duration: 1.3, ease: 'expo.out' }, 0)
    .to('.bg-orn-r', { x: 0, opacity: 1, duration: 1.3, ease: 'expo.out' }, 0)
    // Envelope rises
    .to('.bg-envelope', { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }, 0.4)
    // Envelope flap opens (3-D fold)
    .to('.bg-env-flap', { rotationX: -185, duration: 1.6, ease: 'power2.inOut' }, 1.2)
    // Butterfly bursts out
    .to('.bg-butterfly', { opacity: 1, scale: 1, rotation: 0, duration: 0.9, ease: 'back.out(1.8)' }, 2.3)
    // Envelope fades away as butterfly takes centre stage
    .to('.bg-envelope', { opacity: 0, y: 30, duration: 0.7, ease: 'power2.in' }, 2.7)
    // Butterfly hover loop (separate tween — doesn't block timeline)
    .call(() => {
      gsap.to(q('.bg-butterfly'), { y: -18, duration: 2, ease: 'sine.inOut', yoyo: true, repeat: -1 })
    }, [], 2.5)
    // Text block fades in
    .to('.bg-text-block', { opacity: 1, duration: 0.6, ease: 'power2.out' }, 3.2)
    // Eyebrow letter-by-letter
    .call(() => {
      const el = q('.bg-eyebrow')
      if (!el) return
      const split = new SplitText(el, { type: 'chars' })
      gsap.from(split.chars, { opacity: 0, y: 12, stagger: { amount: 0.7, from: 'start' }, duration: 0.4, ease: 'power2.out' })
    }, [], 3.2)
    // Title big reveal
    .call(() => {
      const el = q('.bg-title')
      if (!el) return
      const split = new SplitText(el, { type: 'chars' })
      gsap.from(split.chars, {
        opacity: 0, y: 40, rotationX: -80,
        transformOrigin: '50% 100% -20',
        stagger: { amount: 1, from: 'start' },
        duration: 0.6, ease: 'expo.out',
      })
    }, [], 3.5)
    // Subtitle + divider
    .to('.bg-subtitle', { opacity: 1, duration: 0.8, ease: 'power2.out' }, 4.8)
    .to('.bg-divider', { width: 100, duration: 0.8, ease: 'power2.out' }, 4.8)
    // Hold, then fade the whole screen out
    .to(scope, { opacity: 0, duration: 0.9, ease: 'power2.inOut', onComplete }, 7.6)
}

/* ─────────────────────────────────────────────────────────────
   2. ROSE PETALS
   Sequence: petals cascade → invitation text rises → title stagger
             → flourish line → fade
───────────────────────────────────────────────────────────────*/

const PETAL_DATA = Array.from({ length: 24 }, (_, i) => ({
  left: `${4 + (i % 12) * 8 + Math.sin(i * 1.9) * 4}%`,
  delay: (i * 0.22) % 2.4,
  size: 12 + (i % 5) * 5,
  duration: 4 + (i % 4) * 1.2,
  drift: (Math.random() - 0.5) * 80,
  rotate: Math.random() * 360,
}))

function RosePetalsDOM({ c, title }: { c: AnimationCollection; title?: string }) {
  const { loadingAccent: accent, loadingText: text } = c
  return (
    <>
      {/* Falling petals (pre-rendered, animated via GSAP) */}
      {PETAL_DATA.map((p, i) => (
        <div
          key={i}
          className="rp-petal"
          data-index={i}
          style={{
            position: 'absolute',
            top: -60,
            left: p.left,
            opacity: 0,
            pointerEvents: 'none',
          }}
        >
          <PetalSvg size={p.size} color={accent} rotate={p.rotate} />
        </div>
      ))}

      {/* Center text */}
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <p className="rp-sub" style={{ color: accent, fontSize: 12, fontFamily: "'Lato', sans-serif", fontWeight: 300, letterSpacing: '0.35em', opacity: 0, marginBottom: 10, textTransform: 'uppercase' }}>
          You are invited to
        </p>
        <h1 className="rp-title" style={{ color: c.loadingText, fontSize: 34, fontFamily: "'Playfair Display', serif", fontWeight: 700, margin: '0 0 16px', letterSpacing: '0.08em', lineHeight: 1.15 }}>
          {title || 'A Special Celebration'}
        </h1>
        <svg className="rp-flourish" width="200" height="20" viewBox="0 0 200 20" style={{ opacity: 0, overflow: 'visible' }}>
          <path
            className="rp-flourish-path"
            d="M10,10 Q50,3 100,10 Q150,17 190,10"
            fill="none" stroke={accent} strokeWidth="1.5" strokeLinecap="round"
            strokeDasharray="220" strokeDashoffset="220"
          />
          <circle cx="100" cy="10" r="2.5" fill={accent} opacity="0" className="rp-flourish-dot" />
        </svg>
        {title && (
          <p className="rp-date" style={{ color: accent, fontSize: 13, fontFamily: "'Lato', sans-serif", fontWeight: 300, opacity: 0, marginTop: 16, letterSpacing: '0.2em' }}>
            ✦ ✦ ✦
          </p>
        )}
      </div>
    </>
  )
}

function buildRosePetals(
  tl: gsap.core.Timeline,
  scope: HTMLElement,
  c: AnimationCollection,
  title: string,
  onComplete: () => void,
) {
  // Stagger-launch all petals in a cascade
  const petals = scope.querySelectorAll('.rp-petal')
  petals.forEach((petal, i) => {
    const d = PETAL_DATA[i]
    gsap.to(petal, {
      y: window.innerHeight + 100,
      x: d.drift,
      rotation: d.rotate + 720,
      opacity: 1,
      duration: d.duration,
      delay: d.delay,
      ease: 'none',
      repeat: -1,
      repeatDelay: Math.random() * 2,
    })
    // Fade petals in quickly at start
    gsap.to(petal, { opacity: 0.8, duration: 0.4, delay: d.delay })
  })

  // Title SplitText reveal
  const titleEl = scope.querySelector<HTMLElement>('.rp-title')
  let split: SplitText | null = null
  if (titleEl) {
    split = new SplitText(titleEl, { type: 'chars,words' })
    gsap.set(split.chars, { opacity: 0, y: 30, rotationX: -60 })
  }

  tl
    .to('.rp-sub', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 0.8)
    .to(split ? split.chars : '.rp-title', {
      opacity: 1, y: 0, rotationX: 0,
      stagger: { amount: 1.2, from: 'start' },
      duration: 0.55, ease: 'expo.out',
    }, 1.4)
    .to('.rp-flourish', { opacity: 1, duration: 0.3, ease: 'power2.out' }, 3.0)
    .to('.rp-flourish-path', { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' }, 3.0)
    .to('.rp-flourish-dot', { opacity: 1, scale: 1.4, duration: 0.4, ease: 'back.out(2)' }, 4.0)
    .to('.rp-date', { opacity: 1, duration: 0.6, ease: 'power2.out' }, 4.2)
    .to(scope, { opacity: 0, duration: 0.9, ease: 'power2.inOut', onComplete }, 7.1)
}

/* ─────────────────────────────────────────────────────────────
   3. GOLDEN RINGS
   Sequence: shimmer orbs → rings draw → rings interlace
             → sparkle burst → gold shimmer text → fade
───────────────────────────────────────────────────────────────*/

const RING_CIRC = 2 * Math.PI * 52  // circumference for r=52

function GoldenRingsDOM({ c, title }: { c: AnimationCollection; title?: string }) {
  const { loadingAccent: accent, loadingText: text } = c
  return (
    <>
      {/* Shimmer background orbs */}
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={`gr-orb gr-orb-${i}`}
          style={{
            position: 'absolute',
            width: 120 + i * 60, height: 120 + i * 60,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${accent}1A 0%, transparent 70%)`,
            left: `${8 + i * 22}%`, top: `${12 + (i % 3) * 22}%`,
            opacity: 0, pointerEvents: 'none',
          }}
        />
      ))}

      {/* Rings */}
      <div className="gr-rings" style={{ display: 'flex', alignItems: 'center', marginBottom: 32, opacity: 0 }}>
        <svg className="gr-ring-l" width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" fill="none" stroke={accent} strokeWidth="3.5"
            strokeDasharray={RING_CIRC} strokeDashoffset={RING_CIRC} strokeLinecap="round" />
          <circle cx="60" cy="60" r="44" fill="none" stroke={accent} strokeWidth="0.8"
            strokeDasharray={2 * Math.PI * 44} strokeDashoffset={2 * Math.PI * 44} opacity="0.35" />
        </svg>
        <div style={{ width: 32 }} />
        <svg className="gr-ring-r" width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" fill="none" stroke={accent} strokeWidth="3.5"
            strokeDasharray={RING_CIRC} strokeDashoffset={RING_CIRC} strokeLinecap="round" />
          <circle cx="60" cy="60" r="44" fill="none" stroke={accent} strokeWidth="0.8"
            strokeDasharray={2 * Math.PI * 44} strokeDashoffset={2 * Math.PI * 44} opacity="0.35" />
        </svg>
      </div>

      {/* Sparkles */}
      <div className="gr-sparkles" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {Array.from({ length: 16 }, (_, i) => {
          const a = (i / 16) * Math.PI * 2
          const r = 90 + (i % 3) * 30
          return (
            <div
              key={i}
              className="gr-spark"
              style={{
                position: 'absolute',
                left: `calc(50% + ${Math.cos(a) * r}px)`,
                top: `calc(50% + ${Math.sin(a) * r * 0.55}px)`,
                opacity: 0,
                transform: 'scale(0)',
              }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10">
                <polygon points="5,0 6.2,3.8 10,5 6.2,6.2 5,10 3.8,6.2 0,5 3.8,3.8" fill={accent} />
              </svg>
            </div>
          )
        })}
      </div>

      {/* Text */}
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <p
          className="gr-together"
          style={{
            fontSize: 12, fontFamily: "'Lato', sans-serif", fontWeight: 300,
            background: `linear-gradient(90deg, ${accent}, #f5e08a, ${accent})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundSize: '200%',
            letterSpacing: '0.4em', opacity: 0, marginBottom: 12,
            textTransform: 'uppercase',
          }}
        >
          ✦ Together in Love ✦
        </p>
        <h1 className="gr-title" style={{ color: text, fontSize: 32, fontFamily: "'Playfair Display', serif", fontWeight: 700, margin: 0, letterSpacing: '0.1em', opacity: 0 }}>
          {title || 'You Are Cordially Invited'}
        </h1>
      </div>
    </>
  )
}

function buildGoldenRings(
  tl: gsap.core.Timeline,
  scope: HTMLElement,
  c: AnimationCollection,
  title: string,
  onComplete: () => void,
) {
  const accent = c.loadingAccent

  // Orbs appear staggered
  tl.to('.gr-orb', { opacity: 1, duration: 0.6, stagger: 0.15, ease: 'power2.out' }, 0)

  // Rings fade in, then draw
  tl.to('.gr-rings', { opacity: 1, duration: 0.4, ease: 'power2.out' }, 0.3)

  // Left ring draws
  const lCircles = scope.querySelector('.gr-ring-l')?.querySelectorAll('circle')
  if (lCircles) {
    tl.to(lCircles[0], { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' }, 0.5)
    tl.to(lCircles[1], { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut' }, 0.7)
  }
  // Right ring draws slightly offset
  const rCircles = scope.querySelector('.gr-ring-r')?.querySelectorAll('circle')
  if (rCircles) {
    tl.to(rCircles[0], { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' }, 0.9)
    tl.to(rCircles[1], { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut' }, 1.1)
  }

  // Rings slide to overlap / interlace
  tl.to('.gr-ring-l', { x: 28, duration: 1, ease: 'power3.inOut' }, 2.3)
    .to('.gr-ring-r', { x: -28, duration: 1, ease: 'power3.inOut' }, 2.3)

  // Sparkle burst
  tl.to('.gr-spark', {
    opacity: 1, scale: 1,
    stagger: { amount: 0.5, from: 'random' },
    duration: 0.3, ease: 'back.out(2)',
  }, 3.1)
    .to('.gr-spark', {
      opacity: 0, scale: 0.5, y: -20,
      stagger: { amount: 0.6, from: 'random' },
      duration: 0.6, ease: 'power2.in',
    }, 3.8)

  // Gold shimmer text
  tl.to('.gr-together', { opacity: 1, duration: 0.7, ease: 'power2.out' }, 3.3)
    .call(() => {
      gsap.to(scope.querySelector<HTMLElement>('.gr-together'), {
        backgroundPosition: '200% center',
        duration: 2.5, ease: 'sine.inOut', repeat: -1, yoyo: true,
      })
    }, [], 3.3)

  // Title reveal
  const titleEl = scope.querySelector<HTMLElement>('.gr-title')
  if (titleEl) {
    const split = new SplitText(titleEl, { type: 'chars' })
    tl.from(split.chars, {
      opacity: 0, y: 25, rotationX: -70,
      stagger: { amount: 0.9, from: 'start' },
      duration: 0.5, ease: 'expo.out',
    }, 4.0)
  }

  tl.to(scope, { opacity: 0, duration: 0.9, ease: 'power2.inOut', onComplete }, 7.5)
}

/* ─────────────────────────────────────────────────────────────
   4. CHERRY BLOSSOM
   Sequence: branch draws → blossoms pop → petals drift
             → text reveals → fade
───────────────────────────────────────────────────────────────*/

const BLOSSOM_NODES = [[165, 42], [235, 35], [148, 65], [260, 58], [118, 96], [285, 72]]
const MAIN_BRANCH_LEN = 390
const SUB_BRANCH_LENS = [85, 72, 65]

function CherryBlossomDOM({ c, title }: { c: AnimationCollection; title?: string }) {
  const { loadingAccent: accent, loadingText: text } = c
  const sage = '#7D9B76'

  return (
    <>
      {/* Branch SVG */}
      <div style={{ position: 'absolute', top: '2%', left: '-2%', pointerEvents: 'none' }}>
        <svg width="340" height="260" viewBox="0 0 340 260" overflow="visible">
          {/* Main branch */}
          <path
            className="cb-branch-main"
            d="M12,240 C65,195 125,172 168,140 C210,108 252,85 315,52"
            fill="none" stroke={sage} strokeWidth="3.5" strokeLinecap="round"
            strokeDasharray={MAIN_BRANCH_LEN} strokeDashoffset={MAIN_BRANCH_LEN}
          />
          {/* Sub branches */}
          <path className="cb-branch-sub-0" d="M168,140 C175,110 178,80 172,50"
            fill="none" stroke={sage} strokeWidth="2" strokeLinecap="round"
            strokeDasharray={SUB_BRANCH_LENS[0]} strokeDashoffset={SUB_BRANCH_LENS[0]} />
          <path className="cb-branch-sub-1" d="M230,105 C240,82 237,62 244,42"
            fill="none" stroke={sage} strokeWidth="2" strokeLinecap="round"
            strokeDasharray={SUB_BRANCH_LENS[1]} strokeDashoffset={SUB_BRANCH_LENS[1]} />
          <path className="cb-branch-sub-2" d="M130,162 C118,140 115,118 108,95"
            fill="none" stroke={sage} strokeWidth="1.5" strokeLinecap="round"
            strokeDasharray={SUB_BRANCH_LENS[2]} strokeDashoffset={SUB_BRANCH_LENS[2]} />

          {/* Blossom clusters (start hidden) */}
          {BLOSSOM_NODES.map(([x, y], i) => (
            <g key={i} className="cb-blossom" style={{ transformOrigin: `${x}px ${y}px` }}>
              <BlossomsOnBranch cx={x} cy={y} color={accent} />
            </g>
          ))}
        </svg>
      </div>

      {/* Drifting petals */}
      {Array.from({ length: 20 }, (_, i) => (
        <div
          key={i}
          className="cb-petal"
          style={{
            position: 'absolute',
            top: -50,
            left: `${5 + (i % 10) * 9 + Math.sin(i * 2.3) * 4}%`,
            opacity: 0,
            pointerEvents: 'none',
          }}
        >
          <BlossomSvg size={8 + (i % 4) * 4} color={accent} />
        </div>
      ))}

      {/* Text */}
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 2, marginTop: 'auto' }}>
        <p className="cb-eyebrow" style={{ color: sage, fontSize: 11, fontFamily: "'Lato', sans-serif", fontWeight: 300, letterSpacing: '0.35em', opacity: 0, marginBottom: 10, textTransform: 'uppercase' }}>
          With Joy We Invite You
        </p>
        <h1 className="cb-title" style={{ color: c.loadingText, fontSize: 30, fontFamily: "'Playfair Display', serif", fontWeight: 700, margin: '0 0 12px', letterSpacing: '0.08em', opacity: 0 }}>
          {title || 'To Celebrate With Us'}
        </h1>
        <div className="cb-emoji-row" style={{ fontSize: 18, opacity: 0, letterSpacing: '0.5em' }}>
          🌸 🌸 🌸
        </div>
      </div>
    </>
  )
}

function buildCherryBlossom(
  tl: gsap.core.Timeline,
  scope: HTMLElement,
  c: AnimationCollection,
  title: string,
  onComplete: () => void,
) {
  // Branch draws itself
  tl.to('.cb-branch-main', { strokeDashoffset: 0, duration: 2, ease: 'power2.inOut' }, 0)
    .to('.cb-branch-sub-0', { strokeDashoffset: 0, duration: 0.9, ease: 'power2.out' }, 0.9)
    .to('.cb-branch-sub-1', { strokeDashoffset: 0, duration: 0.8, ease: 'power2.out' }, 1.1)
    .to('.cb-branch-sub-2', { strokeDashoffset: 0, duration: 0.7, ease: 'power2.out' }, 1.3)

  // Blossoms pop on nodes with springy stagger
  gsap.set('.cb-blossom', { scale: 0, opacity: 0 })
  tl.to('.cb-blossom', {
    scale: 1, opacity: 1,
    stagger: { amount: 0.8, from: 'start' },
    duration: 0.5, ease: 'back.out(2.2)',
  }, 1.8)

  // Petals start drifting
  scope.querySelectorAll('.cb-petal').forEach((petal, i) => {
    gsap.to(petal, {
      y: window.innerHeight + 80,
      x: (Math.random() - 0.5) * 120,
      rotation: Math.random() * 540,
      opacity: 1,
      duration: 5 + Math.random() * 3,
      delay: 2.4 + (i * 0.18) % 2,
      ease: 'none',
      repeat: -1,
      repeatDelay: Math.random() * 1.5,
    })
  })

  // Text reveals
  tl.to('.cb-eyebrow', { opacity: 1, duration: 0.7, ease: 'power2.out' }, 3.0)
  const titleEl = scope.querySelector<HTMLElement>('.cb-title')
  if (titleEl) {
    gsap.set(titleEl, { opacity: 1 })
    const split = new SplitText(titleEl, { type: 'chars' })
    tl.from(split.chars, {
      opacity: 0, y: 22, stagger: { amount: 0.9, from: 'start' },
      duration: 0.5, ease: 'power3.out',
    }, 3.4)
  }
  tl.to('.cb-emoji-row', { opacity: 1, duration: 0.8, ease: 'power2.out' }, 4.6)

  tl.to(scope, { opacity: 0, duration: 0.9, ease: 'power2.inOut', onComplete }, 7.5)
}

/* ─────────────────────────────────────────────────────────────
   5. MINIMALIST LACE
   Sequence: outer rect traces → inner patterns → text reveals → fade
───────────────────────────────────────────────────────────────*/

function MinimalistLaceDOM({ c, title }: { c: AnimationCollection; title?: string }) {
  const { loadingAccent: accent, loadingText: text } = c
  return (
    <>
      {/* Lace frame SVG */}
      <svg
        style={{ position: 'absolute', inset: 0, margin: 'auto', opacity: 0.45 }}
        width="320" height="320" viewBox="0 0 320 320"
      >
        <rect className="ml-rect-outer" x="20" y="20" width="280" height="280"
          fill="none" stroke={accent} strokeWidth="0.8"
          strokeDasharray="1120" strokeDashoffset="1120" />
        <rect className="ml-rect-inner" x="40" y="40" width="240" height="240"
          fill="none" stroke={accent} strokeWidth="0.5"
          strokeDasharray="960" strokeDashoffset="960" />
        {/* Corner flourishes */}
        {[[20, 20], [300, 20], [20, 300], [300, 300]].map(([cx, cy], i) => (
          <g key={i} className="ml-corner" style={{ opacity: 0, transformOrigin: `${cx}px ${cy}px` }}>
            <circle cx={cx} cy={cy} r="4" fill="none" stroke={accent} strokeWidth="0.8" />
            <circle cx={cx} cy={cy} r="8" fill="none" stroke={accent} strokeWidth="0.4" opacity="0.5" />
          </g>
        ))}
        {/* Top arch ornaments */}
        {[0, 1, 2, 3].map((i) => (
          <path
            key={i}
            className="ml-arch"
            d={`M${40 + i * 60},40 C${60 + i * 60},65 ${80 + i * 60},65 ${100 + i * 60},40`}
            fill="none" stroke={accent} strokeWidth="0.6"
            strokeDasharray="80" strokeDashoffset="80"
          />
        ))}
        <circle className="ml-center-ring" cx="160" cy="160" r="50"
          fill="none" stroke={accent} strokeWidth="0.6"
          strokeDasharray="315" strokeDashoffset="315" />
      </svg>

      {/* Center text */}
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 2, letterSpacing: '0.25em' }}>
        <div className="ml-line-t" style={{ width: 0, height: 1, background: accent, margin: '0 auto 20px', opacity: 0.5 }} />
        <p className="ml-eyebrow" style={{ color: accent, fontSize: 11, fontFamily: "'Lato', sans-serif", fontWeight: 300, letterSpacing: '0.45em', opacity: 0, marginBottom: 14, textTransform: 'uppercase' }}>
          An Invitation
        </p>
        <h1 className="ml-title" style={{ color: c.loadingText, fontSize: 28, fontFamily: "'Playfair Display', serif", fontWeight: 400, margin: '0 0 14px', letterSpacing: '0.2em', opacity: 0 }}>
          You Are Invited
        </h1>
        {title && (
          <p className="ml-sub" style={{ color: accent, fontSize: 13, fontFamily: "'Lato', sans-serif", fontWeight: 300, letterSpacing: '0.3em', opacity: 0, textTransform: 'uppercase' }}>
            {title}
          </p>
        )}
        <div className="ml-line-b" style={{ width: 0, height: 1, background: accent, margin: '20px auto 0', opacity: 0.5 }} />
      </div>
    </>
  )
}

function buildMinimalistLace(
  tl: gsap.core.Timeline,
  scope: HTMLElement,
  c: AnimationCollection,
  title: string,
  onComplete: () => void,
) {
  tl
    // Outer rectangle traces
    .to('.ml-rect-outer', { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut' }, 0)
    // Corner dots pop
    .to('.ml-corner', { opacity: 1, scale: 1, stagger: 0.12, duration: 0.3, ease: 'back.out(2)' }, 0.4)
    // Inner rectangle
    .to('.ml-rect-inner', { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut' }, 0.6)
    // Arch ornaments
    .to('.ml-arch', { strokeDashoffset: 0, stagger: 0.15, duration: 0.9, ease: 'power2.out' }, 1.2)
    // Center ring
    .to('.ml-center-ring', { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' }, 1.5)
    // Top line
    .to('.ml-line-t', { width: 60, duration: 0.6, ease: 'power2.out' }, 2.0)
    .to('.ml-eyebrow', { opacity: 1, duration: 0.6, ease: 'power2.out' }, 2.3)
    // Title
    .call(() => {
      const el = scope.querySelector<HTMLElement>('.ml-title')
      if (!el) return
      const split = new SplitText(el, { type: 'chars' })
      gsap.from(split.chars, {
        opacity: 0, y: 15, stagger: { amount: 0.7, from: 'start' },
        duration: 0.45, ease: 'power2.out',
      })
      gsap.set(el, { opacity: 1 })
    }, [], 2.6)
    .to('.ml-sub', { opacity: 1, duration: 0.7, ease: 'power2.out' }, 3.4)
    .to('.ml-line-b', { width: 60, duration: 0.6, ease: 'power2.out' }, 3.6)
    .to(scope, { opacity: 0, duration: 0.8, ease: 'power2.inOut', onComplete }, 4.7)
}

/* ─────────────────────────────────────────────────────────────
   DEFAULT
───────────────────────────────────────────────────────────────*/

function DefaultDOM({ c, title }: { c: AnimationCollection; title?: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div className="def-emoji" style={{ fontSize: 52, marginBottom: 20, opacity: 0 }}>{c.emoji}</div>
      <h1 className="def-title" style={{ color: c.loadingText, fontSize: 28, fontFamily: "'Playfair Display', serif", opacity: 0 }}>
        {title || "You're Invited"}
      </h1>
    </div>
  )
}

function buildDefault(
  tl: gsap.core.Timeline,
  scope: HTMLElement,
  c: AnimationCollection,
  title: string,
  onComplete: () => void,
) {
  tl.to('.def-emoji', { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.7)' }, 0)
    .to('.def-title', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 0.5)
    .to(scope, { opacity: 0, duration: 0.8, ease: 'power2.inOut', onComplete }, 3.5)
}

/* ─────────────────────────────────────────────────────────────
   SHARED SVG COMPONENTS
───────────────────────────────────────────────────────────────*/

function BotanicalSvg({ color }: { color: string }) {
  return (
    <svg width="80" height="280" viewBox="0 0 80 280" fill="none">
      <path d="M70,140 C52,112 28,102 15,82" stroke={color} strokeWidth="1.3" opacity="0.5" />
      <path d="M70,140 C48,152 22,158 8,178" stroke={color} strokeWidth="1.3" opacity="0.5" />
      <ellipse cx="28" cy="95" rx="17" ry="9" transform="rotate(-32 28 95)" fill="none" stroke={color} strokeWidth="1" opacity="0.4" />
      <ellipse cx="16" cy="168" rx="14" ry="7.5" transform="rotate(22 16 168)" fill="none" stroke={color} strokeWidth="1" opacity="0.4" />
      <path d="M70,140 C62,120 58,104 64,86" stroke={color} strokeWidth="1.2" opacity="0.4" />
      <path d="M70,140 C64,162 61,180 67,198" stroke={color} strokeWidth="1.2" opacity="0.4" />
      <circle cx="64" cy="84" r="3.5" fill={color} opacity="0.25" />
      <circle cx="67" cy="200" r="2.5" fill={color} opacity="0.25" />
      <path d="M70,140 C78,128 82,115 78,100" stroke={color} strokeWidth="1" opacity="0.3" />
    </svg>
  )
}

function ButterflySvg({ size, color }: { size: number; color: string }) {
  const w = size, h = size * 0.78
  return (
    <svg width={w} height={h} viewBox="0 0 120 94" overflow="visible">
      {/* Left wings */}
      <path d="M60,47 C42,22 8,14 10,40 C12,58 38,64 60,47Z" fill={color} opacity="0.88" />
      <path d="M60,47 C36,56 11,74 22,85 C35,94 56,74 60,47Z" fill={color} opacity="0.72" />
      <path d="M60,47 C48,32 30,28 22,36" stroke={color} strokeWidth="0.8" fill="none" opacity="0.3" />
      {/* Right wings (mirrored) */}
      <path d="M60,47 C78,22 112,14 110,40 C108,58 82,64 60,47Z" fill={color} opacity="0.88" />
      <path d="M60,47 C84,56 109,74 98,85 C85,94 64,74 60,47Z" fill={color} opacity="0.72" />
      {/* Body */}
      <ellipse cx="60" cy="47" rx="2.8" ry="22" fill={color} opacity="0.92" />
      {/* Antennae */}
      <path d="M58,27 C54,18 49,12 46,8" stroke={color} strokeWidth="1.3" fill="none" opacity="0.6" />
      <path d="M62,27 C66,18 71,12 74,8" stroke={color} strokeWidth="1.3" fill="none" opacity="0.6" />
      <circle cx="46" cy="7" r="2.2" fill={color} opacity="0.6" />
      <circle cx="74" cy="7" r="2.2" fill={color} opacity="0.6" />
    </svg>
  )
}

function PetalSvg({ size, color, rotate }: { size: number; color: string; rotate: number }) {
  return (
    <svg width={size} height={size * 1.5} viewBox="0 0 24 36">
      <ellipse cx="12" cy="18" rx="9" ry="15" fill={color} opacity="0.72" transform={`rotate(${rotate % 30 - 15} 12 18)`} />
      <ellipse cx="12" cy="18" rx="5" ry="11" fill="none" stroke={color} strokeWidth="0.6" opacity="0.3" transform={`rotate(${rotate % 30 - 15} 12 18)`} />
    </svg>
  )
}

function BlossomsOnBranch({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  return (
    <g>
      {Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2
        const px = cx + Math.cos(a) * 7.5
        const py = cy + Math.sin(a) * 7.5
        return <ellipse key={i} cx={px} cy={py} rx="5.5" ry="3.5" fill={color} opacity="0.82"
          transform={`rotate(${(i / 5) * 360} ${px} ${py})`} />
      })}
      <circle cx={cx} cy={cy} r="3.5" fill="#FFE0A3" opacity="0.95" />
    </g>
  )
}

/* ─────────────────────────────────────────────────────────────
   VIDEO INTRO — full-screen video, calls onComplete when ended
   or after 12s safety timeout.
───────────────────────────────────────────────────────────────*/

function VideoIntroScreen({ videoSrc, onComplete }: { videoSrc: string; onComplete: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Safety net: dismiss after 12 s even if video doesn't fire 'ended'
    const timer = setTimeout(onComplete, 12000)

    const handleEnded = () => {
      clearTimeout(timer)
      // Short fade-out before calling onComplete
      if (video.parentElement) {
        video.parentElement.style.transition = 'opacity 0.7s ease'
        video.parentElement.style.opacity = '0'
        setTimeout(onComplete, 700)
      } else {
        onComplete()
      }
    }

    video.addEventListener('ended', handleEnded)

    // Skip on tap/click
    const handleSkip = () => {
      clearTimeout(timer)
      video.removeEventListener('ended', handleEnded)
      if (video.parentElement) {
        video.parentElement.style.transition = 'opacity 0.4s ease'
        video.parentElement.style.opacity = '0'
        setTimeout(onComplete, 400)
      } else {
        onComplete()
      }
    }
    video.parentElement?.addEventListener('click', handleSkip)

    return () => {
      clearTimeout(timer)
      video.removeEventListener('ended', handleEnded)
      video.parentElement?.removeEventListener('click', handleSkip)
    }
  }, [onComplete, videoSrc])

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        backgroundColor: '#000',
        cursor: 'pointer',
      }}
      title="Tap to skip"
    >
      <video
        ref={videoRef}
        src={videoSrc}
        autoPlay
        muted
        playsInline
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      {/* Skip hint */}
      <div style={{
        position: 'absolute', bottom: 24, right: 24,
        color: 'rgba(255,255,255,0.5)', fontSize: 12,
        fontFamily: "'Lato', sans-serif", letterSpacing: '0.1em',
        pointerEvents: 'none',
      }}>
        Tap to skip ›
      </div>
    </div>
  )
}

function BlossomSvg({ size, color }: { size: number; color: string }) {
  const c = size / 2
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2
        const px = c + Math.cos(a) * c * 0.45
        const py = c + Math.sin(a) * c * 0.45
        return <ellipse key={i} cx={px} cy={py} rx={c * 0.35} ry={c * 0.22}
          fill={color} opacity="0.82"
          transform={`rotate(${(i / 5) * 360 - 90} ${px} ${py})`} />
      })}
      <circle cx={c} cy={c} r={c * 0.2} fill="#FFE0A3" />
    </svg>
  )
}
