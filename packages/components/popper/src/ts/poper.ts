import { buildProps } from '@follow-ui/utils'
import type { ExtractPropTypes } from 'vue'

const effects = ['follow-ui', 'dark'] as const
const triggers = ['click', 'contextmenu', 'hover', 'focus'] as const

export const Effect = {
  LIGHT: 'follow-ui',
  DARK: 'dark',
}

export const roleTypes = [
  'dialog',
  'grid',
  'listbox',
  'menu',
  'tooltip',
  'tree',
] as const

export type PopperEffect = typeof effects[number]
export type PopperTrigger = typeof triggers[number]

export const popperProps = buildProps({
  role: {
    type: String,
    values: roleTypes,
    default: 'tooltip',
  },
} as const)

export type PopperProps = ExtractPropTypes<typeof popperProps>
