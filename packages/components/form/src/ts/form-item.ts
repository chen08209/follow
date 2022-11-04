import { componentSizes } from '@follow-ui/constants'
import { buildProps, definePropType } from '@follow-ui/utils'

import type { ExtractPropTypes } from 'vue'
import type { Arrayable } from '@follow-ui/utils'
import type { FormItemRule } from '@follow-ui/tokens'

export const formItemValidateStates = [
  '',
  'error',
  'validating',
  'success',
] as const
export type FormItemValidateState = typeof formItemValidateStates[number]

export type FormItemProp = Arrayable<string>

export const formItemProps = buildProps({
  label: String,
  labelWidth: {
    type: [String, Number],
    default: '',
  },
  prop: {
    type: definePropType<FormItemProp>([String, Array]),
  },
  required: {
    type: Boolean,
    default: undefined,
  },
  rules: {
    type: definePropType<Arrayable<FormItemRule>>([Object, Array]),
  },
  error: String,
  validateStatus: {
    type: String,
    values: formItemValidateStates,
  },
  //是否关联
  for: String,
  inlineMessage: {
    type: [String, Boolean],
    default: '',
  },
  //是否展示校验错误信息
  showMessage: {
    type: Boolean,
    default: true,
  },
  size: {
    type: String,
    values: componentSizes,
  },
} as const)
export type FormItemProps = ExtractPropTypes<typeof formItemProps>
