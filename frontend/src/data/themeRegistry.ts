/**
 * ThemeRegistry — single source of truth for all event themes.
 *
 * Naming convention: theme_{eventType}_{variant}
 * Each theme defines colors, fonts, animations, entrance type, and inline SVG decorations.
 * All decorations use svgContent (inline SVG strings) — no external image files required.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type EventCategory = 'wedding' | 'birthday' | 'engagement' | 'party' | 'corporate' | 'gala'
export type SectionRole   = 'first' | 'last' | 'middle' | 'odd' | 'even' | 'any'

export interface SectionDecorationRule {
  id: string
  name?: string
  /** External image URL. Omit when svgContent is provided. */
  src?: string
  /** Inline SVG string — rendered directly, no file required. */
  svgContent?: string
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center'
  width: string
  opacity: number
  transform?: string
  zIndex?: number
  hideOnMobile?: boolean
  roles: SectionRole[]
}

export interface ThemeEnvelope {
  paperColor: string
  sealColor:  string
  sealType:   'rose' | 'gold' | 'wax-detailed' | 'minimal'
}

export interface ThemeColorScheme {
  background:       string
  surface:          string
  primary:          string
  secondary:        string
  accent:           string
  accentSecondary?: string
  border:           string
  overlay?:         string
}

export interface ThemeDefinition {
  id:               string
  name:             string
  tagline:          string
  category:         EventCategory
  tags:             string[]
  previewGradient:  string
  colorScheme:      ThemeColorScheme
  fontHeading:      string
  fontBody:         string
  borderRadius:     'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  animationId:      string
  /** 'envelope' shows the interactive WeddingEnvelopeExperience; 'loading-screen' shows LoadingScreen */
  entranceType:     'envelope' | 'loading-screen'
  sectionDecorations: SectionDecorationRule[]
  envelope:         ThemeEnvelope
  cssVars?:         Record<string, string>
}

// ── Inline SVG Decoration Assets ──────────────────────────────────────────────

// Garden Romance — botanical rose & leaf branch
const SVG_GARDEN_BRANCH = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 280" fill="none">
  <path d="M20 260 C50 190 100 145 135 95 C165 50 205 22 265 8" stroke="#5C7A5C" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <path d="M68 192 C48 174 30 178 18 158" stroke="#5C7A5C" stroke-width="1.6" fill="none" stroke-linecap="round"/>
  <path d="M105 138 C122 118 132 102 145 84" stroke="#5C7A5C" stroke-width="1.4" fill="none" stroke-linecap="round"/>
  <ellipse cx="50" cy="204" rx="28" ry="11" fill="#6B8F71" opacity="0.78" transform="rotate(-38 50 204)"/>
  <ellipse cx="78" cy="172" rx="24" ry="10" fill="#8FA88F" opacity="0.65" transform="rotate(-22 78 172)"/>
  <ellipse cx="100" cy="138" rx="26" ry="11" fill="#6B8F71" opacity="0.72" transform="rotate(-52 100 138)"/>
  <ellipse cx="124" cy="108" rx="22" ry="9" fill="#8FA88F" opacity="0.62" transform="rotate(-66 124 108)"/>
  <ellipse cx="152" cy="76" rx="20" ry="8" fill="#6B8F71" opacity="0.68" transform="rotate(-76 152 76)"/>
  <ellipse cx="180" cy="50" rx="17" ry="7" fill="#8FA88F" opacity="0.58" transform="rotate(-82 180 50)"/>
  <g transform="translate(228,28)">
    <circle r="22" fill="#C87878" opacity="0.88"/>
    <circle cy="-10" r="13" fill="#E8A5A5" opacity="0.82"/>
    <circle cx="9" cy="6" r="10" fill="#C87878" opacity="0.68"/>
    <circle cx="-9" cy="6" r="10" fill="#C87878" opacity="0.68"/>
    <circle r="8" fill="#F2C4C4" opacity="0.82"/>
    <circle cy="-2" r="5" fill="#F8DEDE" opacity="0.9"/>
    <circle cx="3" cy="-6" r="2" fill="#B86565" opacity="0.6"/>
  </g>
  <g transform="translate(185,50)">
    <circle r="14" fill="#C87878" opacity="0.72"/>
    <circle cy="-6" r="8" fill="#E8A5A5" opacity="0.76"/>
    <circle r="5" fill="#F2C4C4" opacity="0.76"/>
  </g>
  <g transform="translate(155,48)">
    <circle r="9" fill="#C87878" opacity="0.62"/>
    <circle cy="-4" r="5" fill="#E8A5A5" opacity="0.66"/>
  </g>
  <ellipse cx="170" cy="34" rx="4" ry="8" fill="#C87878" opacity="0.52" transform="rotate(-22 170 34)"/>
  <ellipse cx="198" cy="22" rx="3.5" ry="6" fill="#C87878" opacity="0.46" transform="rotate(-12 198 22)"/>
  <circle cx="245" cy="52" r="2.5" fill="#C87878" opacity="0.38"/>
  <circle cx="210" cy="16" r="2" fill="#6B8F71" opacity="0.44"/>
  <circle cx="252" cy="20" r="2" fill="#C87878" opacity="0.38"/>
