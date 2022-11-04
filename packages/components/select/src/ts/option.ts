import { buildProps } from '@follow-ui/utils'
import { ExtractPropTypes } from '@vue/runtime-core'

export const optionProps = buildProps({
  value: {
    required: true,
    type: [String, Number, Boolean, Object],
  },
  label: {
    type: [String, Number],
  },
  //是否是后续创建的
  created: Boolean,
  disabled: {
    type: Boolean,
    default: false,
  },
} as const)

export type OptionProps = ExtractPropTypes<typeof optionProps>
