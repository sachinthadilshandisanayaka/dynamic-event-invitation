interface Props {
  height?: number
  bgColor?: string
}

export function SpacerWidget({ height = 40, bgColor = 'transparent' }: Props) {
  return <div style={{ height, backgroundColor: bgColor === 'transparent' ? undefined : bgColor }} />
}