</svg>`

// Midnight Luxe — art deco gold ornament
const SVG_MIDNIGHT_ORNAMENT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220" fill="none">
  <line x1="0" y1="1.5" x2="100" y2="1.5" stroke="#C8A96E" stroke-width="1.8"/>
  <line x1="1.5" y1="0" x2="1.5" y2="100" stroke="#C8A96E" stroke-width="1.8"/>
  <circle cx="1.5" cy="1.5" r="4" fill="#C8A96E"/>
  <circle cx="100" cy="1.5" r="3" fill="#C8A96E" opacity="0.7"/>
  <circle cx="1.5" cy="100" r="3" fill="#C8A96E" opacity="0.7"/>
  <line x1="14" y1="14" x2="75" y2="14" stroke="#C8A96E" stroke-width="0.8" opacity="0.55"/>
  <line x1="14" y1="14" x2="14" y2="75" stroke="#C8A96E" stroke-width="0.8" opacity="0.55"/>
  <circle cx="14" cy="14" r="2.5" fill="#C8A96E" opacity="0.55"/>
  <circle cx="75" cy="14" r="2" fill="#C8A96E" opacity="0.4"/>
  <circle cx="14" cy="75" r="2" fill="#C8A96E" opacity="0.4"/>
  <path d="M122 58 L150 86 L122 114 L94 86 Z" fill="#C8A96E" opacity="0.7"/>
  <path d="M122 68 L140 86 L122 104 L104 86 Z" fill="#0D1B2A" opacity="0.85"/>
  <circle cx="122" cy="86" r="7" fill="#C8A96E" opacity="0.82"/>
  <circle cx="122" cy="86" r="3.5" fill="#0D1B2A"/>
  <path d="M28 55 Q58 46 88 55" stroke="#C8A96E" stroke-width="0.9" fill="none" opacity="0.48"/>
  <path d="M55 28 Q46 58 55 88" stroke="#C8A96E" stroke-width="0.9" fill="none" opacity="0.48"/>
  <line x1="150" y1="35" x2="150" y2="58" stroke="#C8A96E" stroke-width="1.1" opacity="0.52"/>
  <line x1="139" y1="47" x2="161" y2="47" stroke="#C8A96E" stroke-width="1.1" opacity="0.52"/>
  <line x1="142" y1="38" x2="158" y2="54" stroke="#C8A96E" stroke-width="0.8" opacity="0.4"/>
  <line x1="158" y1="38" x2="142" y2="54" stroke="#C8A96E" stroke-width="0.8" opacity="0.4"/>
  <circle cx="30" cy="30" r="3.5" fill="#C8A96E" opacity="0.58"/>
  <circle cx="55" cy="14" r="2.5" fill="#C8A96E" opacity="0.46"/>
  <circle cx="14" cy="55" r="2.5" fill="#C8A96E" opacity="0.46"/>
</svg>`

