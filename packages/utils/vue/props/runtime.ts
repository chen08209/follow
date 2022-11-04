import { warn } from 'vue'
import { fromPairs } from 'lodash-unified'
import { hasOwn } from '../../objects'
import { isObject } from '../../types'
import type { PropType } from 'vue'
import type {
  IfBuildProp,
  IfNativePropType,
  NativePropType,
  Prop,
  PropConvert,
  PropFinalized,
  PropInput,
  PropMergeType,
} from './types'

export const propKey = '__propKey'

//定义属性类型 => val as PropType<T>
export const definePropType = <T>(val: any): PropType<T> => val

export const isBuildProp = (val: unknown): val is Prop<any, any, any> =>
  isObject(val) && !!(val as any)[propKey]

export const buildProp = <
  Type = never,
  Value = never,
  Validator = never,
  Default extends PropMergeType<Type, Value, Validator> = never,
  Required extends boolean = false
>(
  prop: PropInput<Type, Value, Validator, Default, Required>,
  key?: string
): PropFinalized<Type, Value, Validator, Default, Required> => {
  //过滤掉非对象的prop和已经build的prop
  if (!isObject(prop) || isBuildProp(prop)) return prop as any
  const { values, required, default: defaultValue, type, validator } = prop

  //验证器,用于过滤value
  const validatorTemp =
    values || validator
      ? (val: unknown) => {
          //是否验证通过
          let valid = false

          //允许值的数组
          let allowedValues: unknown[] = []

          if (values) {
            //浅拷贝生成values
            allowedValues = Array.from(values)

            //如果prop存在default
            if (hasOwn(prop, 'default')) {
              allowedValues.push(defaultValue)
            }

            //判断allowedValues是否存在val
            valid ||= allowedValues.includes(val)
          }

          //如果存在validator,且allowedValues.includes(val) == false 执行validator(val)
          if (validator) valid ||= validator(val)

          //报错
          if (!valid && allowedValues.length > 0) {
            const allowValuesText = [...new Set(allowedValues)]
              .map((value) => JSON.stringify(value))
              .join(', ')
            warn(
              `Invalid prop: validation failed${
                key ? ` for prop "${key}"` : ''
              }. Expected one of [${allowValuesText}], got value ${JSON.stringify(
                val
              )}.`
            )
          }

          return valid
        }
      : undefined

  const extProp: any = {
    type,
    required: !!required,
    validator: validatorTemp,
    [propKey]: true,
  }

  if (hasOwn(prop, 'default')) extProp.default = defaultValue

  return extProp
}

/**
 * type Record<K extends keyof any, T> = {
 *     [P in K]: T;
 * };
 * @param props
 * K : string
 * T : { [propKey]: true } | NativePropType | PropInput<any, any, any, any, any>
 *
 * NativePropType 原生构造器 BooleanConstructor、StringConstructor、null、undefined 等
 *
 * PropInput 自定义构造器
 *
 * @return
 * IfBuildProp 判断是否build
 * 是, 返回Props[K]
 * 否, IfNativePropType<Props[K], Props[K], PropConvert<Props[K]>>
 * IfNativePropType 判断是否是原生Prop
 * 是, 返回Props[K]
 * 否, PropConvert<Props[K]>
 */
export const buildProps = <
  Props extends Record<
    string,
    { [propKey]: true } | NativePropType | PropInput<any, any, any, any, any>
  >
>(
  props: Props
): {
  [K in keyof Props]: IfBuildProp<
    Props[K],
    Props[K],
    IfNativePropType<Props[K], Props[K], PropConvert<Props[K]>>
  >
} => {
  /**
   * 对象转化为键值对数组,例如 {color: ƒ, size: ƒ, disabled: ƒ} => [Array(2), Array(2), Array(2)]
   * fromPairs([Array(2), Array(2), Array(2)]) => {color: ƒ, size: ƒ, disabled: ƒ}
   */
  return fromPairs(
    Object.entries(props).map(([key, option]) => [
      key,
      buildProp(option as any, key),
    ])
  ) as any
}
