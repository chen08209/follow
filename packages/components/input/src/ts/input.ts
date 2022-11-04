import { isString } from '@vue/shared'
import { useSizeProp } from '@follow-ui/hooks'
import {
  buildProps,
  definePropType,
  iconPropType,
  mutable,
} from '@follow-ui/utils'
import { UPDATE_MODEL_EVENT } from '@follow-ui/constants/event'

import type { ExtractPropTypes, StyleValue } from 'vue'
export type InputAutoSize = { minRows?: number; maxRows?: number } | boolean

export const inputProps = buildProps({
  id: {
    type: String,
    default: undefined,
  },
  size: useSizeProp,
  disabled: Boolean,
  modelValue: {
    type: definePropType<string | number | null | undefined>([
      String,
      Number,
      Object,
    ]),
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  /**
   * textArea 文本域resize属性
   * 'none': 不能调整元素的尺寸
   * 'both': 可调整元素的高度和宽度
   * 'horizontal': 可调整元素的宽度
   * 'vertical': 可调整元素的高度
   */
  resize: {
    type: String,
    values: ['none', 'both', 'horizontal', 'vertical'],
  },
  autosize: {
    type: definePropType<InputAutoSize>([Boolean, Object]),
    default: false,
  },
  autocomplete: {
    type: String,
    default: 'off',
  },
  formatter: {
    type: Function,
  },
  parser: {
    type: Function,
  },
  placeholder: {
    type: String,
  },
  form: {
    type: String,
    default: '',
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  clearable: {
    type: Boolean,
    default: false,
  },
  showPassword: {
    type: Boolean,
    default: false,
  },
  showWordLimit: {
    type: Boolean,
    default: false,
  },
  suffixIcon: {
    type: iconPropType,
  },
  prefixIcon: {
    type: iconPropType,
    default: '',
  },
  containerRole: {
    type: String,
    default: undefined,
  },
  label: {
    type: String,
    default: undefined,
  },
  tabindex: {
    type: [String, Number],
    default: 0,
  },
  validateEvent: {
    type: Boolean,
    default: true,
  },
  inputStyle: {
    type: definePropType<StyleValue>([Object, Array, String]),
    default: () => mutable({} as const),
  },
} as const)

export const inputEmits = {
  [UPDATE_MODEL_EVENT]: (value: string) => isString(value),
  input: (value: string) => isString(value),
  change: (value: string) => isString(value),
  focus: (evt: FocusEvent) => evt instanceof FocusEvent,
  blur: (evt: FocusEvent) => evt instanceof FocusEvent,
  clear: () => true,
  mouseleave: (evt: MouseEvent) => evt instanceof MouseEvent,
  mouseenter: (evt: MouseEvent) => evt instanceof MouseEvent,
  keydown: (evt: KeyboardEvent | Event) => evt instanceof Event,
  compositionstart: (evt: CompositionEvent) => evt instanceof CompositionEvent,
  compositionupdate: (evt: CompositionEvent) => evt instanceof CompositionEvent,
  compositionend: (evt: CompositionEvent) => evt instanceof CompositionEvent,
}

export type InputProps = ExtractPropTypes<typeof inputProps>

export type InputEmits = typeof inputEmits
