<template>
  <!-- date表格 -->
  <table
    role="grid"
    :aria-label="t('fl.datepicker.dateTablePrompt')"
    cellspacing="0"
    cellpadding="0"
    :class="[ns.b(), { 'is-week-mode': selectionMode === 'week' }]"
    @click="handlePickDate"
    @mousemove="handleMouseMove"
    @mousedown="handleMouseDown"
    @mouseup="handleMouseUp"
  >
    <tbody ref="tbodyRef">
      <tr>
        <!-- 是否展示星期数 -->
        <th v-if="showWeekNumber" scope="col">{{ t('fl.datepicker.week') }}</th>
        <!-- 表头 -->
        <th
          v-for="(week, key) in WEEKS"
          :key="key"
          scope="col"
          :aria-label="t('fl.datepicker.weeksFull.' + week)"
        >
          {{ t('fl.datepicker.weeks.' + week) }}
        </th>
      </tr>
      <tr
        v-for="(row, rowKey) in rows"
        :key="rowKey"
        :class="[ns.e('row'), { current: isWeekActive(row[1]) }]"
      >
        <td
          v-for="(cell, columnKey) in row"
          :key="`${rowKey}.${columnKey}`"
          :ref="(el) => isSelectedCell(cell) && (currentCellRef = el as HTMLElement)"
          :class="getCellClasses(cell)"
          :aria-current="cell.isCurrent ? 'date' : undefined"
          :aria-selected="cell.isCurrent"
          :tabindex="isSelectedCell(cell) ? 0 : -1"
          @focus="handleFocus"
        >
          <fl-date-picker-cell :cell="cell" />
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref, unref, watch } from 'vue'
import dayjs from 'dayjs'
import { flatten } from 'lodash-unified'
import { useLocale, useNamespace } from '@follow-ui/hooks'
import { castArray } from '@follow-ui/utils'
import { basicDateTableProps, buildPickerTable } from '../ts'
import FlDatePickerCell from './basic-cell-render'

import type { Dayjs } from 'dayjs'
import type { DateCell } from '../ts'

const props = defineProps(basicDateTableProps)
const emit = defineEmits(['changerange', 'pick', 'select'])

const ns = useNamespace('date-table')

const { t, lang } = useLocale()
//表格主体ref
const tbodyRef = ref<HTMLElement>()
//选中后的单元格ref
const currentCellRef = ref<HTMLElement>()
// data
const lastRow = ref<number>()
const lastColumn = ref<number>()
//初始化行,6x7数组
const tableRows = ref<DateCell[][]>([[], [], [], [], [], []])

let focusWithClick = false

//根据地区获取每周第一天,默认是周日
const firstDayOfWeek = (props.date as any).$locale().weekStart || 7

//获取英文下短的weekdays常量数组并转化为小写(默认是前三个字母)
const WEEKS_CONSTANT = props.date
  .locale('en')
  .localeData()
  .weekdaysShort()
  .map((item) => item.toLowerCase())

//dayjs默认的周首是周日,offsetDay用于计算不同周首是对应的偏移量
// (原版) return firstDayOfWeek > 3 ? 7 - firstDayOfWeek : -firstDayOfWeek
const offsetDay = computed(() => -firstDayOfWeek)

//当月第一天对应的上个星期天
const startDate = computed(() => {
  // 原版本
  // //获取当月第一天
  // const startOfMonth = props.date.startOf('month')
  // /**
  //  * subtract(num,unit)返回减去对应num的unit
  //  * day()获取该天是星期几
  //  * startDayOfMonth.day()为0,返回7
  //  */
  // return startOfMonth.subtract(startOfMonth.day() || 7, 'day')

  // 暂时注释(可能会产生问题)
  const offset = unref(offsetDay)
  const startOfMonth = props.date.startOf('month')
  const startOfMonthDay = startOfMonth.day() || 7

  return startOfMonth.subtract(
    startOfMonthDay + offset > 0
      ? startOfMonthDay + offset
      : 7 + startOfMonthDay + offset,
    'day'
  )
})

//获取WEEKS
const WEEKS = computed(() => {
  //链接两个WEEKS常量,从firstDayOfWeek开始,到firstDayOfWeek + 6结束,一共取7个
  return WEEKS_CONSTANT.concat(WEEKS_CONSTANT).slice(
    firstDayOfWeek,
    firstDayOfWeek + 7
  )
})

//判断是否是当前
const hasCurrent = computed<boolean>(() => {
  //flatten扁平化多维数组,判断是否有选中
  return flatten(rows.value).some((row) => {
    return row.isCurrent
  })
})

