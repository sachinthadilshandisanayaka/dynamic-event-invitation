/**
 * ThemeRegistry — single source of truth for all event themes.
 *
 * Naming convention: theme_{eventType}_{variant}
 * e.g. theme_wedding_floral_blue, theme_birthday_confetti_pop
 *
 * Each theme defines:
 *   • id & metadata (name, category, tags)
 *   • colorScheme — maps to CSS custom properties via ThemeInjector
 *   • decorations — corner/overlay image assets from public/assets/themes/
 *   • animation — which animation collection to use
 *   • fonts — heading + body Google Font names
 *   • envelope — envelope style for the opening animation
 *   • cssVars — any additional CSS overrides
 *
 * Admin users select a theme via the ThemePicker. The selection writes the
 * theme ID into theme.tokens.__themeId. ThemeDecorationLayer reads it at
 * runtime and renders the correct decorations without any hardcoded checks.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type EventCategory = 'wedding' | 'birthday' | 'engagement' | 'party' | 'corporate' | 'gala'

/** Which sections a decoration rule applies to */
export type SectionRole = 'first' | 'last' | 'middle' | 'odd' | 'even' | 'any'

/**
 * A decoration rule that targets specific sections by role.
 *
 * Positions are anchored within the section's own bounding box
 * (position: absolute inside a position: relative section wrapper).
 *
 * roles[] determines which sections render this decoration:
 *   first  — index 0 only
 *   last   — final section only
 *   middle — any section that is neither first nor last
 *   odd    — odd-indexed sections (1, 3, 5…)
 *   even   — even-indexed sections (0, 2, 4…)
 *   any    — every section
 *
 * Multiple roles are OR'd — e.g. ['first', 'last'] means first OR last.
 */
export interface SectionDecorationRule {
  id: string
  name?: string
  src: string
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center'
  width: string
  opacity: number
  transform?: string
  zIndex?: number
  hideOnMobile?: boolean
  roles: SectionRole[]
}

/** @deprecated Use SectionDecorationRule instead */
export interface ThemeDecoration {
  src: string
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center'
  width: string
  opacity: number
  transform?: string
  zIndex?: number
  hideOnMobile?: boolean
}

export interface ThemeEnvelope {
  paperColor: string
  sealColor: string
  sealType: 'rose' | 'gold' | 'wax-detailed' | 'minimal'
}

export interface ThemeColorScheme {
  background: string
  surface: string       // card/panel background
  primary: string       // heading color
  secondary: string     // body text
  accent: string        // buttons, highlights
  accentSecondary?: string
  border: string
  overlay?: string      // hero/banner overlay tint
}

export interface ThemeDefinition {
  id: string                         // e.g. 'theme_wedding_floral_blue'
  name: string                       // display name
  tagline: string
  category: EventCategory
  tags: string[]
  previewGradient: string            // CSS gradient for picker preview
  colorScheme: ThemeColorScheme
  fontHeading: string
  fontBody: string
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  animationId: string                // links to ANIMATION_COLLECTIONS
  /** Per-section decoration rules — rendered within each section's own box */
  sectionDecorations: SectionDecorationRule[]
  envelope: ThemeEnvelope
  /** Extra CSS custom properties merged into :root */
  cssVars?: Record<string, string>
}

// ── Theme Registry ────────────────────────────────────────────────────────────

