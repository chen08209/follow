import { buildProps, definePropType } from '@follow-ui/utils'
import { ExtractPropTypes } from '@vue/runtime-core'
import { Dayjs } from 'dayjs'

export const timePanelProps = buildProps({
  parsedValue: {
    type: definePropType<Dayjs>(Object),
  },
  showSeconds: Boolean,
  role: {
    type: String,
    required: true,
  },
} as const)

export type TimePanelProps = ExtractPropTypes<typeof timePanelProps>
