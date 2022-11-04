<template>
  <div
    :class="[
      ppNs.b(),
      dpNs.b(),
      {
        'has-sidebar': $slots.sidebar || hasShortcuts,
        'has-time': showTime,
      },
    ]"
  >
    <div :class="ppNs.e('body-wrapper')">
      <slot name="sidebar" :class="ppNs.e('sidebar')" />
      <div v-if="hasShortcuts" :class="ppNs.e('sidebar')">
        <button
          v-for="(shortcut, key) in shortcuts"
          :key="key"
          type="button"
          :class="ppNs.e('shortcut')"
          @click="handleShortcutClick(shortcut)"
        >
          {{ shortcut.text }}
        </button>
      </div>
      <div :class="ppNs.e('body')">
        <div v-if="showTime" :class="dpNs.e('time-header')">
          <!-- 日期选择器 -->
          <span :class="dpNs.e('editor-wrap')">
            <fl-input
              :placeholder="t('fl.datepicker.selectDate')"
              :model-value="visibleDate"
              size="small"
              :validate-event="false"
              @input="(val) => (inputDate = val)"
              @change="handleVisibleDateChange"
            />
          </span>
          <!-- 时间选择器 -->
          <span
            v-click-outside="handleTimePickClose"
            :class="dpNs.e('editor-wrap')"
          >
            <fl-input
              :placeholder="t('fl.datepicker.selectTime')"
              :model-value="visibleTime"
              size="small"
              :validate-event="false"
              @focus="onTimePickerInputFocus"
              @input="(val) => (inputTime = val)"
              @change="handleVisibleTimeChange"
            />
            <time-pick-panel
              :visible="timePickerVisible"
              :format="timeFormat"
              :time-arrow-control="arrowControl"
              :parsed-value="innerDate"
              @pick="handleTimePick"
            />
          </span>
        </div>
        <div
          v-show="currentView !== 'time'"
          :class="[
            dpNs.e('header'),
            (currentView === 'year' || currentView === 'month') &&
              dpNs.e('header--bordered'),
          ]"
        >
          <div :class="dpNs.e('header-labels')">
            <span
              role="button"
              :class="dpNs.e('header-label')"
              aria-live="polite"
              tabindex="0"
              @keydown.enter="showPicker('year')"
              @click="showPicker('year')"
              >{{ yearLabel }}</span
            >
            <span
              v-show="currentView === 'date'"
              role="button"
              aria-live="polite"
              tabindex="0"
              :class="[
                dpNs.e('header-label'),
                { active: currentView === 'month' },
              ]"
              @keydown.enter="showPicker('month')"
              @click="showPicker('month')"
              >{{ t(`fl.datepicker.month${month + 1}`) }}</span
            >
          </div>
          <div :class="dpNs.e('header-btns')">
            <fl-button
              text
              circle
              class="arrow-left"
              :aria-label="t(`fl.datepicker.prevMonth`)"
              :icon="ArrowLeft"
              :class="ppNs.e('icon-btn')"
              @click="
                currentView === 'date' ? moveByMonth(false) : moveByYear(false)
              "
            />
            <fl-button
              text
              circle
              class="arrow-right"
              :aria-label="t(`fl.datepicker.nextMonth`)"
              :icon="ArrowRight"
              :class="ppNs.e('icon-btn')"
              @click="
                currentView === 'date' ? moveByMonth(true) : moveByYear(true)
              "
            />
          </div>
        </div>
        <div :class="ppNs.e('content')" @keydown="handleKeydownTable">
          <date-table
            v-if="currentView === 'date'"
            ref="currentViewRef"
            :selection-mode="selectionMode"
            :date="innerDate"
            :parsed-value="parsedValue"
            :disabled-date="disabledDate"
            :cell-class-name="cellClassName"
            @pick="handleDatePick"
          />
          <year-table
            v-if="currentView === 'year'"
            ref="currentViewRef"
            :date="innerDate"
            :disabled-date="disabledDate"
            :parsed-value="parsedValue"
            @pick="handleYearPick"
          />
          <month-table
            v-if="currentView === 'month'"
            ref="currentViewRef"
            :date="innerDate"
            :parsed-value="parsedValue"
            :disabled-date="disabledDate"
            @pick="handleMonthPick"
          />
        </div>
      </div>
    </div>
    <!-- 页脚 -->
    <div
      v-show="footerVisible && currentView === 'date'"
      :class="ppNs.e('footer')"
    >
      <!-- 此刻按钮 -->
      <fl-button
        v-show="selectionMode !== 'dates'"
        text
        size="small"
        :class="ppNs.e('link-btn')"
        @click="changeToNow"
      >
        {{ t('fl.datepicker.now') }}
      </fl-button>
      <!-- 确认按钮 -->
      <fl-button
        plain
        size="small"
        :class="ppNs.e('link-btn')"
        @click="onConfirm"
      >
        {{ t('fl.datepicker.confirm') }}
      </fl-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject, nextTick, ref, toRef, watch } from 'vue'
