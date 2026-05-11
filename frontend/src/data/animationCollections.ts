export type ScrollAnim = 'fade-up' | 'fade-scale' | 'slide-left' | 'bloom' | 'curtain'
export type ParticleType = 'butterflies' | 'petals' | 'sparkles' | 'blossoms' | 'none'

export interface AnimationCollection {
  id: string
  name: string
  tagline: string
  emoji: string
  category: 'wedding' | 'corporate' | 'birthday' | 'universal'
  previewColors: string[]     // [bg, accent, text] for card preview
  loadingDuration: number     // total ms before loading screen dismisses
  scrollAnim: ScrollAnim
  particleType: ParticleType
  particleCount: number
  loadingBg: string
  loadingAccent: string
  loadingText: string
  recommendedFor: string[]    // template IDs this suits best
}

export const ANIMATION_COLLECTIONS: AnimationCollection[] = [
  {
    id: 'butterfly-garden',
    name: 'Butterfly Garden',
    tagline: 'Soft envelope reveal with a butterfly emergence',
    emoji: '🦋',
    category: 'wedding',
    previewColors: ['#F7F0E8', '#C8956C', '#3A2A1A'],
    loadingDuration: 8500,
    scrollAnim: 'fade-up',
    particleType: 'butterflies',
    particleCount: 10,
    loadingBg: '#F7F0E8',
    loadingAccent: '#C8956C',
    loadingText: '#3A2A1A',
    recommendedFor: ['wedding', 'gala'],
  },
  {
    id: 'rose-petals',
    name: 'Rose Petals',
    tagline: 'A cascade of petals parts to reveal your invitation',
    emoji: '🌹',
    category: 'wedding',
    previewColors: ['#FEF0F3', '#C75B7A', '#3D1A26'],
    loadingDuration: 8000,
    scrollAnim: 'bloom',
    particleType: 'petals',
    particleCount: 22,
    loadingBg: '#FEF0F3',
    loadingAccent: '#C75B7A',
    loadingText: '#3D1A26',
    recommendedFor: ['wedding', 'birthday'],
  },
  {
    id: 'golden-rings',
    name: 'Golden Rings',
    tagline: 'Intertwining rings with a cascade of gold sparkles',
    emoji: '💍',
    category: 'wedding',
    previewColors: ['#FEFDF8', '#D4AF37', '#2C2410'],
    loadingDuration: 8500,
    scrollAnim: 'curtain',
    particleType: 'sparkles',
    particleCount: 30,
    loadingBg: '#FEFDF8',
    loadingAccent: '#D4AF37',
    loadingText: '#2C2410',
    recommendedFor: ['wedding', 'gala'],
  },
  {
    id: 'cherry-blossom',
    name: 'Cherry Blossom',
    tagline: 'Sakura branch blooms then petals float away',
    emoji: '🌸',
    category: 'wedding',
    previewColors: ['#FFF9FA', '#FFB7C5', '#4A2030'],
    loadingDuration: 8500,
    scrollAnim: 'fade-scale',
    particleType: 'blossoms',
    particleCount: 18,
    loadingBg: '#FFF9FA',
    loadingAccent: '#FFB7C5',
    loadingText: '#4A2030',
    recommendedFor: ['wedding', 'birthday'],
  },
  {
    id: 'minimalist-lace',
    name: 'Minimalist Lace',
    tagline: 'Delicate line traces with a clean elegant reveal',
    emoji: '✨',
    category: 'universal',
    previewColors: ['#FFFFFF', '#9CA3AF', '#111827'],
    loadingDuration: 5500,
    scrollAnim: 'slide-left',
    particleType: 'none',
    particleCount: 0,
    loadingBg: '#FFFFFF',
    loadingAccent: '#9CA3AF',
    loadingText: '#111827',
    recommendedFor: ['minimal', 'corporate'],
  },
]

export const ANIMATION_COLLECTIONS_MAP = Object.fromEntries(
  ANIMATION_COLLECTIONS.map((c) => [c.id, c]),
)

export function getAnimationCollection(id?: string): AnimationCollection {
  return ANIMATION_COLLECTIONS_MAP[id ?? ''] ?? ANIMATION_COLLECTIONS[4] // default minimalist
}

/** Read the __animation key from a theme tokens object/string */
export function getAnimationIdFromTokens(tokens?: Record<string, string> | string | null): string {
  if (!tokens) return ''
  const parsed = typeof tokens === 'string' ? (() => { try { return JSON.parse(tokens) } catch { return {} } })() : tokens
  return (parsed as Record<string, string>)['__animation'] ?? ''
}

/** Return updated tokens string with __animation key set */
export function setAnimationInTokens(tokens: Record<string, string> | string | undefined, id: string): string {
  const parsed = tokens
    ? (typeof tokens === 'string' ? (() => { try { return JSON.parse(tokens) } catch { return {} } })() : { ...tokens })
    : {}
  return JSON.stringify({ ...parsed, __animation: id })
}