export const THEME_REGISTRY: ThemeDefinition[] = [

  // ── Wedding: Floral Blue ──────────────────────────────────────────────────
  {
    id: 'theme_wedding_floral_blue',
    name: 'Floral Blue',
    tagline: 'Watercolour florals & butterflies on soft cream',
    category: 'wedding',
    tags: ['romantic', 'floral', 'watercolor', 'blue', 'elegant'],
    previewGradient: 'linear-gradient(135deg, #F8F5F0 0%, #D6E4F0 50%, #8EACD4 100%)',
    colorScheme: {
      background:  '#FAF7F4',
      surface:     '#FFFFFF',
      primary:     '#2C4A6E',
      secondary:   '#5A7A9A',
      accent:      '#7CA8CE',
      accentSecondary: '#C8A96E',
      border:      'rgba(44,74,110,0.15)',
      overlay:     'rgba(44,74,110,0.35)',
    },
    fontHeading: 'Cormorant Garamond',
    fontBody:    'Lato',
    borderRadius: 'none',
    animationId: 'butterfly-garden',
    envelope: {
      paperColor: '#F8F4ED',
      sealColor:  '#C8A96E',
      sealType:   'gold',
    },
    sectionDecorations: [
      // Every section — large bouquet draping from top-right (matches Blue Floral reference)
      {
        id: 'fb-bouquet-tr',
        src:      '/assets/themes/wedding/floral-blue/decorations/svgx-bouquet.webp',
        position: 'top-right',
        width:    'clamp(200px, 42vw, 460px)',
        opacity:  0.95,
        zIndex:   5,
        roles:    ['any'],
      },
      // Every section — mirrored bouquet from top-left (creates full-width floral canopy)
      {
        id: 'fb-bouquet-tl',
        src:      '/assets/themes/wedding/floral-blue/decorations/svgx-bouquet.webp',
        position: 'top-left',
        width:    'clamp(160px, 34vw, 380px)',
        opacity:  0.80,
        transform: 'scaleX(-1)',
        zIndex:   4,
        roles:    ['any'],
      },
      // Every section — flipped bouquet draping from bottom-right
      {
        id: 'fb-bouquet-br',
        src:      '/assets/themes/wedding/floral-blue/decorations/svgx-bouquet.webp',
        position: 'bottom-right',
        width:    'clamp(160px, 34vw, 380px)',
        opacity:  0.75,
        transform: 'scale(-1,-1)',
        zIndex:   4,
        hideOnMobile: true,
        roles:    ['any'],
      },
      // Every section — flipped + mirrored bouquet from bottom-left
      {
        id: 'fb-bouquet-bl',
        src:      '/assets/themes/wedding/floral-blue/decorations/svgx-bouquet.webp',
        position: 'bottom-left',
        width:    'clamp(120px, 26vw, 300px)',
        opacity:  0.60,
        transform: 'scaleY(-1)',
        zIndex:   3,
        hideOnMobile: true,
        roles:    ['any'],
      },
      // First section only — ink-splash watercolour accent at mid-left
      {
        id: 'fb-ink-tl-first',
        src:      '/assets/themes/wedding/floral-blue/decorations/svgx-ink-splash.webp',
        position: 'top-left',
        width:    'clamp(120px, 22vw, 260px)',
        opacity:  0.40,
        transform: 'scaleX(-1)',
        zIndex:   3,
        hideOnMobile: true,
        roles:    ['first'],
      },
    ],
    cssVars: {
      '--font-heading': "'Cormorant Garamond', Georgia, serif",
      '--font-body':    "'Lato', system-ui, sans-serif",
      '--color-bg':     '#FAF7F4',
      '--color-text':   '#2C4A6E',
      '--color-accent': '#7CA8CE',
    },
  },

  // ── Wedding: Dark Dramatic ────────────────────────────────────────────────
  {
    id: 'theme_wedding_dark_dramatic',
    name: 'Dark Dramatic',
    tagline: 'Bold navy florals with gold sparkles on midnight',
    category: 'wedding',
    tags: ['luxury', 'dark', 'dramatic', 'navy', 'gold'],
    previewGradient: 'linear-gradient(135deg, #0A0F1E 0%, #1A2540 50%, #C8A96E 100%)',
    colorScheme: {
      background:  '#080C18',
      surface:     '#111827',
      primary:     '#E8D5B0',
      secondary:   '#9BAFC8',
      accent:      '#C8A96E',
      accentSecondary: '#7CA8CE',
      border:      'rgba(200,169,110,0.2)',
      overlay:     'rgba(8,12,24,0.55)',
    },
    fontHeading: 'Cormorant Garamond',
    fontBody:    'Lato',
    borderRadius: 'none',
    animationId: 'butterfly-garden',
    envelope: {
      paperColor: '#1A2540',
      sealColor:  '#C8A96E',
      sealType:   'gold',
    },
    sectionDecorations: [
      // Every section — dramatic dark floral from bottom-left
      {
        id: 'dd-bl',
        src:      '/assets/themes/wedding/floral-blue/decorations/corner-dark-dramatic.png',
        position: 'bottom-left',
        width:    'clamp(200px, 36vw, 420px)',
        opacity:  0.95,
        zIndex:   5,
        roles:    ['any'],
      },
      // Every section — mirrored from bottom-right
      {
        id: 'dd-br',
        src:      '/assets/themes/wedding/floral-blue/decorations/corner-dark-dramatic.png',
        position: 'bottom-right',
        width:    'clamp(160px, 28vw, 360px)',
        opacity:  0.80,
        transform: 'scaleX(-1)',
        zIndex:   4,
        hideOnMobile: true,
        roles:    ['any'],
      },
      // Every section — flipped from top-right
      {
        id: 'dd-tr',
        src:      '/assets/themes/wedding/floral-blue/decorations/corner-dark-dramatic.png',
        position: 'top-right',
        width:    'clamp(140px, 26vw, 320px)',
        opacity:  0.55,
        transform: 'scale(-1,-1)',
        zIndex:   3,
        hideOnMobile: true,
        roles:    ['any'],
      },
    ],
    cssVars: {
      '--color-bg':     '#080C18',
      '--color-text':   '#E8D5B0',
      '--color-accent': '#C8A96E',
    },
  },

  // ── Wedding: Minimal Ivory ────────────────────────────────────────────────
  {
    id: 'theme_wedding_minimal_ivory',
    name: 'Minimal Ivory',
    tagline: 'Clean ivory canvas with delicate botanical accents',
    category: 'wedding',
    tags: ['minimal', 'clean', 'ivory', 'botanical', 'modern'],
    previewGradient: 'linear-gradient(135deg, #FFFDF9 0%, #F5F0E8 50%, #E8DDD0 100%)',
    colorScheme: {
      background:  '#FFFDF9',
      surface:     '#FFFFFF',
      primary:     '#3A3028',
      secondary:   '#6B5F52',
      accent:      '#C4956A',
      border:      'rgba(58,48,40,0.12)',
      overlay:     'rgba(58,48,40,0.3)',
    },
    fontHeading: 'Playfair Display',
    fontBody:    'Inter',
    borderRadius: 'sm',
    animationId: 'minimalist-lace',
    envelope: {
      paperColor: '#FFFDF9',
      sealColor:  '#C4956A',
      sealType:   'wax-detailed',
    },
    sectionDecorations: [
      // Every section — botanical from top-right (scale(-1,-1) → stem at top-right, flowers down-left)
      {
        id: 'mi-botanical-tr',
        src:      '/assets/themes/wedding/floral-blue/decorations/svgx-botanical.webp',
        position: 'top-right',
        width:    'clamp(130px, 24vw, 280px)',
        opacity:  0.30,
        transform: 'scale(-1,-1)',
        zIndex:   4,
        roles:    ['any'],
      },
      // Every section — botanical natural orientation at bottom-left
      {
        id: 'mi-botanical-bl',
        src:      '/assets/themes/wedding/floral-blue/decorations/svgx-botanical.webp',
        position: 'bottom-left',
        width:    'clamp(100px, 20vw, 240px)',
        opacity:  0.22,
        zIndex:   4,
        roles:    ['any'],
      },
      // Every section — botanical mirrored at top-left
      {
        id: 'mi-botanical-tl',
        src:      '/assets/themes/wedding/floral-blue/decorations/svgx-botanical.webp',
        position: 'top-left',
        width:    'clamp(90px, 16vw, 200px)',
        opacity:  0.16,
        transform: 'scaleX(-1)',
        zIndex:   3,
        hideOnMobile: true,
        roles:    ['any'],
      },
      // Every section — flipped botanical at bottom-right
      {
        id: 'mi-botanical-br',
        src:      '/assets/themes/wedding/floral-blue/decorations/svgx-botanical.webp',
        position: 'bottom-right',
        width:    'clamp(80px, 14vw, 180px)',
        opacity:  0.14,
        transform: 'scaleY(-1)',
        zIndex:   3,
        hideOnMobile: true,
        roles:    ['any'],
      },
    ],
    cssVars: {
      '--color-bg':     '#FFFDF9',
      '--color-text':   '#3A3028',
      '--color-accent': '#C4956A',
    },
  },

  // ── Birthday: Confetti Pop ────────────────────────────────────────────────
  {
    id: 'theme_birthday_confetti_pop',
    name: 'Confetti Pop',
    tagline: 'Vibrant & joyful with floating confetti',
    category: 'birthday',
    tags: ['fun', 'colorful', 'confetti', 'vibrant', 'party'],
    previewGradient: 'linear-gradient(135deg, #FFF0F8 0%, #FFE4B5 50%, #FF9EC4 100%)',
    colorScheme: {
      background:  '#FFFAF0',
      surface:     '#FFFFFF',
      primary:     '#D14A7A',
      secondary:   '#6B4C8A',
      accent:      '#F4A340',
      accentSecondary: '#D14A7A',
      border:      'rgba(209,74,122,0.15)',
      overlay:     'rgba(100,50,150,0.35)',
    },
    fontHeading: 'Pacifico',
    fontBody:    'Nunito',
    borderRadius: 'xl',
    animationId: 'rose-petals',
    envelope: {
      paperColor: '#FFFAF0',
      sealColor:  '#D14A7A',
      sealType:   'rose',
    },
    sectionDecorations: [],
    cssVars: {
      '--color-bg':     '#FFFAF0',
      '--color-text':   '#D14A7A',
      '--color-accent': '#F4A340',
    },
  },

  // ── Engagement: Blush Rose ────────────────────────────────────────────────
  {
    id: 'theme_engagement_blush_rose',
    name: 'Blush Rose',
    tagline: 'Soft blush tones with cascading rose petals',
    category: 'engagement',
    tags: ['romantic', 'blush', 'rose', 'soft', 'feminine'],
    previewGradient: 'linear-gradient(135deg, #FFF0F3 0%, #FCCDD5 50%, #E8879A 100%)',
    colorScheme: {
      background:  '#FFF8F9',
      surface:     '#FFFFFF',
      primary:     '#7B3048',
      secondary:   '#9B5065',
      accent:      '#E8879A',
      border:      'rgba(123,48,72,0.12)',
      overlay:     'rgba(123,48,72,0.35)',
    },
    fontHeading: 'Great Vibes',
    fontBody:    'Lato',
    borderRadius: 'lg',
    animationId: 'rose-petals',
    envelope: {
      paperColor: '#FFF8F9',
      sealColor:  '#E8879A',
      sealType:   'rose',
    },
    sectionDecorations: [],
    cssVars: {
      '--color-bg':     '#FFF8F9',
      '--color-text':   '#7B3048',
      '--color-accent': '#E8879A',
    },
  },

  // ── Corporate: Midnight Professional ─────────────────────────────────────
  {
    id: 'theme_corporate_midnight',
    name: 'Midnight Professional',
    tagline: 'Clean, authoritative & distraction-free',
    category: 'corporate',
    tags: ['professional', 'clean', 'dark', 'modern', 'corporate'],
    previewGradient: 'linear-gradient(135deg, #0F1620 0%, #1E2D45 50%, #2563EB 100%)',
    colorScheme: {
      background:  '#0F1620',
      surface:     '#1E2D45',
      primary:     '#F1F5F9',
      secondary:   '#94A3B8',
      accent:      '#3B82F6',
      border:      'rgba(59,130,246,0.2)',
      overlay:     'rgba(15,22,32,0.6)',
    },
    fontHeading: 'Montserrat',
    fontBody:    'Inter',
    borderRadius: 'md',
    animationId: 'minimalist-lace',
    envelope: {
      paperColor: '#1E2D45',
      sealColor:  '#3B82F6',
      sealType:   'minimal',
    },
    sectionDecorations: [],
    cssVars: {
      '--color-bg':     '#0F1620',
      '--color-text':   '#F1F5F9',
      '--color-accent': '#3B82F6',
    },
  },

]

