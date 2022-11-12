import { disabledTimeListsProps } from '../../time-picker'
import { DEFAULT_FORMATS_TIME } from '@follow-ui/constants'
import { ModelValueType } from '@follow-ui/tokens'
import { buildProps, definePropType } from '@follow-ui/utils'
import { ExtractPropTypes } from '@vue/runtime-core'
import { useSizeProp } from '@follow-ui/hooks'

type Placeholder = {
  default: string
  start: string
  end: string
}

export const pickerProps = buildProps({
  isRange: Boolean,
  mode: String,
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
  disabled: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: [Object as Partial<Placeholder>, String],
  },
  clearable: {
    type: Boolean,
    default: true,
  },
  size: useSizeProp,
  readonly: {
    type: Boolean,
    default: false,
  },
  ...disabledTimeListsProps,
})

export type PickerProps = ExtractPropTypes<typeof pickerProps>
