import { Dayjs } from 'dayjs'

export type GetDisabledHoursState = (
  role: string,
  comparingDate?: Dayjs
) => number[]

export type GetDisabledMinutesState = (
  hour: number,
  role: string,
  comparingDate?: Dayjs
) => number[]

export type GetDisabledSecondsState = (
  hour: number,
  minute: number,
  role: string,
  comparingDate?: Dayjs
) => number[]

export type SingleOrRange<T> = T | [T, T]
export type DateModelType = number | string | Date
export type ModelValueType = SingleOrRange<DateModelType>
export type DayOrDays = SingleOrRange<Dayjs>
export type DateOrDates = SingleOrRange<Date>
export type Input = SingleOrRange<string | null>
export type GetDisabledHours = (role: string, comparingDate?: Dayjs) => number[]
export type GetDisabledMinutes = (
  hour: number,
  role: string,
  comparingDate?: Dayjs
) => number[]
export type GetDisabledSeconds = (
  hour: number,
  minute: number,
  role: string,
  comparingDate?: Dayjs
) => number[]
