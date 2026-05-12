import { useRef, useEffect } from 'react'
import { gsap, ScrollTrigger } from '../../lib/gsap-init'
import { useAnimationDisabled } from '../../contexts/AnimationContext'

interface Props {
  content?: string
  align?: 'left' | 'center' | 'right'
  bgColor?: string
  textColor?: string
  padding?: 'small' | 'medium' | 'large'
}

const PADDING = { small: 'py-6 px-6', medium: 'py-12 px-8', large: 'py-20 px-10' }

export function RichTextWidget({
  content = '<p>Add your text here...</p>',
  align = 'center',
  bgColor = '#ffffff',
  textColor = '#111827',
  padding = 'medium',
}: Props) {
  const proseRef = useRef<HTMLDivElement>(null)
  const disabled = useAnimationDisabled()

  useEffect(() => {
    const container = proseRef.current
    if (!container || disabled) return

    // Animate each block-level element as a separate unit
    const blocks = Array.from(
      container.querySelectorAll<HTMLElement>('p, h1, h2, h3, h4, h5, h6, li, blockquote')
    ).filter((el) => el.textContent?.trim())

    if (!blocks.length) return

    const reset = () => gsap.set(blocks, { opacity: 0, y: 24 })
    reset()

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: 'top 87%',
      onEnter: () => {
        gsap.to(blocks, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.13,
        })
      },
      onLeaveBack: reset,
    })

    return () => {
      trigger.kill()
      gsap.set(blocks, { clearProps: 'all' })
    }
  }, [content, disabled])

  return (
    <div className={PADDING[padding] || PADDING.medium} style={{ fontFamily: 'var(--font-heading, inherit)', backgroundColor: bgColor, color: textColor }}>
      <div
        ref={proseRef}
        className="max-w-3xl mx-auto prose prose-lg"
        style={{ textAlign: align, fontFamily: 'var(--font-body, inherit)', color: textColor }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  )
}
