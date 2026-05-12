import { useRef, useEffect, type ElementType, type CSSProperties } from 'react'
import { gsap, SplitText, ScrollTrigger } from '../../lib/gsap-init'
import { useAnimationDisabled } from '../../contexts/AnimationContext'
import { usePageRevealed } from '../../contexts/PageRevealContext'

interface Props {
  as?: ElementType
  text: string
  split?: 'chars' | 'words'
  /** true = animate after page reveal (hero); false = trigger on scroll, replays every scroll-in */
  heroMode?: boolean
  /** ms to wait before starting (useful for sequencing) */
  delay?: number
  /** override default per-element stagger (seconds) */
  stagger?: number
  className?: string
  style?: CSSProperties
}

export function AnimatedText({
  as: Tag = 'span',
  text,
  split = 'words',
  heroMode = false,
  delay = 0,
  stagger,
  className,
  style,
}: Props) {
  const ref      = useRef<HTMLElement>(null)
  const disabled = useAnimationDisabled()
  const revealed = usePageRevealed()

  useEffect(() => {
    const el = ref.current
    if (!el || !text?.trim() || disabled) return

    // Hero-mode: wait until the entrance animation is done and content is visible.
    // Returning early here means the effect will re-run when `revealed` flips to true.
    if (heroMode && !revealed) return

    const splitInstance = new SplitText(el, { type: split })
    const targets = split === 'chars' ? splitInstance.chars : splitInstance.words
    if (!targets.length) { splitInstance.revert(); return }

    const defaultStagger = split === 'chars' ? 0.034 : 0.07
    const duration       = split === 'chars' ? 0.7   : 0.62

    const resetAnim = () => {
      gsap.set(targets, {
        opacity: 0,
        y: split === 'chars' ? 24 : 18,
        ...(split === 'chars' ? { filter: 'blur(8px)' } : {}),
      })
    }

    const animateIn = () => {
      gsap.to(targets, {
        opacity: 1,
        y: 0,
        ...(split === 'chars' ? { filter: 'blur(0px)' } : {}),
        duration,
        ease: 'power3.out',
        stagger: stagger ?? defaultStagger,
        delay: delay / 1000,
      })
    }

    resetAnim()

    let scrollTrigger: ReturnType<typeof ScrollTrigger.create> | undefined
    let timer: ReturnType<typeof setTimeout> | undefined

    if (heroMode) {
      // Small timeout so the browser has painted the now-visible content before animating
      timer = setTimeout(animateIn, 120)
    } else {
      // Scroll-triggered: plays every time the element enters from the top.
      // onLeaveBack resets so re-entry from above re-plays the animation.
      scrollTrigger = ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        onEnter:     animateIn,
        onLeaveBack: resetAnim,
      })
    }

    return () => {
      clearTimeout(timer)
      scrollTrigger?.kill()
      splitInstance.revert()
      // Do NOT clearProps on el — it would remove React-managed inline styles (e.g. color)
      // and React won't re-apply them because it sees no prop change.
    }
  }, [text, split, heroMode, delay, stagger, disabled, revealed])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <Tag ref={ref as any} className={className} style={style}>{text}</Tag>
}
