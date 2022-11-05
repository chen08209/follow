import {
  buildProps,
  definePropType,
  iconPropType,
  isBoolean,
  isNumber,
  isString,
  isValidComponentSize,
} from '@follow-ui/utils'
import {
  CHANGE_EVENT,
  INPUT_EVENT,
  UPDATE_MODEL_EVENT,
} from '@follow-ui/constants'
import type { ComponentSize } from '@follow-ui/constants'
import type Switch from '../switch.vue'
import type { ExtractPropTypes, PropType } from 'vue'

export const switchProps = buildProps({
  modelValue: {
    type: [Boolean, String, Number],
    default: false,
  },
  color: String,
  disabled: {
    type: Boolean,
    default: false,
  },
  width: {
    type: [String, Number],
    default: '',
  },
  activeIcon: {
    type: iconPropType,
  },
  inactiveIcon: {
    type: iconPropType,
  },
  activeText: {
    type: String,
    default: '',
  },
  inactiveText: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  //激活value
  activeValue: {
    type: [Boolean, String, Number],
    default: true,
  },
  inactiveValue: {
    type: [Boolean, String, Number],
    default: false,
  },
  name: {
    type: String,
    default: '',
  },
  validateEvent: {
    type: Boolean,
    default: true,
  },
  id: String,
  beforeChange: {
    type: definePropType<() => Promise<boolean> | boolean>(Function),
  },
  size: {
    type: String as PropType<ComponentSize>,
    validator: isValidComponentSize,
  },
  tabindex: {
    type: [String, Number],
  },
} as const)

export type SwitchProps = ExtractPropTypes<typeof switchProps>

export const switchEmits = {
  [UPDATE_MODEL_EVENT]: (val: boolean | string | number) =>
    isBoolean(val) || isString(val) || isNumber(val),
  [CHANGE_EVENT]: (val: boolean | string | number) =>
    isBoolean(val) || isString(val) || isNumber(val),
  [INPUT_EVENT]: (val: boolean | string | number) =>
    isBoolean(val) || isString(val) || isNumber(val),
}
export type SwitchEmits = typeof switchEmits

export type SwitchInstance = InstanceType<typeof Switch>