import dayjs from 'dayjs'
import { ClickOutside as vClickOutside } from '@follow-ui/directives'
import { useLocale, useNamespace } from '@follow-ui/hooks'
import { isArray, isFunction } from '@follow-ui/utils'
import { EVENT_CODE } from '@follow-ui/constants'
import { PICKER_BASE, TOOLTIP_INJECTION_KEY } from '@follow-ui/tokens'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { FlInput } from '../../../input'
import {
  TimePickPanel,
  extractDateFormat,
  extractTimeFormat,
} from '../../../time-picker'
import { FlButton } from '../../../button'
import { panelDatePickProps, useShortcut } from '../ts'
import DateTable from '../basic/basic-date-table.vue'
import MonthTable from '../basic/basic-month-table.vue'
import YearTable from '../basic/basic-year-table.vue'
import type { Dayjs } from 'dayjs'
import type {
  DateTableEmits,
  DatesPickerEmits,
  PanelDatePickProps,
  WeekPickerEmits,
} from '../ts'

//时间选择类型
type DatePickType = PanelDatePickProps['type']
// const timeWithinRange = (_: ConfigType, __: any, ___: string) => true
const props = defineProps(panelDatePickProps)
const emit = defineEmits(['pick', 'set-picker-option', 'panel-change'])
const ppNs = useNamespace('picker-panel')
const dpNs = useNamespace('date-picker')

const { t, lang } = useLocale()
//快捷操作钩子
const handleShortcutClick = useShortcut(lang)
//popper
const popper = inject(TOOLTIP_INJECTION_KEY)
//从picker取值
const pickerBase = inject(PICKER_BASE) as any
const { shortcuts, disabledDate, cellClassName, defaultTime, arrowControl } =
  pickerBase.props

//获取defaultValue
const defaultValue = toRef(pickerBase.props, 'defaultValue')

//当前view
const currentView = ref('date')

//日期view的ref
const currentViewRef = ref<{ focus: () => void }>()

//当前日期
const innerDate = ref(dayjs().locale(lang.value))

/* const selectableRange = ref([]) */
//日期框
const inputDate = ref<string | null>(null)
//时间框
const inputTime = ref<string | null>(null)

//是否显示时间选择器
const timePickerVisible = ref(false)

/**
 * dayjs类型的默认时间,如果没有默认时间就是当前时间
 */
const defaultTimeD = computed(() => {
  return dayjs(defaultTime).locale(lang.value)
})

//当前月
const month = computed(() => {
  return innerDate.value.month()
})

//当前年
const year = computed(() => {
  return innerDate.value.year()
})

//年标签
const yearLabel = computed(() => {
  //后缀
  const suffix = t('fl.datepicker.year')
  //如果当前是year视图
  if (currentView.value === 'year') {
    //开始年,Math.floor(2022 / 10) * 10 => 2020
    const startYear = Math.floor(year.value / 10) * 10
    //如果后缀存在
    if (suffix) {
      return `${startYear} ${suffix} - ${startYear + 9} ${suffix}`
    }
    return `${startYear} - ${startYear + 9}`
  }
  return `${year.value} ${suffix}`
})

