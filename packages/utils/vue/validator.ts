import { componentSizes, datePickTypes } from '@follow-ui/constants'
import type { ComponentSize, DatePickType } from '@follow-ui/constants'

//判断val是否在componentSizes中
export const isValidComponentSize = (val: string): val is ComponentSize | '' =>
  ['', ...componentSizes].includes(val)

export const isValidDatePickType = (val: string): val is DatePickType =>
  ([...datePickTypes] as string[]).includes(val)
