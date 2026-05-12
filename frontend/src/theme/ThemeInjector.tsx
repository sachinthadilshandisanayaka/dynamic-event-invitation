import { useEffect } from 'react'
import type { Theme } from '../types'
import { getTheme } from '../data/themeRegistry'

interface Props {
  theme: Partial<Theme>
}

export function ThemeInjector({ theme }: Props) {
  useEffect(() => {
    const root = document.documentElement
    let tokens: Record<string, string> = {}

    // Build field-level fallback vars from the theme entity properties
    const fieldVars: Record<string, string> = {}
    if (theme.primaryColor)    fieldVars['--color-primary']   = theme.primaryColor
    if (theme.secondaryColor)  fieldVars['--color-secondary'] = theme.secondaryColor
    if (theme.backgroundColor) fieldVars['--color-bg']        = theme.backgroundColor
    if (theme.textColor)       fieldVars['--color-text']      = theme.textColor
    if (theme.accentColor)     fieldVars['--color-accent']    = theme.accentColor
    if (theme.fontHeading)     fieldVars['--font-heading']    = `'${theme.fontHeading}', sans-serif`
    if (theme.fontBody)        fieldVars['--font-body']       = `'${theme.fontBody}', sans-serif`
    if (theme.borderRadius)    fieldVars['--border-radius']   = theme.borderRadius

    if (theme.tokens) {
      const parsed: Record<string, string> = typeof theme.tokens === 'string'
        ? JSON.parse(theme.tokens)
        : theme.tokens
      // Merge: field vars supply CSS vars that the tokens object doesn't explicitly set
      tokens = { ...fieldVars, ...parsed }
    } else {
      tokens = fieldVars
    }

    // When a registry theme is selected, its cssVars are authoritative for styling.
    // Explicit token overrides (--color-*, --font-*) are ignored so stale DB values
    // from before the theme was applied cannot bleed through.
    const themeId = tokens['__themeId']
    if (themeId) {
      const registryTheme = getTheme(themeId)
      // Non-styling tokens (e.g. custom overrides without a cssVars counterpart) still apply
      const nonRegistryTokens = Object.fromEntries(
        Object.entries(tokens).filter(([k]) => !registryTheme.cssVars?.[k])
      )
      const merged = { ...nonRegistryTokens, ...registryTheme.cssVars }
      Object.entries(merged).forEach(([key, value]) => {
        if (key.startsWith('--')) root.style.setProperty(key, value)
      })
      injectFont(registryTheme.fontHeading)
      injectFont(registryTheme.fontBody)
    } else {
      Object.entries(tokens).forEach(([key, value]) => {
        if (key.startsWith('--')) root.style.setProperty(key, value)
      })
      injectFont(theme.fontHeading)
      injectFont(theme.fontBody)
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