//是否显示时间
const showTime = computed(
  () => props.type === 'datetime' || props.type === 'datetimerange'
)

//是否显示页脚
const footerVisible = computed(() => {
  //当显示showtime或者selectionMode是dates时显示
  return showTime.value || selectionMode.value === 'dates'
})

//选择模式=>精简type
const selectionMode = computed<DatePickType>(() => {
  const { type } = props
  if (['week', 'month', 'year', 'dates'].includes(type)) return type
  return 'date' as DatePickType
})

//键盘模式,如果是date,返回currentView.value,否则selectionMode.value
const keyboardMode = computed<string>(() => {
  return selectionMode.value === 'date'
    ? currentView.value
    : selectionMode.value
})

//是否有快捷方式
const hasShortcuts = computed(() => !!shortcuts.length)

//时间格式化
const timeFormat = computed(() => {
  return extractTimeFormat(props.format)
})

//日期格式化
const dateFormat = computed(() => {
  return extractDateFormat(props.format)
})

//显示时间
const visibleTime = computed(() => {
  if (inputTime.value) return inputTime.value
  if (!props.parsedValue && !defaultValue.value) return
  return ((props.parsedValue || innerDate.value) as Dayjs).format(
    timeFormat.value
  )
})

//显示日期
const visibleDate = computed(() => {
  if (inputDate.value) return inputDate.value
  if (!props.parsedValue && !defaultValue.value) return
  return ((props.parsedValue || innerDate.value) as Dayjs).format(
    dateFormat.value
  )
})

/* 源代码
const checkDateWithinRange = (date: ConfigType) => {
  return selectableRange.value.length > 0
    ? timeWithinRange(date, selectableRange.value, props.format || 'HH:mm:ss')
    : true
} */

//格式化发射
const formatEmit = (emitDayjs: Dayjs) => {
  //如果有默认时间,且没有显示时间,设置defaultTimeD的年月日
  if (defaultTime && !visibleTime.value) {
    return defaultTimeD.value
      .year(emitDayjs.year())
      .month(emitDayjs.month())
      .date(emitDayjs.date())
  }
  //如果显示时间,设置当前时间毫秒为0
  if (showTime.value) return emitDayjs.millisecond(0)

  //如果都没有,返回当天
  return emitDayjs.startOf('day')
}
//发送
const emitPick = (value: Dayjs | Dayjs[], ...args: any[]) => {
  /**
   * 如果没有value
   */
  if (!value) {
    emit('pick', value, ...args)
  } else if (isArray(value)) {
    const dates = value.map(formatEmit)
    emit('pick', dates, ...args)
  } else {
    emit('pick', formatEmit(value), ...args)
  }
  inputDate.value = null
  inputTime.value = null
}
/**
 * date的click事件
 * value 日期
 * keepOpen 是否保持picker打开
 */
const handleDatePick = (value: DateTableEmits, keepOpen?: boolean) => {
  if (selectionMode.value === 'date') {
    value = value as Dayjs
    let newDate = props.parsedValue
      ? (props.parsedValue as Dayjs)
          .year(value.year())
          .month(value.month())
          .date(value.date())
      : value
    /* 源代码
    if (!checkDateWithinRange(newDate)) {
      newDate = (selectableRange.value[0][0] as Dayjs)
        .year(value.year())
        .month(value.month())
        .date(value.date())
    } */
    //设置innerDate为newDate
    innerDate.value = newDate
    emitPick(newDate, showTime.value || keepOpen)
  } else if (selectionMode.value === 'week') {
    emitPick((value as WeekPickerEmits).date)
  } else if (selectionMode.value === 'dates') {
    emitPick(value as DatesPickerEmits, true) // set true to keep panel open
  }
}
//month的click事件
const handleMonthPick = async (month: number) => {
  //获取当月首日
  innerDate.value = innerDate.value.month(month).startOf('month')
  if (selectionMode.value === 'month') {
    emitPick(innerDate.value, false)
  } else {
    //当前view是month,但selectionMode不是month是触发
    currentView.value = 'date'
    if (['month', 'year', 'date', 'week'].includes(selectionMode.value)) {
      emitPick(innerDate.value, true)
      await nextTick()
      handleFocusPicker()
    }
  }
  //修改面板为month
  handlePanelChange('month')
}
//year的click事件
const handleYearPick = async (year: number) => {
  if (selectionMode.value === 'year') {
    innerDate.value = innerDate.value.startOf('year').year(year)
    emitPick(innerDate.value, false)
  } else {
    //当前view是year,但selectionMode不是year是触发
    innerDate.value = innerDate.value.year(year)
    currentView.value = 'month'
    if (['month', 'year', 'date', 'week'].includes(selectionMode.value)) {
      emitPick(innerDate.value, true)
      await nextTick()
      handleFocusPicker()
    }
  }
  //修改面板为month
  handlePanelChange('year')
}

