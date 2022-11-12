import { DEFAULT_FORMATS_TIME } from '@follow-ui/constants'
import { ModelValueType } from '@follow-ui/tokens'
import { buildProps, definePropType } from '@follow-ui/utils'
import { ExtractPropTypes } from '@vue/runtime-core'

export const timePickerProps = buildProps({
  isRange: Boolean,
  valueFormat: {
    type: String,
    default: DEFAULT_FORMATS_TIME,
  },
  separator: {
    type: String,
    default: '-',
  },
  showSeconds: {
    type: Boolean,
    default: true,
  },
  modelValue: {
    type: definePropType<ModelValueType>([Date, Array, String, Number]),
    default: '',
  },
})

export type TimePickerProps = ExtractPropTypes<typeof timePickerProps>
