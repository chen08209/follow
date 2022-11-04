export const unique = <T>(arr: T[]) => [...new Set(arr)]

type Many<T> = T | ReadonlyArray<T>
/**
 * 构建数组
 * @param arr 可能是数组的值
 * @returns 返回类似lodash _.castArray,区别在于非0的无效值会返回空[]
 */
export const castArray = <T>(arr: Many<T>): T[] => {
  //如果不存在,且!==0 返回空数组
  if (!arr && (arr as any) !== 0) return []
  //否则返回类似数组
  return Array.isArray(arr) ? arr : ([arr] as T[])
}

//强制转化为数组
export { castArray as ensureArray } from 'lodash-unified'