// ── Lookup helpers ────────────────────────────────────────────────────────────

export const THEME_MAP = Object.fromEntries(THEME_REGISTRY.map(t => [t.id, t]))

export function getTheme(id?: string | null): ThemeDefinition {
  return THEME_MAP[id ?? ''] ?? THEME_REGISTRY[0]
}

/** Read __themeId from a theme tokens object or JSON string */
export function getThemeIdFromTokens(tokens?: Record<string, string> | string | null): string {
  if (!tokens) return ''
  const parsed = typeof tokens === 'string'
    ? (() => { try { return JSON.parse(tokens) } catch { return {} } })()
    : tokens
  return (parsed as Record<string, string>)['__themeId'] ?? ''
}

/** Return updated tokens string with __themeId set */
export function setThemeIdInTokens(
  tokens: Record<string, string> | string | undefined,
  themeId: string,
): string {
  const parsed = tokens
    ? (typeof tokens === 'string'
        ? (() => { try { return JSON.parse(tokens) } catch { return {} } })()
        : { ...tokens })
    : {}
  return JSON.stringify({ ...parsed, __themeId: themeId })
}

/** Themes grouped by category for picker UI */
export function getThemesByCategory(): Record<string, ThemeDefinition[]> {
  return THEME_REGISTRY.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = []
    acc[t.category].push(t)
    return acc
  }, {} as Record<string, ThemeDefinition[]>)
}
