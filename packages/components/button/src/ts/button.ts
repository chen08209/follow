import { useSizeProp } from '@follow-ui/hooks'
import { buildProps, iconPropType } from '@follow-ui/utils'
import { Loading } from '@element-plus/icons-vue'
import type { ExtractPropTypes } from 'vue'
import type button from '../button.vue'

export const buttonNativeTypes = ['button', 'submit', 'reset'] as const

export const buttonTypes = [
  'default',
  'primary',
  'success',
  'warning',
  'info',
  'danger',
  'text',
  '',
] as const

export const buttonProps = buildProps({
  size: useSizeProp,
  disabled: Boolean,
  type: {
    type: String,
    values: buttonTypes,
    default: '',
  },
  icon: {
    type: iconPropType,
    default: '',
  },
  ripple: {
    type: Boolean,
    default: true,
  },
  nativeType: {
    type: String,
    values: buttonNativeTypes,
    default: 'button',
  },
  loading: Boolean,
  loadingIcon: {
    type: iconPropType,
    default: () => Loading,
  },
  plain: Boolean,
  text: Boolean,
  link: Boolean,
  bg: Boolean,
  autofocus: Boolean,
  round: Boolean,
  circle: Boolean,
  color: String,
  dark: Boolean,
  autoInsertSpace: {
    type: Boolean,
    default: undefined,
  },
} as const)

export const buttonEmits = {
  click: (evt: MouseEvent) => evt instanceof MouseEvent,
}

export type ButtonProps = ExtractPropTypes<typeof buttonProps>

export type ButtonEmits = typeof buttonEmits

export type ButtonInstance = InstanceType<typeof button>

export type ButtonConfigContext = {
  autoInsertSpace: boolean
}
