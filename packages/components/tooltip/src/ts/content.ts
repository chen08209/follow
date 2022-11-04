import { buildProps, definePropType } from '@follow-ui/utils'
import {
  POPPER_CONTAINER_SELECTOR,
  useDelayedToggleProps,
  useNamespace,
} from '@follow-ui/hooks'
import { popperContentProps } from '../../../popper'
import type { ExtractPropTypes } from 'vue'

const ns = useNamespace('tooltip')

export const tooltipContentProps = buildProps({
  ...useDelayedToggleProps,
  ...popperContentProps,
  appendTo: {
    type: definePropType<string | HTMLElement>([String, Object]),
    default: POPPER_CONTAINER_SELECTOR,
  },
  content: {
    type: String,
    default: '',
  },
  rawContent: {
    type: Boolean,
    default: false,
  },
  persistent: Boolean,
  ariaLabel: String,
  visible: {
    type: definePropType<boolean | null>(Boolean),
    default: null,
  },
  transition: {
    type: String,
    default: `${ns.namespace.value}-fade-in-linear`,
  },
  teleported: {
    type: Boolean,
    default: true,
  },
  disabled: {
    type: Boolean,
  },
} as const)

export type FlTooltipContentProps = ExtractPropTypes<typeof tooltipContentProps>