//移动月
const moveByMonth = (forward: boolean) => {
  const action = forward ? 'add' : 'subtract'
  innerDate.value = innerDate.value[action](1, 'month')
  handlePanelChange('month')
}

//移动年
const moveByYear = (forward: boolean) => {
  const currentDate = innerDate.value
  const action = forward ? 'add' : 'subtract'

  innerDate.value =
    currentView.value === 'year'
      ? currentDate[action](10, 'year')
      : currentDate[action](1, 'year')

  handlePanelChange('year')
}

//showPicker切换面板
const showPicker = async (view: 'month' | 'year') => {
  currentView.value = view
  await nextTick()
  handleFocusPicker()
}

//确认事件
const onConfirm = () => {
  //如果时dates直接触发
  if (selectionMode.value === 'dates') {
    emitPick(props.parsedValue as Dayjs[])
  } else {
    //如果显示time且并未选择日期时间
    let result = props.parsedValue as Dayjs
    if (!result) {
      //获取默认时间
      const defaultTimeD = dayjs(defaultTime).locale(lang.value)
      //获取默认日期
      const defaultValueD = getDefaultValue()
      //设置默认事件的年月日
      result = defaultTimeD
        .year(defaultValueD.year())
        .month(defaultValueD.month())
        .date(defaultValueD.date())
    }
    //设置innerDate
    innerDate.value = result
    emitPick(result)
  }
}

//设置当前时间为现在
const changeToNow = () => {
  const now = dayjs().locale(lang.value)
  const nowDate = now.toDate()
  /* 源代码 (!disabledDate || !disabledDate(nowDate)) &&
    checkDateWithinRange(nowDate) */
  if (!disabledDate || !disabledDate(nowDate)) {
    innerDate.value = dayjs().locale(lang.value)
    emitPick(innerDate.value)
  }
}

//时选择器聚焦事件
const onTimePickerInputFocus = () => {
  timePickerVisible.value = true
}
//事件选择器关闭事件
const handleTimePickClose = () => {
  timePickerVisible.value = false
}

//解构传入时间的单位
const getUnits = (date: Dayjs) => {
  return {
    hour: date.hour(),
    minute: date.minute(),
    second: date.second(),
    year: date.year(),
    month: date.month(),
    date: date.date(),
  }
}

//时间选择事件
const handleTimePick = (value: Dayjs, visible: boolean, first: boolean) => {
  //获取对应value的小时,分钟,秒
  const { hour, minute, second } = getUnits(value)
  //如果value存在修改value的小时,分钟,秒,否则返回value
  const newDate = props.parsedValue
    ? (props.parsedValue as Dayjs).hour(hour).minute(minute).second(second)
    : value
  innerDate.value = newDate
  //触发emit
  emitPick(innerDate.value, true)
  //如果不是first,关闭事件选择器
  if (!first) {
    timePickerVisible.value = visible
  }
}