// Pure Ivory — thin geometric line frame
const SVG_IVORY_FRAME = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <path d="M0 0 L95 0" stroke="#1C1C1C" stroke-width="1.4"/>
  <path d="M0 0 L0 95" stroke="#1C1C1C" stroke-width="1.4"/>
  <circle cx="0" cy="0" r="4.5" fill="#1C1C1C" opacity="0.75"/>
  <circle cx="95" cy="0" r="3" fill="#1C1C1C" opacity="0.55"/>
  <circle cx="0" cy="95" r="3" fill="#1C1C1C" opacity="0.55"/>
  <path d="M14 14 L68 14" stroke="#1C1C1C" stroke-width="0.7" opacity="0.4"/>
  <path d="M14 14 L14 68" stroke="#1C1C1C" stroke-width="0.7" opacity="0.4"/>
  <circle cx="14" cy="14" r="2" fill="#1C1C1C" opacity="0.4"/>
  <path d="M48 0 L48 10" stroke="#1C1C1C" stroke-width="0.8" opacity="0.35"/>
  <path d="M0 48 L10 48" stroke="#1C1C1C" stroke-width="0.8" opacity="0.35"/>
  <path d="M105 50 L130 75 L105 100 L80 75 Z" stroke="#1C1C1C" stroke-width="1" fill="none" opacity="0.3"/>
  <circle cx="105" cy="75" r="4.5" fill="#1C1C1C" opacity="0.28"/>
  <line x1="28" y1="6" x2="28" y2="60" stroke="#1C1C1C" stroke-width="0.4" opacity="0.2"/>
  <line x1="6" y1="28" x2="60" y2="28" stroke="#1C1C1C" stroke-width="0.4" opacity="0.2"/>
  <path d="M80 0 Q95 12 80 24" stroke="#1C1C1C" stroke-width="0.7" fill="none" opacity="0.25"/>
  <path d="M0 80 Q12 95 24 80" stroke="#1C1C1C" stroke-width="0.7" fill="none" opacity="0.25"/>
</svg>`

// Blush Petal — cherry blossom branch
const SVG_BLOSSOM_BRANCH = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 280" fill="none">
  <path d="M15 265 C40 205 72 168 105 128 C132 96 158 66 215 30" stroke="#8B5E6E" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <path d="M78 162 C58 142 38 146 24 124" stroke="#8B5E6E" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <path d="M138 100 C158 80 168 62 182 46" stroke="#8B5E6E" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <g transform="translate(208,42)">
    <ellipse rx="10" ry="16" fill="#F9B8C5" opacity="0.88"/>
    <ellipse rx="10" ry="16" fill="#F9B8C5" opacity="0.88" transform="rotate(72)"/>
    <ellipse rx="10" ry="16" fill="#F9B8C5" opacity="0.88" transform="rotate(144)"/>
    <ellipse rx="10" ry="16" fill="#F9B8C5" opacity="0.88" transform="rotate(216)"/>
    <ellipse rx="10" ry="16" fill="#F9B8C5" opacity="0.88" transform="rotate(288)"/>
    <circle r="7" fill="#FCDDE6" opacity="0.92"/>
    <circle r="3.5" fill="#E89BAB" opacity="0.82"/>
    <circle cx="5" cy="-8" r="1.5" fill="#C4687A" opacity="0.65"/>
    <circle cx="-5" cy="-8" r="1.5" fill="#C4687A" opacity="0.65"/>
    <circle cx="8" cy="2" r="1.5" fill="#C4687A" opacity="0.65"/>
  </g>
  <g transform="translate(163,64)">
    <ellipse rx="8" ry="13" fill="#F9B8C5" opacity="0.78"/>
    <ellipse rx="8" ry="13" fill="#F9B8C5" opacity="0.78" transform="rotate(72)"/>
    <ellipse rx="8" ry="13" fill="#F9B8C5" opacity="0.78" transform="rotate(144)"/>
    <ellipse rx="8" ry="13" fill="#F9B8C5" opacity="0.78" transform="rotate(216)"/>
    <ellipse rx="8" ry="13" fill="#F9B8C5" opacity="0.78" transform="rotate(288)"/>
    <circle r="5" fill="#FCDDE6" opacity="0.88"/>
    <circle r="2.5" fill="#E89BAB" opacity="0.78"/>
  </g>
  <g transform="translate(126,108)">
    <ellipse rx="6" ry="11" fill="#F9B8C5" opacity="0.7" transform="rotate(-30)"/>
    <ellipse rx="6" ry="11" fill="#F9B8C5" opacity="0.7" transform="rotate(30)"/>
    <ellipse rx="6" ry="11" fill="#F9B8C5" opacity="0.7"/>
    <circle r="4" fill="#FCDDE6" opacity="0.82"/>
  </g>
  <g transform="translate(28,122)">
    <ellipse rx="7" ry="12" fill="#F9B8C5" opacity="0.68"/>
    <ellipse rx="7" ry="12" fill="#F9B8C5" opacity="0.68" transform="rotate(72)"/>
    <ellipse rx="7" ry="12" fill="#F9B8C5" opacity="0.68" transform="rotate(144)"/>
    <ellipse rx="7" ry="12" fill="#F9B8C5" opacity="0.68" transform="rotate(216)"/>
    <ellipse rx="7" ry="12" fill="#F9B8C5" opacity="0.68" transform="rotate(288)"/>
    <circle r="4.5" fill="#FCDDE6" opacity="0.85"/>
  </g>
  <ellipse cx="180" cy="102" rx="5" ry="9" fill="#F9B8C5" opacity="0.52" transform="rotate(22 180 102)"/>
  <ellipse cx="220" cy="76" rx="4.5" ry="8" fill="#F9B8C5" opacity="0.46" transform="rotate(-14 220 76)"/>
  <ellipse cx="108" cy="84" rx="4" ry="7" fill="#F9B8C5" opacity="0.42" transform="rotate(38 108 84)"/>
  <ellipse cx="245" cy="52" rx="3.5" ry="6" fill="#F9B8C5" opacity="0.38" transform="rotate(8 245 52)"/>
</svg>`

