import dayjs from 'dayjs'
import { isArray, isDate, isEmpty } from '@follow-ui/utils'

import type { Dayjs } from 'dayjs'
export type TimeList = [number | undefined, number, undefined | number]

//构建时间列表
export const buildTimeList = (value: number, bound: number): TimeList => {
  return [
    value > 0 ? value - 1 : undefined,
    value,
    value < bound ? value + 1 : undefined,
  ]
}

/**
 * 范围数组
 * @param n 数组长度
 * @returns 生成一个从 0到n-1长度为n的数组
 * Array.from({ length: n })获取指定长度的空数组
 * [].keys()获取对应长度的数组索引
 */
export const rangeArr = (n: number) =>
  Array.from(Array.from({ length: n }).keys())

/**
 * 日期格式化
 * @param format 格式
 * @returns 日期格式
 * \W匹配非字母
 * 去除format中的m{1,2},ZZ,H|h{1,2},S|s{1,3},A|a
 */
export const extractDateFormat = (format: string) => {
  return format
    .replace(/\W?m{1,2}|\W?ZZ/g, '')
    .replace(/\W?h{1,2}|\W?s{1,3}|\W?a/gi, '')
    .trim()
}

/**
 * 时间格式化
 * @param format 格式
 * @returns 时间格式
 * \W匹配非字母
 * 去除format中的D{1,2},Do,d{1,4},M{1,4},Y{2,4}
 */
export const extractTimeFormat = (format: string) => {
  return format
    .replace(/\W?D{1,2}|\W?Do|\W?d{1,4}|\W?M{1,4}|\W?Y{2,4}/g, '')
    .trim()
}

//判断是否是相同的时间
export const dateEquals = function (a: Date | unknown, b: Date | unknown) {
  const aIsDate = isDate(a)
  const bIsDate = isDate(b)
  //如果a和b都是date,返回对应时间戳
  if (aIsDate && bIsDate) {
    return a.getTime() === b.getTime()
  }
  //如果a和b都不是date
  if (!aIsDate && !bIsDate) {
    return a === b
  }
  return false
}

//判断两个值是否相同
export const valueEquals = function (
  a: Array<Date> | unknown,
  b: Array<Date> | unknown
) {
  const aIsArray = isArray(a)
  const bIsArray = isArray(b)
  //如果两个都是数组
  if (aIsArray && bIsArray) {
    //当长度不相等时
    if (a.length !== b.length) {
      return false
    }
    //判断a数组的每一项是否和b数组对应项相等
    return a.every((item, index) => dateEquals(item, b[index]))
  }
  //如果两个值都不是数值
  if (!aIsArray && !bIsArray) {
    return dateEquals(a, b)
  }
  return false
}

/**
 * 校验时间
 * @param date 日期
 * @param format 格式
 * @param lang 语言
 * @returns dayjs类型的date 或者 undefined
 */
export const parseDate = function (
  date: string | number | Date,
  format: string | undefined,
  lang: string
) {
  const day =
    isEmpty(format) || format === 'x'
      ? dayjs(date).locale(lang)
      : dayjs(date, format).locale(lang)
  //如果通过date通过格式校验,返回day,否者返回undefined
  return day.isValid() ? day : undefined
}

/**
 *通过日期,格式,环境,返回对应时间戳
 * @param date 日期时间
 * @param format 格式
 * @param lang 环境
 * @returns 时间戳
 */
export const formatter = function (
  date: string | number | Date | Dayjs,
  format: string | undefined,
  lang: string
) {
  if (isEmpty(format)) return date
  if (format === 'x') return +date
  return dayjs(date).locale(lang).format(format)
}

/**
 * 生成list
 * @param total 总数
 * @param method 方法
 * @returns list数组
 */
export const makeList = (total: number, method?: () => number[]) => {
  const arr: boolean[] = []
  //获取废弃值的数组
  const disabledArr = method?.()
  for (let i = 0; i < total; i++) {
    arr.push(disabledArr?.includes(i) ?? false)
  }
  return arr
}