/**
 * @return {
 *  startOfMonthDay  //当月第一天是星期数
 *  dateCountOfMonth //当月天数
 *  dateCountOfLastMonth //上个月天数
 * }
 */
const days = computed(() => {
  //当月第一天
  const startOfMonth = props.date.startOf('month')

  //当月第一天是星期数
  const startOfMonthDay = startOfMonth.day() || 7 // day of first day

  //当月天数
  const dateCountOfMonth = startOfMonth.daysInMonth()

  //上个月天数
  const dateCountOfLastMonth = startOfMonth.subtract(1, 'month').daysInMonth()

  return {
    startOfMonthDay,
    dateCountOfMonth,
    dateCountOfLastMonth,
  }
})

//选中的数据
const selectedDate = computed(() => {
  return props.selectionMode === 'dates'
    ? (castArray(props.parsedValue) as Dayjs[])
    : ([] as Dayjs[])
})

//设置日期文本
const setDateText = (
  cell: DateCell,
  {
    count,
    rowIndex,
    columnIndex,
  }: {
    count: number
    rowIndex: number
    columnIndex: number
  }
): boolean => {
  const { startOfMonthDay, dateCountOfMonth, dateCountOfLastMonth } =
    unref(days)
  const offset = unref(offsetDay)
  //第1行和第2行
  if (rowIndex >= 0 && rowIndex <= 1) {
    /**
     * numberOfDaysFromPreviousMonth表格中属于上个月的天数
     * startOfMonthDay 上月最后一天的星期数
     * offset 偏移量,周日时为0
     * 此时恰好前方数量为startOfMonthDay
     */
    const numberOfDaysFromPreviousMonth =
      startOfMonthDay + offset < 0
        ? 7 + startOfMonthDay + offset
        : startOfMonthDay + offset
    if (columnIndex + rowIndex * 7 >= numberOfDaysFromPreviousMonth) {
      cell.text = count
      return true
    } else {
      /**
       * 上的月的最后一天 + 对应行 * 7 + 对应列 + 1 - 表格中上个月的天数
       */
      cell.text =
        dateCountOfLastMonth -
        (numberOfDaysFromPreviousMonth - (columnIndex % 7)) +
        1 +
        rowIndex * 7
      //设置为上一个月
      cell.type = 'prev-month'
    }
  } else {
    //判断count是否小于当月最大天数
    if (count <= dateCountOfMonth) {
      cell.text = count
    } else {
      cell.text = count - dateCountOfMonth
      //设置为下一个月
      cell.type = 'next-month'
    }
    return true
  }
  return false
}

//设置原数据
const setCellMetadata = (
  cell: DateCell,
  {
    columnIndex,
    rowIndex,
  }: {
    columnIndex: number
    rowIndex: number
  },
  count: number
) => {
  const { disabledDate, cellClassName } = props
  const selectedDateTemp = unref(selectedDate)
  //是否自增
  const shouldIncrement = setDateText(cell, { count, rowIndex, columnIndex })
  //toDate()获取原生date对象
  const cellDate = cell.dayjs!.toDate()
  //判断是否选中
  cell.selected = selectedDateTemp.find(
    //判断时间戳是否相等
    (item) => item.valueOf() === cell.dayjs!.valueOf()
  )
  cell.isSelected = !!cell.selected
  //判断是否是当前天
  cell.isCurrent = isCurrent(cell)
  //判断是否废弃
  cell.disabled = disabledDate?.(cellDate)
  //判断是否右自定义的类名
  cell.customClass = cellClassName?.(cellDate)
  return shouldIncrement
}

//设置行数据
const setRowMetadata = (row: DateCell[]) => {
  //如果selectionMode是week
  if (props.selectionMode === 'week') {
    const [start, end] = props.showWeekNumber ? [1, 7] : [0, 6]
    //取第二列用于判断是否激活
    const isActive = isWeekActive(row[start + 1])
    //设置week状态下的样式
    row[start].inRange = isActive
    row[start].start = isActive
    row[end].inRange = isActive
    row[end].end = isActive
  }
}

