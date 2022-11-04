import { buildProps } from '@follow-ui/utils'
import { createModelToggleComposable } from '@follow-ui/hooks'
import type tooltip from '../tooltip.vue'
import type { ExtractPropTypes } from 'vue'

const { useModelToggleProps, useModelToggle, useModelToggleEmits } =
  createModelToggleComposable('visible' as const)

export {
  useModelToggleProps as useModelTooltipToggleProps,
  useModelToggle as useModelTooltipToggle,
  useModelToggleEmits as useModelTooltipToggleEmits,
}

export const tooltipProps = buildProps({
  openDelay: {
    type: Number,
  },
  visibleArrow: {
    type: Boolean,
    default: undefined,
  },
  hideAfter: {
    type: Number,
    default: 200,
  },
  showArrow: {
    type: Boolean,
    default: true,
  },
})

export type FlTooltipProps = ExtractPropTypes<typeof tooltipProps>

export type TooltipInstance = InstanceType<typeof tooltip>
