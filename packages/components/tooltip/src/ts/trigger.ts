import { buildProps, definePropType } from '@follow-ui/utils'
import { EVENT_CODE } from '@follow-ui/constants'
import { popperTriggerProps } from '../../../popper'
import type { Arrayable } from '@follow-ui/utils'
import type { ExtractPropTypes } from 'vue'

export type TooltipTriggerType = 'hover' | 'focus' | 'click' | 'contextmenu'

export const tooltipTriggerProps = buildProps({
  ...popperTriggerProps,
  disabled: Boolean,
  trigger: {
    type: definePropType<Arrayable<TooltipTriggerType>>([String, Array]),
    default: 'hover',
  },
  triggerKeys: {
    type: definePropType<string[]>(Array),
    default: () => [EVENT_CODE.enter, EVENT_CODE.space],
  },
} as const)

export type FlTooltipTriggerProps = ExtractPropTypes<typeof tooltipTriggerProps>
