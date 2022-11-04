import { CHANGE_EVENT, UPDATE_MODEL_EVENT } from '@follow-ui/constants'
import {
  buildProps,
  definePropType,
  isValidComponentSize,
} from '@follow-ui/utils'
import { placements } from '@popperjs/core'
import { ArrowUp, CircleClose } from '@element-plus/icons-vue'
import { tagProps } from '../../../tag'
import { tooltipContentProps } from '../../../tooltip'
import type { ComponentSize } from '@follow-ui/constants'
import type { Component, ExtractPropTypes, PropType } from 'vue'
import { OptionProps } from './option'

export const selectProps = buildProps({
  name: String,
  id: String,
  items: {
    //definePropType<Partial<OptionProps[]>>([Array]) === [Array] as PropType<Partial<OptionProps[]>>
    type: definePropType<Partial<OptionProps[]>>([Array]),
  },
  modelValue: {
    type: [Array, String, Number, Boolean, Object],
    default: undefined,
  },
  autocomplete: {
    type: String,
    default: 'off',
  },
  //聚焦后下拉框是否自动弹出(仅适用于非filterable下拉框)
  automaticDropdown: Boolean,
  size: {
    type: String as PropType<ComponentSize>,
    //验证器,判断传入size是否在ComponentSize中
    validator: isValidComponentSize,
  },
  effect: {
    type: String as PropType<'light' | 'dark' | string>,
    default: 'light',
  },
  //是否使失效
  disabled: Boolean,
  //是否可以清除
  clearable: Boolean,
  //是否可以过滤
  filterable: Boolean,
  //是否可以创建
  allowCreate: Boolean,
  //是否加载
  loading: Boolean,
  popperClass: {
    type: String,
    default: '',
  },
  remote: Boolean,
  loadingText: String,
  noMatchText: String,
  noDataText: String,
  //远程搜索方法
  remoteMethod: Function,
  //过滤方法
  filterMethod: Function,
  multiple: Boolean,
  //多选模式下做多可选择数量,0则不限制
  multipleLimit: {
    type: Number,
    default: 0,
  },
  placeholder: {
    type: String,
  },
  //是否默认悬停第一个选项
  defaultFirstOption: Boolean,
  //搜索后是否保留关键字
  reserveKeyword: {
    type: Boolean,
    default: true,
  },
  valueKey: {
    type: String,
    default: 'value',
  },
  collapseTags: Boolean,
  collapseTagsTooltip: {
    type: Boolean,
    default: false,
  },
  teleported: tooltipContentProps.teleported,
  //是否持久化
  persistent: {
    type: Boolean,
    default: true,
  },
  clearIcon: {
    type: [String, Object] as PropType<string | Component>,
    default: CircleClose,
  },
  fitInputWidth: {
    type: Boolean,
    default: false,
  },
  suffixIcon: {
    type: [String, Object] as PropType<string | Component>,
    default: ArrowUp,
  },
  tagType: { ...tagProps.type, default: 'info' },
  validateEvent: {
    type: Boolean,
    default: true,
  },
  placement: {
    type: String,
    values: placements,
    default: 'bottom-start',
  },
} as const)

export const selectEmits = [
  UPDATE_MODEL_EVENT,
  CHANGE_EVENT,
  'remove-tag',
  'clear',
  'visible-change',
  'focus',
  'blur',
]

export type SelectProps = ExtractPropTypes<typeof selectProps>

export type SelectEmits = typeof selectEmits
