import { UPDATE_MODEL_EVENT } from '@follow-ui/constants'
import { useSizeProp } from '@follow-ui/hooks'
import { buildProps, definePropType, isArray } from '@follow-ui/utils'

import type { ExtractPropTypes } from 'vue'
import type checkboxGroup from '../checkbox-group.vue'
import type { CheckboxValueType } from './checkbox'

export const checkboxGroupProps = buildProps({
  modelValue: {
    type: definePropType<Array<string | number>>(Array),
    default: () => [],
  },
  disabled: Boolean,
  min: Number,
  max: Number,
  size: useSizeProp,
  label: String,
  fill: String,
  textColor: String,
  tag: {
    type: String,
    default: 'div',
  },
  validateEvent: {
    type: Boolean,
    default: true,
  },
  color: String,
} as const)

export const checkboxGroupEmits = {
  [UPDATE_MODEL_EVENT]: (val: CheckboxValueType[]) => isArray(val),
  change: (val: CheckboxValueType[]) => isArray(val),
}

export type CheckboxGroupProps = ExtractPropTypes<typeof checkboxGroupProps>
export type CheckboxGroupEmits = typeof checkboxGroupEmits
export type CheckboxGroupInstance = InstanceType<typeof checkboxGroup>