//时间输入框change事件
const handleVisibleTimeChange = (value: string) => {
  const newDate = dayjs(value, timeFormat.value).locale(lang.value)
  /* 源代码 newDate.isValid() && checkDateWithinRange(newDate) */
  //如果是timeFormat,触发emitPick
  if (newDate.isValid()) {
    const { year, month, date } = getUnits(innerDate.value)
    //设置newDate
    innerDate.value = newDate.year(year).month(month).date(date)
    //清空inputTime,timePickerVisible
    inputTime.value = null
    timePickerVisible.value = false
    emitPick(innerDate.value, true)
  }
}
//日期输入框change事件,同handleVisibleTimeChange
const handleVisibleDateChange = (value: string) => {
  const newDate = dayjs(value, dateFormat.value).locale(lang.value)
  if (newDate.isValid()) {
    if (disabledDate && disabledDate(newDate.toDate())) {
      return
    }
    const { hour, minute, second } = getUnits(innerDate.value)
    innerDate.value = newDate.hour(hour).minute(minute).second(second)
    inputDate.value = null
    emitPick(innerDate.value, true)
  }
}

//验证value
const isValidValue = (date: unknown) => {
  return (
    //判断是否是dayjs
    dayjs.isDayjs(date) &&
    //验证格式
    date.isValid() &&
    //是否禁用
    (disabledDate ? !disabledDate(date.toDate()) : true)
  )
}

//格式化value
const formatToString = (value: Dayjs | Dayjs[]) => {
  if (selectionMode.value === 'dates') {
    return (value as Dayjs[]).map((item) => item.format(props.format))
  }
  return (value as Dayjs).format(props.format)
}

//格式化
const parseInput = (value: Dayjs) => {
  return dayjs(value, props.format).locale(lang.value)
}

//获取默认日期
const getDefaultValue = () => {
  //如果不存在defaultValue,获取当前日期设置当前时间为默认时间
  if (!defaultValue.value) {
    const defaultTimeDValue = defaultTimeD.value
    return dayjs()
      .hour(defaultTimeDValue.hour())
      .minute(defaultTimeDValue.minute())
      .second(defaultTimeDValue.second())
      .locale(lang.value)
  }

  //解析默认值为dayjs格式,没有就是当前日期
  return dayjs(defaultValue.value).locale(lang.value)
}

//聚焦选择器事件
const handleFocusPicker = async () => {
  if (['week', 'month', 'year', 'date'].includes(selectionMode.value)) {
    //设置聚焦
    currentViewRef.value?.focus()
    //如果是week,触发down键盘事件
    if (selectionMode.value === 'week') {
      handleKeyControl(EVENT_CODE.down)
    }
  }
}

//键盘事件
const handleKeydownTable = (event: KeyboardEvent) => {
  const { code } = event
  //设置eventCode数组
  const validCode = [
    EVENT_CODE.up,
    EVENT_CODE.down,
    EVENT_CODE.left,
    EVENT_CODE.right,
    EVENT_CODE.home,
    EVENT_CODE.end,
    EVENT_CODE.pageUp,
    EVENT_CODE.pageDown,
  ]
  //如果当前事件存在eventCode数组中,执行
  if (validCode.includes(code)) {
    handleKeyControl(code)
    //阻止捕获和冒泡
    event.stopPropagation()
    //阻止默认事件
    event.preventDefault()
  }
  //如果code是enter或者space,且inputDate,inputTime都为空
  if (
    [EVENT_CODE.enter, EVENT_CODE.space].includes(code) &&
    inputDate.value === null &&
    inputTime.value === null
  ) {
    //阻止默认事件
    event.preventDefault()
    //触发emitPick
    emitPick(innerDate.value, false)
  }
}

