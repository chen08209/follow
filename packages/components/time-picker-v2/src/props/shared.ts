import { buildProps, definePropType } from '@follow-ui/utils'
import {
  GetDisabledHours,
  GetDisabledMinutes,
  GetDisabledSeconds,
} from '@follow-ui/tokens'

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
