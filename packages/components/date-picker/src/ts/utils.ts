import dayjs from 'dayjs'
import { isArray } from '@follow-ui/utils'

import type { Dayjs } from 'dayjs'
import type { DateCell } from './date-picker'

type DayRange = [Dayjs | undefined, Dayjs | undefined]

//判断是否是时间范围
export const isValidRange = (range: DayRange): boolean => {
  //如果不是数组,返回false
  if (!isArray(range)) return false

  const [left, right] = range

  //如果都是日期时间且left与right相同或者在之前,返回true
  return (
    dayjs.isDayjs(left) && dayjs.isDayjs(right) && left.isSameOrBefore(right)
  )
}

type GetDefaultValueParams = {
  lang: string
  unit: 'month' | 'year'
  unlinkPanels: boolean
}

export type DefaultValue = [Date, Date] | Date | undefined

//获取默认值
export const getDefaultValue = (
  defaultValue: DefaultValue,
  { lang, unit, unlinkPanels }: GetDefaultValueParams
) => {
  let start: Dayjs
  //判断是否为数组
  if (isArray(defaultValue)) {
    let [left, right] = defaultValue.map((d) => dayjs(d).locale(lang))
    //如果不取消面板链接,设置right
    if (!unlinkPanels) {
      right = left.add(1, unit)
    }
    return [left, right]
  } else if (defaultValue) {
    //如果有默认值设置为默认值
    start = dayjs(defaultValue)
  } else {
    //如果没有,默认获取now
    start = dayjs()
  }
  //设置本地化
  start = start.locale(lang)
  return [start, start.add(1, unit)]
}

type Dimension = {
  row: number
  column: number
}

type BuildPickerTableMetadata = {
  //开始日期
  startDate?: Dayjs | null
  //单位
  unit: 'month' | 'day'
  columnIndexOffset: number
  //当前时间
  now: Dayjs
  nextEndDate: Dayjs | null
  relativeDateGetter: (index: number) => Dayjs
  setCellMetadata?: (
    cell: DateCell,
    dimension: { rowIndex: number; columnIndex: number }
  ) => void
  setRowMetadata?: (row: DateCell[]) => void
}

/**
 * 构建选择器表格
 * @param dimension  尺寸
 * @param rows 行
 * @param option 配置
 */
export const buildPickerTable = (
  dimension: Dimension,
  rows: DateCell[][],
  {
    columnIndexOffset,
    startDate,
    nextEndDate,
    now,
    unit,
    relativeDateGetter,
    setCellMetadata,
    setRowMetadata,
  }: BuildPickerTableMetadata
) => {
  //遍历行
  for (let rowIndex = 0; rowIndex < dimension.row; rowIndex++) {
    //获取对应行
    const row = rows[rowIndex]
    //遍历列
    for (let columnIndex = 0; columnIndex < dimension.column; columnIndex++) {
      //获取对应单元格数据
      let cell = row[columnIndex + columnIndexOffset]
      //如果不存在,设置单元格数据
      if (!cell) {
        cell = {
          row: rowIndex,
          column: columnIndex,
          type: 'normal',
          inRange: false,
          start: false,
          end: false,
        }
      }
      //设置唯一index
      const index = rowIndex * dimension.column + columnIndex
      //获取下一个开始日期
      const nextStartDate = relativeDateGetter(index)
      cell.dayjs = nextStartDate
      cell.date = nextStartDate.toDate()
      cell.timestamp = nextStartDate.valueOf()
      cell.type = 'normal'

      /**
       * 如果nextStartDate在下一个开始日期之后,结束日期之前,
       * 或者在开始日期之前,结束日期之后
       * 返回 true
       */
      cell.inRange =
        !!(
          startDate &&
          nextStartDate.isSameOrAfter(startDate, unit) &&
          nextEndDate &&
          nextStartDate.isSameOrBefore(nextEndDate, unit)
        ) ||
        !!(
          startDate &&
          nextStartDate.isSameOrBefore(startDate, unit) &&
          nextEndDate &&
          nextStartDate.isSameOrAfter(nextEndDate, unit)
        )
      /**
       * 设置开头和结尾
       * 如果开始日期在结束日期之后或者相同,
       * 设置start为nextStartDate为与nextEndDate相同的单元格
       * 设置end为nextStartDate为与startDate相同的单元格
       * 否则,设置start为nextStartDate为与startDate相同的单元格
       * 设置end为nextStartDate为与nextEndDate相同的单元格
       */
      if (startDate?.isSameOrAfter(nextEndDate)) {
        //判断下一个开始日期与结束日期是否相同
        cell.start = !!nextEndDate && nextStartDate.isSame(nextEndDate, unit)
        //判断下一个开始日期与startDate是否相同
        cell.end = !!startDate && nextStartDate.isSame(startDate, unit)
      } else {
        cell.start = !!startDate && nextStartDate.isSame(startDate, unit)
        cell.end = !!nextEndDate && nextStartDate.isSame(nextEndDate, unit)
      }

      //判断是否是今天
      const isToday = nextStartDate.isSame(now, unit)

      if (isToday) {
        cell.type = 'today'
      }
      //设置源数据
      setCellMetadata?.(cell, { rowIndex, columnIndex })

      //设置row
      row[columnIndex + columnIndexOffset] = cell
    }
    setRowMetadata?.(row)
  }
}
