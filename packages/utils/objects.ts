import { get, set } from 'lodash-unified'
import type { Entries } from 'type-fest'
import type { Arrayable } from '@follow-ui/utils/typescript'

export const keysOf = <T>(arr: T) => Object.keys(arr as Object) as Array<keyof T>
export const entriesOf = <T>(arr: T) => Object.entries(arr as Object) as Entries<T>
export { hasOwn } from '@vue/shared'

//获取属性
export const getProp = <T = any>(
  obj: Record<string, any>,
  path: Arrayable<string>,
  defaultValue?: any
): { value: T } => {
  return {
    get value() {
      return get(obj, path, defaultValue)
    },
    set value(val: any) {
      set(obj, path, val)
    },
  }
}