// Botanical Forest — tropical leaf cluster
const SVG_BOTANICAL_LEAVES = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" fill="none">
  <path d="M30 270 Q90 160 260 18" stroke="#2D5016" stroke-width="1.8" fill="none" opacity="0.4"/>
  <path d="M30 270 Q90 165 260 18 Q195 88 138 162 Q80 232 30 270 Z" fill="#3D6B21" opacity="0.82"/>
  <path d="M30 270 C80 178 165 96 260 18" stroke="#2D5016" stroke-width="1.6" fill="none" stroke-linecap="round"/>
  <path d="M76 208 Q102 186 135 178" stroke="#2D5016" stroke-width="0.9" fill="none" opacity="0.5"/>
  <path d="M112 168 Q140 150 172 144" stroke="#2D5016" stroke-width="0.9" fill="none" opacity="0.5"/>
  <path d="M152 124 Q178 110 210 104" stroke="#2D5016" stroke-width="0.9" fill="none" opacity="0.5"/>
  <path d="M195 82 Q218 70 246 66" stroke="#2D5016" stroke-width="0.9" fill="none" opacity="0.5"/>
  <path d="M12 222 Q65 138 215 38" stroke="#4A7C2C" stroke-width="1.3" fill="none" opacity="0.3"/>
  <path d="M12 222 Q55 145 215 38 Q162 95 108 148 Q55 196 12 222 Z" fill="#5A8F38" opacity="0.56"/>
  <path d="M12 222 C58 150 135 90 215 38" stroke="#3D6B21" stroke-width="1.2" fill="none" stroke-linecap="round"/>
  <path d="M24 178 Q78 112 192 48" stroke="#6B9E44" stroke-width="1" fill="none" opacity="0.25"/>
  <path d="M24 178 Q80 118 192 48 Q150 96 100 140 Q56 174 24 178 Z" fill="#6B9E44" opacity="0.38"/>
  <circle cx="240" cy="30" r="8.5" fill="#C26B47" opacity="0.78"/>
  <circle cx="254" cy="20" r="6" fill="#C26B47" opacity="0.64"/>
  <circle cx="226" cy="22" r="5" fill="#C26B47" opacity="0.58"/>
  <circle cx="262" cy="38" r="4" fill="#C26B47" opacity="0.5"/>
  <ellipse cx="270" cy="14" rx="13" ry="5" fill="#3D6B21" opacity="0.62" transform="rotate(-32 270 14)"/>
  <ellipse cx="276" cy="36" rx="11" ry="4.5" fill="#3D6B21" opacity="0.52" transform="rotate(18 276 36)"/>
  <ellipse cx="255" cy="8" rx="9" ry="4" fill="#4A7C2C" opacity="0.5" transform="rotate(-15 255 8)"/>
