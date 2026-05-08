import { useEffect, useRef, type ReactNode } from 'react'
import type { ScrollAnim } from '../../data/animationCollections'

interface Props {
  children: ReactNode
  scrollAnim: ScrollAnim
  delay?: number   // extra ms delay per-section (stagger)
  className?: string
}

const ANIM_CLASS: Record<ScrollAnim, string> = {
  'fade-up':    'scroll-fade-up',
  'bloom':      'scroll-bloom',
  'fade-scale': 'scroll-fade-scale',
  'slide-left': 'scroll-slide-left',
  'curtain':    'scroll-curtain',
}

export function ScrollReveal({ children, scrollAnim, delay = 0, className }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    el.classList.add('anim-scroll-target')

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.classList.add('anim-revealed', ANIM_CLASS[scrollAnim])
          }, delay)
          observer.unobserve(el)
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [scrollAnim, delay]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
