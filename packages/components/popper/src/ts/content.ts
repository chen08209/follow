import { placements } from '@popperjs/core'
import { buildProps, definePropType } from '@follow-ui/utils'

import type { ExtractPropTypes, StyleValue } from 'vue'
import type { Options, Placement } from '@popperjs/core'

type ClassObjectType = Record<string, boolean>
type ClassType = string | ClassObjectType | ClassType[]

const POSITIONING_STRATEGIES = ['fixed', 'absolute'] as const

export const popperCoreConfigProps = buildProps({
  boundariesPadding: {
    type: Number,
    default: 0,
  },
  fallbackPlacements: {
    type: definePropType<Placement[]>(Array),
    default: () => [],
  },
  gpuAcceleration: {
    type: Boolean,
    default: true,
  },
  offset: {
    type: Number,
    default: 12,
  },
  placement: {
    type: String,
    values: placements,
    default: 'bottom',
  },
  popperOptions: {
    type: definePropType<Partial<Options>>(Object),
    default: () => ({} as Partial<Options>),
  },
  strategy: {
    type: String,
    values: POSITIONING_STRATEGIES,
    default: 'absolute',
  },
} as const)

export const popperContentProps = buildProps({
  ...popperCoreConfigProps,
  id: String,
  style: { type: definePropType<StyleValue>([String, Array, Object]) },
  className: { type: definePropType<ClassType>([String, Array, Object]) },
  //外观,默认暗色模式
  effect: {
    type: String,
    default: 'dark',
  },
  visible: Boolean,
  enterable: {
    type: Boolean,
    default: true,
  },
  //是否去除padding
  pure: Boolean,
  focusOnShow: {
    type: Boolean,
    default: false,
  },
  //是否在捕获中
  trapping: {
    type: Boolean,
    default: false,
  },
  popperClass: {
    type: definePropType<ClassType>([String, Array, Object]),
  },
  popperStyle: {
    type: definePropType<StyleValue>([String, Array, Object]),
  },
  referenceEl: {
    type: definePropType<HTMLElement>(Object),
  },
  triggerTargetEl: {
    type: definePropType<HTMLElement>(Object),
  },
  stopPopperMouseEvent: {
    type: Boolean,
    default: true,
  },
  ariaLabel: {
    type: String,
    default: undefined,
  },
  virtualTriggering: Boolean,
  zIndex: Number,
} as const)

export const popperContentEmits = [
  'mouseenter',
  'mouseleave',
  'focus',
  'blur',
  'close',
]

export type PopperContentProps = ExtractPropTypes<typeof popperContentProps>

export type PopperCoreConfigProps = ExtractPropTypes<
  typeof popperCoreConfigProps
>