</svg>`

// ── Theme Registry ────────────────────────────────────────────────────────────

export const THEME_REGISTRY: ThemeDefinition[] = [

  // ── Wedding 1: Garden Romance ─────────────────────────────────────────────
  {
    id: 'theme_wedding_garden_romance',
    name: 'Garden Romance',
    tagline: 'Rose botanicals & sage green — outdoor garden ceremony',
    category: 'wedding',
    tags: ['romantic', 'floral', 'botanical', 'garden', 'sage', 'rose'],
    previewGradient: 'linear-gradient(135deg, #FAF6EF 0%, #A8C4A8 40%, #C87878 100%)',
    colorScheme: {
      background:      '#FAF6EF',
      surface:         '#FFFFFF',
      primary:         '#2C4033',
      secondary:       '#5C7A5C',
      accent:          '#C87878',
      accentSecondary: '#8FA88F',
      border:          'rgba(44,64,51,0.12)',
      overlay:         'rgba(44,64,51,0.38)',
    },
    fontHeading: 'Cormorant Garamond',
    fontBody:    'Lato',
    borderRadius: 'none',
    animationId:  'rose-petals',
    entranceType: 'envelope',
    envelope: { paperColor: '#FAF6EF', sealColor: '#C87878', sealType: 'rose' },
    sectionDecorations: [
      {
        id: 'gr-branch-tr',
        svgContent: SVG_GARDEN_BRANCH,
        position: 'top-right',
        width: 'clamp(180px, 38vw, 420px)',
        opacity: 0.92,
        transform: 'scaleX(-1)',
        zIndex: 5,
        roles: ['any'],
      },
      {
        id: 'gr-branch-bl',
        svgContent: SVG_GARDEN_BRANCH,
        position: 'bottom-left',
        width: 'clamp(130px, 26vw, 300px)',
        opacity: 0.68,
        transform: 'scale(-1,-1)',
        zIndex: 4,
        hideOnMobile: true,
        roles: ['any'],
      },
      {
        id: 'gr-branch-tl-first',
        svgContent: SVG_GARDEN_BRANCH,
        position: 'top-left',
        width: 'clamp(120px, 24vw, 280px)',
        opacity: 0.55,
        zIndex: 3,
        hideOnMobile: true,
        roles: ['first'],
      },
    ],
    cssVars: {
      '--font-heading':    "'Cormorant Garamond', Georgia, serif",
      '--font-body':       "'Lato', system-ui, sans-serif",
      '--color-bg':        '#FAF6EF',
      '--color-text':      '#2C4033',
      '--color-primary':   '#2C4033',
      '--color-secondary': '#5C7A5C',
      '--color-accent':    '#C87878',
      '--color-surface':   '#FFFFFF',
      '--border-radius':   '0px',
    },
  },

  // ── Wedding 2: Midnight Luxe ──────────────────────────────────────────────
  {
    id: 'theme_wedding_midnight_luxe',
    name: 'Midnight Luxe',
    tagline: 'Deep navy & gold — black-tie ballroom elegance',
    category: 'wedding',
    tags: ['luxury', 'formal', 'gold', 'navy', 'dramatic', 'black-tie'],
    previewGradient: 'linear-gradient(135deg, #0D1B2A 0%, #1A2E45 50%, #C8A96E 100%)',
    colorScheme: {
      background:      '#0D1B2A',
      surface:         '#132438',
      primary:         '#F5E6C8',
      secondary:       '#C8A96E',
      accent:          '#C8A96E',
      accentSecondary: '#E8D5A0',
      border:          'rgba(200,169,110,0.2)',
      overlay:         'rgba(13,27,42,0.55)',
    },
    fontHeading: 'Playfair Display',
    fontBody:    'Montserrat',
    borderRadius: 'none',
    animationId:  'golden-rings',
    entranceType: 'envelope',
    envelope: { paperColor: '#132438', sealColor: '#C8A96E', sealType: 'gold' },
    sectionDecorations: [
      {
        id: 'ml-ornament-tr',
        svgContent: SVG_MIDNIGHT_ORNAMENT,
        position: 'top-right',
        width: 'clamp(140px, 28vw, 320px)',
        opacity: 0.85,
        transform: 'scaleX(-1)',
        zIndex: 5,
        roles: ['any'],
      },
      {
        id: 'ml-ornament-bl',
        svgContent: SVG_MIDNIGHT_ORNAMENT,
        position: 'bottom-left',
        width: 'clamp(100px, 20vw, 240px)',
        opacity: 0.65,
        transform: 'scale(-1,-1)',
        zIndex: 4,
        hideOnMobile: true,
        roles: ['any'],
      },
      {
        id: 'ml-ornament-tl',
        svgContent: SVG_MIDNIGHT_ORNAMENT,
        position: 'top-left',
        width: 'clamp(90px, 18vw, 210px)',
        opacity: 0.5,
        zIndex: 3,
        hideOnMobile: true,
        roles: ['first'],
      },
    ],
    cssVars: {
      '--font-heading':    "'Playfair Display', Georgia, serif",
      '--font-body':       "'Montserrat', system-ui, sans-serif",
      '--color-bg':        '#0D1B2A',
      '--color-text':      '#F5E6C8',
      '--color-primary':   '#F5E6C8',
      '--color-secondary': '#C8A96E',
      '--color-accent':    '#C8A96E',
      '--color-surface':   '#132438',
      '--border-radius':   '0px',
    },
  },

  // ── Wedding 3: Pure Ivory ─────────────────────────────────────────────────
  {
    id: 'theme_wedding_pure_ivory',
    name: 'Pure Ivory',
    tagline: 'Architectural lines & ivory white — modern minimalist',
    category: 'wedding',
    tags: ['minimal', 'modern', 'clean', 'ivory', 'white', 'editorial'],
    previewGradient: 'linear-gradient(135deg, #FDFAF5 0%, #F0EDE6 50%, #1C1C1C 100%)',
    colorScheme: {
      background:  '#FDFAF5',
      surface:     '#FFFFFF',
      primary:     '#1C1C1C',
      secondary:   '#5A5A5A',
      accent:      '#1C1C1C',
      border:      'rgba(28,28,28,0.1)',
      overlay:     'rgba(28,28,28,0.32)',
    },
    fontHeading: 'Cinzel',
    fontBody:    'Josefin Sans',
    borderRadius: 'none',
    animationId:  'minimalist-lace',
    entranceType: 'loading-screen',
    envelope: { paperColor: '#FDFAF5', sealColor: '#1C1C1C', sealType: 'minimal' },
    sectionDecorations: [
      {
        id: 'pi-frame-tr',
        svgContent: SVG_IVORY_FRAME,
        position: 'top-right',
        width: 'clamp(110px, 22vw, 260px)',
        opacity: 0.55,
        transform: 'scaleX(-1)',
        zIndex: 5,
        roles: ['any'],
      },
      {
        id: 'pi-frame-bl',
        svgContent: SVG_IVORY_FRAME,
        position: 'bottom-left',
        width: 'clamp(80px, 16vw, 190px)',
        opacity: 0.38,
        transform: 'scale(-1,-1)',
        zIndex: 4,
        hideOnMobile: true,
        roles: ['any'],
      },
      {
        id: 'pi-frame-tl',
        svgContent: SVG_IVORY_FRAME,
        position: 'top-left',
        width: 'clamp(70px, 14vw, 170px)',
        opacity: 0.3,
        zIndex: 3,
        hideOnMobile: true,
        roles: ['first'],
      },
    ],
    cssVars: {
      '--font-heading':    "'Cinzel', Georgia, serif",
      '--font-body':       "'Josefin Sans', system-ui, sans-serif",
      '--color-bg':        '#FDFAF5',
      '--color-text':      '#1C1C1C',
      '--color-primary':   '#1C1C1C',
      '--color-secondary': '#5A5A5A',
      '--color-accent':    '#1C1C1C',
      '--color-surface':   '#FFFFFF',
      '--border-radius':   '0px',
    },
  },

  // ── Wedding 4: Blush Petal ────────────────────────────────────────────────
  {
    id: 'theme_wedding_blush_petal',
    name: 'Blush Petal',
    tagline: 'Cherry blossoms & deep rose — fairy-tale romance',
    category: 'wedding',
    tags: ['romantic', 'pink', 'blush', 'cherry blossom', 'feminine', 'floral'],
    previewGradient: 'linear-gradient(135deg, #FFF6F8 0%, #F9B8C5 50%, #C4687A 100%)',
    colorScheme: {
      background:      '#FFF6F8',
      surface:         '#FFFFFF',
      primary:         '#6B3040',
      secondary:       '#C4687A',
      accent:          '#C4687A',
      accentSecondary: '#F9B8C5',
      border:          'rgba(107,48,64,0.12)',
      overlay:         'rgba(107,48,64,0.38)',
    },
    fontHeading: 'Great Vibes',
    fontBody:    'Raleway',
    borderRadius: 'lg',
    animationId:  'cherry-blossom',
    entranceType: 'envelope',
    envelope: { paperColor: '#FFF6F8', sealColor: '#C4687A', sealType: 'rose' },
    sectionDecorations: [
      {
        id: 'bp-blossom-tr',
        svgContent: SVG_BLOSSOM_BRANCH,
        position: 'top-right',
        width: 'clamp(190px, 40vw, 440px)',
        opacity: 0.9,
        transform: 'scaleX(-1)',
        zIndex: 5,
        roles: ['any'],
      },
      {
        id: 'bp-blossom-bl',
        svgContent: SVG_BLOSSOM_BRANCH,
        position: 'bottom-left',
        width: 'clamp(140px, 28vw, 320px)',
        opacity: 0.7,
        transform: 'scale(-1,-1)',
        zIndex: 4,
        hideOnMobile: true,
        roles: ['any'],
      },
      {
        id: 'bp-blossom-tl-first',
        svgContent: SVG_BLOSSOM_BRANCH,
        position: 'top-left',
        width: 'clamp(110px, 22vw, 250px)',
        opacity: 0.55,
        zIndex: 3,
        hideOnMobile: true,
        roles: ['first'],
      },
    ],
    cssVars: {
      '--font-heading':    "'Great Vibes', cursive",
      '--font-body':       "'Raleway', system-ui, sans-serif",
      '--color-bg':        '#FFF6F8',
      '--color-text':      '#6B3040',
      '--color-primary':   '#6B3040',
      '--color-secondary': '#C4687A',
      '--color-accent':    '#C4687A',
      '--color-surface':   '#FFFFFF',
      '--border-radius':   '12px',
    },
  },

  // ── Wedding 5: Botanical Forest ───────────────────────────────────────────
  {
    id: 'theme_wedding_botanical',
    name: 'Botanical Forest',
    tagline: 'Tropical leaves & terracotta — earthy outdoor ceremony',
    category: 'wedding',
    tags: ['natural', 'rustic', 'green', 'earthy', 'botanical', 'outdoor'],
    previewGradient: 'linear-gradient(135deg, #FBF8F3 0%, #3D6B21 50%, #C26B47 100%)',
    colorScheme: {
      background:      '#FBF8F3',
      surface:         '#FFFFFF',
      primary:         '#1A3308',
      secondary:       '#3D6B21',
      accent:          '#C26B47',
      accentSecondary: '#A0A87A',
      border:          'rgba(26,51,8,0.12)',
      overlay:         'rgba(26,51,8,0.4)',
    },
    fontHeading: 'EB Garamond',
    fontBody:    'Open Sans',
    borderRadius: 'sm',
    animationId:  'butterfly-garden',
    entranceType: 'envelope',
    envelope: { paperColor: '#FBF8F3', sealColor: '#C26B47', sealType: 'wax-detailed' },
    sectionDecorations: [
      {
        id: 'bf-leaves-tr',
        svgContent: SVG_BOTANICAL_LEAVES,
        position: 'top-right',
        width: 'clamp(200px, 42vw, 460px)',
        opacity: 0.88,
        transform: 'scaleX(-1)',
        zIndex: 5,
        roles: ['any'],
      },
      {
        id: 'bf-leaves-bl',
        svgContent: SVG_BOTANICAL_LEAVES,
        position: 'bottom-left',
        width: 'clamp(150px, 30vw, 340px)',
        opacity: 0.68,
        transform: 'scale(-1,-1)',
        zIndex: 4,
        hideOnMobile: true,
        roles: ['any'],
      },
      {
        id: 'bf-leaves-tl-first',
        svgContent: SVG_BOTANICAL_LEAVES,
        position: 'top-left',
        width: 'clamp(120px, 24vw, 280px)',
        opacity: 0.52,
        zIndex: 3,
        hideOnMobile: true,
        roles: ['first'],
      },
    ],
    cssVars: {
      '--font-heading':    "'EB Garamond', Georgia, serif",
      '--font-body':       "'Open Sans', system-ui, sans-serif",
      '--color-bg':        '#FBF8F3',
      '--color-text':      '#1A3308',
      '--color-primary':   '#1A3308',
      '--color-secondary': '#3D6B21',
      '--color-accent':    '#C26B47',
      '--color-surface':   '#FFFFFF',
      '--border-radius':   '4px',
    },
  },

  // ── Birthday: Confetti Pop ────────────────────────────────────────────────
  {
    id: 'theme_birthday_confetti_pop',
    name: 'Confetti Pop',
    tagline: 'Bold colours & confetti bursts — vibrant celebration',
    category: 'birthday',
    tags: ['fun', 'colourful', 'confetti', 'playful', 'vibrant'],
    previewGradient: 'linear-gradient(135deg, #FF6B9D 0%, #FFCC02 50%, #4ECDC4 100%)',
    colorScheme: {
      background: '#FFFDF0',
      surface:    '#FFFFFF',
      primary:    '#FF3366',
      secondary:  '#FF6B9D',
      accent:     '#FFCC02',
      border:     'rgba(255,51,102,0.15)',
      overlay:    'rgba(255,51,102,0.35)',
    },
    fontHeading: 'Pacifico',
    fontBody:    'Nunito',
    borderRadius: '2xl',
    animationId:  'cherry-blossom',
    entranceType: 'loading-screen',
    envelope: { paperColor: '#FFFDF0', sealColor: '#FF3366', sealType: 'rose' },
    sectionDecorations: [],
    cssVars: {
      '--color-bg':     '#FFFDF0',
      '--color-text':   '#1A1A2E',
      '--color-accent': '#FF3366',
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
      background: '#0F1620',
      surface:    '#1E2D45',
      primary:    '#F1F5F9',
      secondary:  '#94A3B8',
      accent:     '#3B82F6',
      border:     'rgba(59,130,246,0.2)',
      overlay:    'rgba(15,22,32,0.6)',
    },
    fontHeading: 'Montserrat',
    fontBody:    'Inter',
    borderRadius: 'md',
    animationId:  'minimalist-lace',
    entranceType: 'loading-screen',
    envelope: { paperColor: '#1E2D45', sealColor: '#3B82F6', sealType: 'minimal' },
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

export function getThemeIdFromTokens(tokens?: Record<string, string> | string | null): string {
  if (!tokens) return ''
  const parsed = typeof tokens === 'string'
    ? (() => { try { return JSON.parse(tokens) } catch { return {} } })()
    : tokens
  return (parsed as Record<string, string>)['__themeId'] ?? ''
}

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

export function getThemesByCategory(): Record<string, ThemeDefinition[]> {
  return THEME_REGISTRY.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = []
    acc[t.category].push(t)
    return acc
  }, {} as Record<string, ThemeDefinition[]>)
}