//行数据
const rows = computed(() => {
  const { minDate, maxDate, rangeState, showWeekNumber } = props
  // //获取偏移量
  // const offset = offsetDay.value

  //获取行数据
  const rowsTemp = tableRows.value
  //日期单位
  const dateUnit = 'day'
  //指针
  let count = 1

  //如果要展示星期数,通过week()获得对应的星期数
  if (showWeekNumber) {
    for (let rowIndex = 0; rowIndex < 6; rowIndex++) {
      //如果不存在,则设置第0列
      if (!rowsTemp[rowIndex][0]) {
        rowsTemp[rowIndex][0] = {
          type: 'week',
          text: startDate.value.add(rowIndex * 7 + 1, dateUnit).week(),
        }
      }
    }
  }

  //构建表格
  buildPickerTable({ row: 6, column: 7 }, rowsTemp, {
    startDate: minDate,
    columnIndexOffset: showWeekNumber ? 1 : 0,
    nextEndDate:
      rangeState.endDate ||
      maxDate ||
      (rangeState.selecting && minDate) ||
      null,
    now: dayjs().locale(unref(lang)).startOf(dateUnit),
    unit: dateUnit,
    //相对日期获取
    relativeDateGetter: (idx: number) => startDate.value.add(idx, dateUnit),
    setCellMetadata: (...args) => {
      //判断是否自增
      if (setCellMetadata(...args, count)) {
        count += 1
      }
    },
    setRowMetadata,
  })

  return rowsTemp
})

//监听传入日期
watch(
  () => props.date,
  async () => {
    //如果激活在tbodyRef上,聚焦当前单元格
    if (tbodyRef.value?.contains(document.activeElement)) {
      await nextTick()
      currentCellRef.value?.focus()
    }
  }
)

//聚焦当前单元格
const focus = async () => {
  currentCellRef.value?.focus()
}

//判断单元格类型是否为normal或today
const isNormalDay = (type = '') => {
  return ['normal', 'today'].includes(type)
}

/**
 * 是否是当前天
 * @param cell 单元格数据
 * 如果是date,且类型为normal或today,同时单元格日期与props.parsedValue是通一天
 */
const isCurrent = (cell: DateCell): boolean => {
  return (
    props.selectionMode === 'date' &&
    isNormalDay(cell.type) &&
    cellMatchesDate(cell, props.parsedValue as Dayjs)
  )
}

/**
 * 判断传入日期和单元格是否是同一天
 * @param cell 单元格数据
 * @param date 日期
 */
const cellMatchesDate = (cell: DateCell, date: Dayjs) => {
  if (!date) return false
  //判断传入的日期是否和单元格文本中的日期对应
  return dayjs(date)
    .locale(lang.value)
    .isSame(props.date.date(Number(cell.text)), 'day')
}

//单元格样式
const getCellClasses = (cell: DateCell) => {
  const classes: string[] = []
  if (isNormalDay(cell.type) && !cell.disabled) {
    classes.push('available')
    if (cell.type === 'today') {
      classes.push('today')
    }
  } else {
    classes.push(cell.type!)
  }

  //当前
  if (isCurrent(cell)) {
    classes.push('current')
  }

  //周
  if (
    cell.inRange &&
    (isNormalDay(cell.type) || props.selectionMode === 'week')
  ) {
    classes.push('in-range')

    if (cell.start) {
      classes.push('start-date')
    }

    if (cell.end) {
      classes.push('end-date')
    }
  }

  //废弃
  if (cell.disabled) {
    classes.push('disabled')
  }

  //选中
  if (cell.selected) {
    classes.push('selected')
  }

  //自定义class
  if (cell.customClass) {
    classes.push(cell.customClass)
  }

  return classes.join(' ')
}

//通过行列获取日期
const getDateOfCell = (row: number, column: number) => {
  //原版
  // /**
  //  * 偏移量
  //  * row * 7 + (column - (props.showWeekNumber ? 1 : 0)) //当前位置
  //  * offsetDay.value 偏移量
  //  * startDate 当月第一天的上一个周日
  //  */
  // const offsetFromStart =
  //   row * 7 + (column - (props.showWeekNumber ? 1 : 0)) - offsetDay.value
  // return startDate.value.add(offsetFromStart, 'day')
  //优化
  return startDate.value.add(
    row * 7 + (column - (props.showWeekNumber ? 1 : 0)),
    'day'
  )
}

//鼠标移动事件,移动时修改范围
const handleMouseMove = (event: MouseEvent) => {
  //如果不是选择状态,返回
  if (!props.rangeState.selecting) return
  //如果target无法找到td return
  let target = event.target as HTMLElement
  if (target.tagName === 'SPAN') {
    target = target.parentNode?.parentNode as HTMLElement
  }
  if (target.tagName === 'DIV') {
    target = target.parentNode as HTMLElement
  }
  if (target.tagName !== 'TD') return

  //获取行
  const row = (target.parentNode as HTMLTableRowElement).rowIndex - 1

  //获取列
  const column = (target as HTMLTableCellElement).cellIndex

  //如果当前行列是废弃的,return
  if (rows.value[row][column].disabled) return
  //判断上次选择的行或者列是否改变,如果改变
  if (row !== lastRow.value || column !== lastColumn.value) {
    //记录最后选择的行列
    lastRow.value = row
    lastColumn.value = column
    //触发change事件
    emit('changerange', {
      selecting: true,
      endDate: getDateOfCell(row, column),
    })
  }
}

