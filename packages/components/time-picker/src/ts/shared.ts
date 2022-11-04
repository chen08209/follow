import { buildProps, definePropType } from '@follow-ui/utils'

import type {
  GetDisabledHours,
  GetDisabledMinutes,
  GetDisabledSeconds,
} from './picker'
import type { ExtractPropTypes } from 'vue'

export const disabledTimeListsProps = buildProps({
  disabledHours: {
    type: definePropType<GetDisabledHours>(Function),
  },
  disabledMinutes: {
    type: definePropType<GetDisabledMinutes>(Function),
  },
  disabledSeconds: {
    type: definePropType<GetDisabledSeconds>(Function),
  },
} as const)

export type DisabledTimeListsProps = ExtractPropTypes<
  typeof disabledTimeListsProps
>

export const timePanelSharedProps = buildProps({
  visible: Boolean,
  actualVisible: {
    type: Boolean,
    default: undefined,
  },
  format: {
    type: String,
    default: '',
  },
} as const)

export type TimePanelSharedProps = ExtractPropTypes<typeof timePanelSharedProps>
