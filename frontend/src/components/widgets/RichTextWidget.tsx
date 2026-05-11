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
  return (
    <div className={PADDING[padding] || PADDING.medium} style={{ fontFamily: 'var(--font-heading, inherit)', backgroundColor: bgColor, color: textColor }}>
      <div
        className="max-w-3xl mx-auto prose prose-lg"
        style={{ textAlign: align, fontFamily: 'var(--font-body, inherit)', color: textColor }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  )
}
