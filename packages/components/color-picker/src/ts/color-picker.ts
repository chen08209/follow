import { isNil } from 'lodash-unified'
import { buildProps, definePropType, isString } from '@follow-ui/utils'
import { useSizeProp } from '@follow-ui/hooks'
import { CHANGE_EVENT, UPDATE_MODEL_EVENT } from '@follow-ui/constants'

import type { ExtractPropTypes } from 'vue'
import type ColorPicker from '../color-picker.vue'

export const colorPickerProps = buildProps({
  modelValue: String,
  id: String,
  showAlpha: Boolean,
  showLabel: Boolean,
  colorFormat: String,
  disabled: Boolean,
  size: useSizeProp,
  popperClass: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: undefined,
  },
  tabindex: {
    type: [String, Number],
    default: 0,
  },
  predefine: {
    type: definePropType<string[]>(Array),
  },
  validateEvent: {
    type: Boolean,
    default: true,
  },
} as const)

export const colorPickerEmits = {
  [UPDATE_MODEL_EVENT]: (val: string | null) => isString(val) || isNil(val),
  [CHANGE_EVENT]: (val: string | null) => isString(val) || isNil(val),
  activeChange: (val: string | null) => isString(val) || isNil(val),
}

export type ColorPickerProps = ExtractPropTypes<typeof colorPickerProps>
export type ColorPickerEmits = typeof colorPickerEmits
export type ColorPickerInstance = InstanceType<typeof ColorPicker>
