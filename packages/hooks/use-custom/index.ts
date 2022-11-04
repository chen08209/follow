import { TinyColor } from '@ctrl/tinycolor'

export const useCustom = (color: string): string[] => {
  const tinyColor = new TinyColor(color)
  const colorMap: string[] = []
  for (let i = 0; i < 10; i++) {
    colorMap.push(tinyColor.tint(i * 10).toString())
  }
  return colorMap
}
