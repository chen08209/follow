import { buildProps, definePropType } from '@follow-ui/utils'
import { useSizeProp } from '@follow-ui/hooks'
import { CircleClose } from '@element-plus/icons-vue'
import { disabledTimeListsProps } from './shared'

import type { Component, ExtractPropTypes } from 'vue'
import type { Options } from '@popperjs/core'
import {
  DayOrDays,
  Input,
  ModelValueType,
  SingleOrRange,
} from '@follow-ui/tokens'

export const pickerProps = buildProps({
  id: {
    type: definePropType<SingleOrRange<string>>([Array, String]),
  },
  name: {
    type: definePropType<SingleOrRange<string>>([Array, String]),
    default: '',
  },
  popperClass: {
    type: String,
    default: '',
  },
  format: String,
  valueFormat: String,
  type: {
    type: String,
    default: '',
  },
  clearable: {
    type: Boolean,
    default: true,
  },
  clearIcon: {
    type: definePropType<string | Component>([String, Object]),
    default: CircleClose,
  },
  editable: {
    type: Boolean,
    default: true,
  },
  prefixIcon: {
    type: definePropType<string | Component>([String, Object]),
    default: '',
  },
  size: useSizeProp,
  readonly: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    default: '',
  },
  popperOptions: {
    type: definePropType<Partial<Options>>(Object),
    default: () => ({}),
  },
  modelValue: {
    type: definePropType<ModelValueType>([Date, Array, String, Number]),
    default: '',
  },
  rangeSeparator: {
    type: String,
    default: '-',
  },
  startPlaceholder: String,
  endPlaceholder: String,
  defaultValue: {
    type: definePropType<SingleOrRange<Date>>([Date, Array]),
  },
  //默认时间
  defaultTime: {
    type: definePropType<SingleOrRange<Date>>([Date, Array]),
  },
  isRange: {
    type: Boolean,
    default: false,
  },
  ...disabledTimeListsProps,
  disabledDate: {
    type: Function,
  },
  cellClassName: {
    type: Function,
  },
  shortcuts: {
    type: Array,
    default: () => [],
  },
  label: {
    type: String,
    default: undefined,
  },
  tabindex: {
    type: definePropType<string | number>([String, Number]),
    default: 0,
  },
  validateEvent: {
    type: Boolean,
    default: true,
  },
  unlinkPanels: Boolean,
} as const)

export const pickerEmits = [
  'update:modelValue',
  'change',
  'focus',
  'blur',
  'calendar-change',
  'panel-change',
  'visible-change',
  'keydown',
]

export type PickerProps = ExtractPropTypes<typeof pickerProps>

export type PickerEmits = typeof pickerEmits
export interface PickerOptions {
  isValidValue: (date: DayOrDays) => boolean
  handleKeydownInput: (event: KeyboardEvent) => void
  parseInput: (value: Input) => DayOrDays
  formatToString: (value: DayOrDays) => Input
  getRangeAvailableTime: (date: DayOrDays) => DayOrDays
  getDefaultValue: () => DayOrDays
  //判断面板是否初始化完成
  panelReady: boolean
  handleClear: () => void
  handleFocusPicker?: () => void
}