//键盘事件处理
const handleKeyControl = (code: string) => {
  type KeyControlMappingCallableOffset = (date: Date, step?: number) => number
  type KeyControl = {
    [key: string]:
      | number
      | KeyControlMappingCallableOffset
      | ((date: Date, step: number) => any)
    offset: (date: Date, step: number) => any
  }
  interface KeyControlMapping {
    [key: string]: KeyControl
  }

  //指定key
  const { up, down, left, right, home, end, pageUp, pageDown } = EVENT_CODE

  //键盘控制地图
  const mapping: KeyControlMapping = {
    year: {
      [up]: -4,
      [down]: 4,
      [left]: -1,
      [right]: 1,
      offset: (date: Date, step: number) =>
        date.setFullYear(date.getFullYear() + step),
    },
    month: {
      [up]: -4,
      [down]: 4,
      [left]: -1,
      [right]: 1,
      offset: (date: Date, step: number) =>
        date.setMonth(date.getMonth() + step),
    },
    week: {
      [up]: -1,
      [down]: 1,
      [left]: -1,
      [right]: 1,
      offset: (date: Date, step: number) =>
        date.setDate(date.getDate() + step * 7),
    },
    date: {
      [up]: -7,
      [down]: 7,
      [left]: -1,
      [right]: 1,
      [home]: (date: Date) => -date.getDay(),
      [end]: (date: Date) => -date.getDay() + 6,
      [pageUp]: (date: Date) =>
        -new Date(date.getFullYear(), date.getMonth(), 0).getDate(),
      [pageDown]: (date: Date) =>
        new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(),
      offset: (date: Date, step: number) => date.setDate(date.getDate() + step),
    },
  }

  //获取当前日期
  const newDate = innerDate.value.toDate()

  /* 源代码(暂时注释)
  while (Math.abs(innerDate.value.diff(newDate, 'year', true)) < 1) {
    //获取键盘地图
    const map = mapping[keyboardMode.value]
    if (!map) return
    //调用offset方法
    map.offset(
      newDate,
      isFunction(map[code])
        ? (map[code] as unknown as KeyControlMappingCallableOffset)(newDate)
        : (map[code] as number) ?? 0
    )
    //如果newDate是废弃的,break
    if (disabledDate && disabledDate(newDate)) {
      break
    }
    //否则修改innerDate,触发pick,并break
    const result = dayjs(newDate).locale(lang.value)
    innerDate.value = result
    contextEmit('pick', result, true)
    break
  } */

  //获取键盘地图
  const map = mapping[keyboardMode.value]
  if (!map) return
  //调用offset方法
  map.offset(
    newDate,
    isFunction(map[code])
      ? (map[code] as unknown as KeyControlMappingCallableOffset)(newDate)
      : (map[code] as number) ?? 0
  )
  //如果newDate是废弃的,break
  if (disabledDate && disabledDate(newDate)) {
    return
  }
  //否则修改innerDate,触发pick,并break
  const result = dayjs(newDate).locale(lang.value)
  innerDate.value = result
  /* 源代码(暂时注释)
  emit('pick', result, true) */
  emitPick(result, true)
  return
}

//面板改变事件
const handlePanelChange = (mode: 'month' | 'year') => {
  emit('panel-change', innerDate.value.toDate(), mode, currentView.value)
}

//监听selectionMode,设置当前currentView
watch(
  () => selectionMode.value,
  (val) => {
    //如果是month或者year设置为对应的面板
    if (['month', 'year'].includes(val)) {
      currentView.value = val
      return
    }
    //否则设置为date
    currentView.value = 'date'
  },
  { immediate: true }
)

//监听currentView,更新popper
watch(
  () => currentView.value,
  () => {
    popper?.updatePopper()
  }
)

//监听默认value,修改内部日期
watch(
  () => defaultValue.value,
  (val) => {
    if (val) {
      innerDate.value = getDefaultValue()
    }
  },
  { immediate: true }
)

//监听输入value,设置内部value
watch(
  () => props.parsedValue,
  (val) => {
    if (val) {
      if (selectionMode.value === 'dates') return
      if (Array.isArray(val)) return
      innerDate.value = val
    } else {
      innerDate.value = getDefaultValue()
    }
  },
  { immediate: true }
)
//配置isValidValue
emit('set-picker-option', ['isValidValue', isValidValue])
//配置formatToString
emit('set-picker-option', ['formatToString', formatToString])
//配置parseUserInput
emit('set-picker-option', ['parseInput', parseInput])
//配置handleFocusPicker
emit('set-picker-option', ['handleFocusPicker', handleFocusPicker])
</script>
