const FONT_SPECS: Record<string, string> = {
  'Inter':               'Inter:wght@300;400;500;600;700',
  'Playfair Display':    'Playfair+Display:ital,wght@0,400;0,600;0,700;1,400',
  'Cormorant Garamond':  'Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400',
  'Lato':                'Lato:wght@300;400;700',
  'Poppins':             'Poppins:wght@300;400;500;600;700',
  'Merriweather':        'Merriweather:ital,wght@0,300;0,400;0,700;1,400',
  'Montserrat':          'Montserrat:wght@400;500;600;700',
  'Roboto':              'Roboto:wght@300;400;500;700',
  'Open Sans':           'Open+Sans:wght@300;400;600;700',
}

export function ensureGoogleFont(fontFamilyValue: string): void {
  if (!fontFamilyValue) return
  // Extract the primary font name from CSS value like "'Playfair Display', serif"
  const match = fontFamilyValue.match(/['"]?([A-Za-z][^,'"]+?)['"]?\s*(?:,|$)/)
  if (!match) return
  const name = match[1].trim()
  const spec = FONT_SPECS[name]
  if (!spec) return
  const id = `gf-${name.replace(/\s+/g, '-').toLowerCase()}`
  if (document.getElementById(id)) return
  const link = document.createElement('link')
  link.id = id
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${spec}&display=swap`
  document.head.appendChild(link)
}

export function ensureGoogleFontsForSections(sections: Array<{ props: Record<string, unknown> }>): void {
  for (const s of sections) {
    if (s.props.fontFamily) ensureGoogleFont(s.props.fontFamily as string)
  }
}
