import { useEffect, useRef, type ReactNode } from 'react'
import type { ScrollAnim } from '../../data/animationCollections'
import { gsap, ScrollTrigger } from '../../lib/gsap-init'

interface Props {
  children: ReactNode
  scrollAnim: ScrollAnim
  delay?: number
  className?: string
}

// From-vars per animation type (GSAP animates from these to natural position)
function getFromVars(anim: ScrollAnim): gsap.TweenVars {
  switch (anim) {
    case 'fade-up':
      return { opacity: 0, y: 55, duration: 0.85, ease: 'power3.out' }
    case 'bloom':
      return { opacity: 0, scale: 0.88, filter: 'blur(6px)', duration: 0.9, ease: 'expo.out' }
    case 'fade-scale':
      return { opacity: 0, scale: 0.94, duration: 0.8, ease: 'power2.out' }
    case 'slide-left':
      return { opacity: 0, x: -48, duration: 0.85, ease: 'expo.out' }
    case 'curtain':
      return { opacity: 0, y: 40, clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'power3.out' }
    default:
      return { opacity: 0, y: 40, duration: 0.8, ease: 'power2.out' }
  }
}

export function ScrollReveal({ children, scrollAnim, delay = 0, className }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const from = getFromVars(scrollAnim)

    // Set initial hidden state immediately so there's no flash
    const { duration: _dur, ease: _ease, ...initialState } = from
    gsap.set(el, initialState)

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      onEnter: () => {
        gsap.to(el, {
          ...from,
          // Animate TO the natural/cleared state
          opacity: 1, y: 0, x: 0, scale: 1,
          filter: 'blur(0px)',
          clipPath: from.clipPath ? 'inset(0 0 0% 0)' : undefined,
          delay: delay / 1000,
          overwrite: true,
        })
      },
      once: true,  // only trigger on first enter, no reset
    })

    return () => {
      trigger.kill()
      gsap.set(el, { clearProps: 'all' })
    }
  }, [scrollAnim, delay])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
