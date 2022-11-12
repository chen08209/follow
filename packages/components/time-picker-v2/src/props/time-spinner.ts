import { buildProps, definePropType } from '@follow-ui/utils'
import { ExtractPropTypes } from '@vue/runtime-core'
import { Dayjs } from 'dayjs'
import { disabledTimeListsProps } from './shared'

export const timeSpinnerProps = buildProps({
  role: {
    type: String,
    required: true,
  },
  showSeconds: Boolean,
  spinnerDate: {
    type: definePropType<Dayjs>(Object),
    required: true,
  },
  amPmMode: {
    type: definePropType<'a' | 'A' | ''>(String),
    default: '',
  },
  ...disabledTimeListsProps,
} as const)

export type TimeSpinnerProps = ExtractPropTypes<typeof timeSpinnerProps>