//判断是否是选中的单元格
const isSelectedCell = (cell: DateCell) => {
  /**
   * !hasCurrent.value是否存在选中的cell
   * cell?.text是否为1
   * cell.type 是否为normal
   */
  return (
    (!hasCurrent.value && cell?.text === 1 && cell.type === 'normal') ||
    cell.isCurrent
  )
}

//处理聚焦事件
const handleFocus = (event: FocusEvent) => {
  //如果不是用click聚焦,也不存在已经被选中数据且mode不是date,调用pick事件,否则return
  if (focusWithClick || hasCurrent.value || props.selectionMode !== 'date')
    return
  handlePickDate(event, true)
}

//鼠标按下事件
const handleMouseDown = (event: MouseEvent) => {
  const target = (event.target as HTMLElement).closest('td')
  if (!target) return
  focusWithClick = true
}

////鼠标释放事件
const handleMouseUp = (event: MouseEvent) => {
  const target = (event.target as HTMLElement).closest('td')
  if (!target) return
  focusWithClick = false
}

//click事件
const handlePickDate = (
  event: FocusEvent | MouseEvent,
  isKeyboardMovement = false
) => {
  //获取target,closest匹配最近的祖先元素
  const target = (event.target as HTMLElement).closest('td')
  if (!target) return

  //获得target对应的行
  const row = (target.parentNode as HTMLTableRowElement).rowIndex - 1
  //获得target对应的列
  const column = (target as HTMLTableCellElement).cellIndex
  //获取单元格数据数据
  const cell = rows.value[row][column]

  if (cell.disabled || cell.type === 'week') return

  //通过坐标获取对应的date
  const newDate = getDateOfCell(row, column)

  if (props.selectionMode === 'range') {
    /**
     * 如果没有props.rangeState.selecting或者没有props.minDate,触发pick,select
     * 否则,判断当前date是否大于minDate,
     * 是触发pick,并设置maxDate为当前date
     * 否触发pick,并设置minDate为当前date
     */
    if (!props.rangeState.selecting || !props.minDate) {
      emit('pick', { minDate: newDate, maxDate: null })
      emit('select', true)
    } else {
      if (newDate >= props.minDate) {
        emit('pick', { minDate: props.minDate, maxDate: newDate })
      } else {
        emit('pick', { minDate: newDate, maxDate: props.minDate })
      }
      emit('select', false)
    }
  } else if (props.selectionMode === 'date') {
    emit('pick', newDate, isKeyboardMovement)
  } else if (props.selectionMode === 'week') {
    /**
     * week() 获取当前是第几周
     * value 设置值,例如2022w20
     */
    const weekNumber = newDate.week()
    const value = `${newDate.year()}w${weekNumber}`
    emit('pick', {
      year: newDate.year(),
      week: weekNumber,
      value,
      date: newDate.startOf('week'),
    })
  } else if (props.selectionMode === 'dates') {
    /**
     * cell.selected,判断单元格是否选中
     * 选中则 newDate = castArray(props.parsedValue)中不等于当前date的值
     * 否则返回连接数组
     */
    const newValue = cell.selected
      ? castArray(props.parsedValue).filter(
          (item) => item?.valueOf() !== newDate.valueOf()
        )
      : castArray(props.parsedValue).concat([newDate])
    emit('pick', newValue)
  }
}

//是否激活周
const isWeekActive = (cell: DateCell) => {
  if (props.selectionMode !== 'week') return false
  //当天
  let newDate = props.date.startOf('day')

  //上一个月
  if (cell.type === 'prev-month') {
    newDate = newDate.subtract(1, 'month')
  }

  //下一个月
  if (cell.type === 'next-month') {
    newDate = newDate.add(1, 'month')
  }
  //10进制解析cell.text
  newDate = newDate.date(Number.parseInt(cell.text as any, 10))
  //如果props.parsedValue不是数组
  if (props.parsedValue && !Array.isArray(props.parsedValue)) {
    //日期偏移量 -1用于取到第二列数据
    const dayOffset = ((props.parsedValue.day() - firstDayOfWeek + 7) % 7) - 1
    //减去日期偏移量
    const weekDate = props.parsedValue.subtract(dayOffset, 'day')
    //如果newDate 和 weekDate是同一天, 返回true, 否则返回false
    return weekDate.isSame(newDate, 'day')
  }
  return false
}

defineExpose({
  focus,
})
</script>
