import { useEffect } from 'react'
import type { Theme } from '../types'

interface Props {
  theme: Partial<Theme>
}

export function ThemeInjector({ theme }: Props) {
  useEffect(() => {
    const root = document.documentElement
    let tokens: Record<string, string> = {}

    if (theme.tokens) {
      tokens = typeof theme.tokens === 'string'
        ? JSON.parse(theme.tokens)
        : theme.tokens
    } else {
      // Build tokens from individual fields
      if (theme.primaryColor) tokens['--color-primary'] = theme.primaryColor
      if (theme.secondaryColor) tokens['--color-secondary'] = theme.secondaryColor
      if (theme.backgroundColor) tokens['--color-bg'] = theme.backgroundColor
      if (theme.textColor) tokens['--color-text'] = theme.textColor
      if (theme.accentColor) tokens['--color-accent'] = theme.accentColor
      if (theme.fontHeading) tokens['--font-heading'] = `'${theme.fontHeading}', sans-serif`
      if (theme.fontBody) tokens['--font-body'] = `'${theme.fontBody}', sans-serif`
      if (theme.borderRadius) tokens['--border-radius'] = theme.borderRadius
    }

    Object.entries(tokens).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })

    // Also inject Google Fonts link if custom fonts
    injectFont(theme.fontHeading)
    injectFont(theme.fontBody)

    return () => {
      // Cleanup tokens on unmount (optional)
    }
  }, [theme])

  return null
}

function injectFont(fontName?: string) {
  if (!fontName || fontName === 'Inter') return
  const id = `font-${fontName.replace(/\s+/g, '-')}`
  if (document.getElementById(id)) return
  const link = document.createElement('link')
  link.id = id
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@300;400;500;600;700&display=swap`
  document.head.appendChild(link)
}
