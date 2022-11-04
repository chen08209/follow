<template>
  <div
    :class="[
      ppNs.b(),
      drpNs.b(),
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
        <div v-if="showTime" :class="drpNs.e('time-header')">
          <span :class="drpNs.e('editors-wrap')">
            <span :class="drpNs.e('time-picker-wrap')">
              <fl-input
                size="small"
                :disabled="rangeState.selecting"
                :placeholder="t('fl.datepicker.startDate')"
                :class="drpNs.e('editor')"
                :model-value="minVisibleDate"
                :validate-event="false"
                @input="(val) => handleDateInput(val, 'min')"
                @change="(val) => handleDateChange(val, 'min')"
              />
            </span>
            <span
              v-clickoutside="handleMinTimeClose"
              :class="drpNs.e('time-picker-wrap')"
            >
              <!-- start输入框 -->
              <fl-input
                size="small"
                :class="drpNs.e('editor')"
                :disabled="rangeState.selecting"
                :placeholder="t('fl.datepicker.startTime')"
                :model-value="minVisibleTime"
                :validate-event="false"
                @focus="minTimePickerVisible = true"
                @input="(val) => handleTimeInput(val, 'min')"
                @change="(val) => handleTimeChange(val, 'min')"
              />
              <time-pick-panel
                :visible="minTimePickerVisible"
                :format="timeFormat"
                datetime-role="start"
                :time-arrow-control="arrowControl"
                :parsed-value="leftDate"
                @pick="handleMinTimePick"
              />
            </span>
          </span>
          <span>
            <fl-icon><arrow-right /></fl-icon>
          </span>
          <span :class="drpNs.e('editors-wrap')" class="is-right">
            <span :class="drpNs.e('time-picker-wrap')">
              <!-- end输入框 -->
              <fl-input
                size="small"
                :class="drpNs.e('editor')"
                :disabled="rangeState.selecting"
                :placeholder="t('fl.datepicker.endDate')"
                :model-value="maxVisibleDate"
                :readonly="!minDate"
                :validate-event="false"
                @input="(val) => handleDateInput(val, 'max')"
                @change="(val) => handleDateChange(val, 'max')"
              />
            </span>
            <span
              v-clickoutside="handleMaxTimeClose"
              :class="drpNs.e('time-picker-wrap')"
            >
              <fl-input
                size="small"
                :class="drpNs.e('editor')"
                :disabled="rangeState.selecting"
                :placeholder="t('fl.datepicker.endTime')"
                :model-value="maxVisibleTime"
                :readonly="!minDate"
                :validate-event="false"
                @focus="minDate && (maxTimePickerVisible = true)"
                @input="(val) => handleTimeInput(val, 'max')"
                @change="(val) => handleTimeChange(val, 'max')"
              />
              <time-pick-panel
                datetime-role="end"
                :visible="maxTimePickerVisible"
                :format="timeFormat"
                :time-arrow-control="arrowControl"
                :parsed-value="rightDate"
                @pick="handleMaxTimePick"
              />
            </span>
          </span>
        </div>
        <div :class="[ppNs.e('content'), drpNs.e('content')]" class="is-left">
          <div :class="drpNs.e('header')">
            <div>
              <fl-button
                text
                circle
                :icon="DArrowLeft"
                :class="ppNs.e('icon-btn')"
                @click="leftPrevYear"
              />
              <fl-button
                text
                circle
                class="arrow-left"
                :icon="ArrowLeft"
                :class="ppNs.e('icon-btn')"
                @click="leftPrevMonth"
              />
            </div>
            <div>{{ leftLabel }}</div>
          </div>
          <date-table
            selection-mode="range"
            :date="leftDate"
            :min-date="minDate"
            :max-date="maxDate"
            :range-state="rangeState"
            :disabled-date="disabledDate"
            :cell-class-name="cellClassName"
            @changerange="handleChangeRange"
            @pick="handleRangePick"
            @select="onSelect"
          />
        </div>
        <div :class="[ppNs.e('content'), drpNs.e('content')]" class="is-right">
          <div :class="drpNs.e('header')">
            <div>{{ rightLabel }}</div>
            <div>
              <fl-button
                text
                circle
                :icon="ArrowRight"
                :class="ppNs.e('icon-btn')"
                @click="rightNextMonth"
              />
              <fl-button
                text
                circle
                :icon="DArrowRight"
                :class="ppNs.e('icon-btn')"
                @click="rightNextYear"
              />
            </div>
          </div>
          <date-table
            selection-mode="range"
            :date="rightDate"
            :min-date="minDate"
            :max-date="maxDate"
            :range-state="rangeState"
            :disabled-date="disabledDate"
            :cell-class-name="cellClassName"
            @changerange="handleChangeRange"
            @pick="handleRangePick"
            @select="onSelect"
          />
        </div>
      </div>
    </div>
    <div v-if="showTime" :class="ppNs.e('footer')">
      <fl-button
        v-if="clearable"
        text
        size="small"
        :class="ppNs.e('link-btn')"
        @click="handleClear"
      >
        {{ t('fl.datepicker.clear') }}
      </fl-button>
      <fl-button
        plain
        size="small"
        :class="ppNs.e('link-btn')"
        :disabled="btnDisabled"
        @click="handleRangeConfirm(false)"
      >
        {{ t('fl.datepicker.confirm') }}
      </fl-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject, ref, toRef, unref } from 'vue'
import dayjs from 'dayjs'
import { ClickOutside as vClickoutside } from '@follow-ui/directives'
import { isArray } from '@follow-ui/utils'
import { useLocale } from '@follow-ui/hooks'
import { PICKER_BASE } from '@follow-ui/tokens'
import {
  ArrowLeft,
  ArrowRight,
  DArrowLeft,
  DArrowRight,
} from '@element-plus/icons-vue'
import {
  TimePickPanel,
  extractDateFormat,
  extractTimeFormat,
} from '../../../time-picker'
import { FlIcon } from '../../../icon'
import { FlInput } from '../../../input'
import { FlButton } from '../../../button'
import {
  getDefaultValue,
  isValidRange,
  panelDateRangeProps,
  useRangePicker,
} from '../ts'
import DateTable from '../basic/basic-date-table.vue'

import type { Dayjs } from 'dayjs'

type ChangeType = 'min' | 'max'
type UserInput = {
  min: string | null
  max: string | null
}

const props = defineProps(panelDateRangeProps)
const emit = defineEmits([
  'pick',
  'set-picker-option',
  'calendar-change',
  'panel-change',
])
const unit = 'month'
const pickerBase = inject(PICKER_BASE) as any
const {
  disabledDate,
  cellClassName,
  format,
  defaultTime,
  arrowControl,
  clearable,
} = pickerBase.props
const shortcuts = toRef(pickerBase.props, 'shortcuts')
const defaultValue = toRef(pickerBase.props, 'defaultValue')
const { lang } = useLocale()
//当前日期,左面板内部日期
const leftDate = ref<Dayjs>(dayjs().locale(lang.value))
//当前日期的下一个月,右面板内部日期
const rightDate = ref<Dayjs>(dayjs().locale(lang.value).add(1, unit))

const minTimePickerVisible = ref(false)
const maxTimePickerVisible = ref(false)

const {
  //最小日期,实际展示值
  minDate,
  //最大日期,实际展示值
  maxDate,
  //范围状态
  rangeState,
  ppNs,
  drpNs,
  handleChangeRange,
  handleRangeConfirm,
  handleShortcutClick,
  onSelect,
  t,
} = useRangePicker(props, {
  defaultValue,
  leftDate,
  rightDate,
  unit,
  onParsedValueChanged,
})

//用于控制输入时显示
const inputDate = ref<UserInput>({
  min: null,
  max: null,
})
const inputTime = ref<UserInput>({
  min: null,
  max: null,
})

/**
 * 左右label
 * fl.datepicker.month+n获取指定月的本地化配置
 */
const leftLabel = computed(() => {
  return `${leftDate.value.year()} ${t('fl.datepicker.year')} ${t(
    `fl.datepicker.month${leftDate.value.month() + 1}`
  )}`
})
const rightLabel = computed(() => {
  return `${rightDate.value.year()} ${t('fl.datepicker.year')} ${t(
    `fl.datepicker.month${rightDate.value.month() + 1}`
  )}`
})
// //获取本月年份
// const leftYear = computed(() => {
//   return leftDate.value.year()
// })
// //获取本月月份
// const leftMonth = computed(() => {
//   return leftDate.value.month()
// })
// //获取下一个月的年份
// const rightYear = computed(() => {
//   return rightDate.value.year()
// })
// //获取下一个月的月份
// const rightMonth = computed(() => {
//   return rightDate.value.month()
// })

//是否有快捷操作
const hasShortcuts = computed(() => !!shortcuts.value.length)

//最小显示日期,优先显示输入框的值,当min为空时,显示minDate
const minVisibleDate = computed(() => {
  if (inputDate.value.min !== null) return inputDate.value.min
  if (minDate.value) return minDate.value.format(dateFormat.value)
  return ''
})
//最大显示日期
const maxVisibleDate = computed(() => {
  if (inputDate.value.max !== null) return inputDate.value.max
  if (maxDate.value || minDate.value)
    return (maxDate.value || minDate.value)!.format(dateFormat.value)
  return ''
})
//最小显示时间
const minVisibleTime = computed(() => {
  if (inputTime.value.min !== null) return inputTime.value.min
  if (minDate.value) return minDate.value.format(timeFormat.value)
  return ''
})
//最大显示时间
const maxVisibleTime = computed(() => {
  if (inputTime.value.max !== null) return inputTime.value.max
  if (maxDate.value || minDate.value)
    return (maxDate.value || minDate.value)!.format(timeFormat.value)
  return ''
})

//时间格式化
const timeFormat = computed(() => {
  return extractTimeFormat(format)
})
//日期格式化
const dateFormat = computed(() => {
  return extractDateFormat(format)
})

//左面板上一年
const leftPrevYear = () => {
  leftDate.value = leftDate.value.subtract(1, 'year')
  // //如果联动面板
  // if (!props.unlinkPanels) {
  //   //修改rightDate
  //   rightDate.value = leftDate.value.add(1, 'month')
  // }
  rightDate.value = leftDate.value.add(1, 'month')
  handlePanelChange('year')
}
//左面板上一月
const leftPrevMonth = () => {
  leftDate.value = leftDate.value.subtract(1, 'month')
  // if (!props.unlinkPanels) {
  //   rightDate.value = leftDate.value.add(1, 'month')
  // }
  rightDate.value = leftDate.value.add(1, 'month')
  handlePanelChange('month')
}
const rightNextYear = () => {
  leftDate.value = leftDate.value.add(1, 'year')
  rightDate.value = leftDate.value.add(1, 'month')
  handlePanelChange('year')
}

const rightNextMonth = () => {
  leftDate.value = leftDate.value.add(1, 'month')
  rightDate.value = leftDate.value.add(1, 'month')
  handlePanelChange('month')
}

//面板change事件
const handlePanelChange = (mode: 'month' | 'year') => {
  emit(
    'panel-change',
    [leftDate.value.toDate(), rightDate.value.toDate()],
    mode
  )
}

//按钮是否禁用
const btnDisabled = computed(() => {
  return !(
    minDate.value &&
    maxDate.value &&
    //是否不在选择中
    !rangeState.value.selecting &&
    //值是否有效
    isValidRange([minDate.value, maxDate.value])
  )
})

//是否显示时间
const showTime = computed(
  () => props.type === 'datetime' || props.type === 'datetimerange'
)

/**
 * 格式化emit
 * @param emitDayjs 传入的dayjs数据
 * @param index 索引
 * 如果有默认时间,设置传入的dayjs数据的时间为默认时间
 * 返回传入的dayjs数据
 */
const formatEmit = (emitDayjs: Dayjs | null, index?: number) => {
  if (!emitDayjs) return
  if (defaultTime) {
    const defaultTimeD = dayjs(
      defaultTime[index as number] || defaultTime
    ).locale(lang.value)
    return defaultTimeD
      .year(emitDayjs.year())
      .month(emitDayjs.month())
      .date(emitDayjs.date())
  }
  return emitDayjs
}

//处理点击事件
const handleRangePick = (
  val: {
    minDate: Dayjs
    maxDate: Dayjs | null
  },
  close = true
) => {
  const minTemp = val.minDate
  const maxTemp = val.maxDate
  const minDateTemp = formatEmit(minTemp, 0)
  const maxDateTemp = formatEmit(maxTemp, 1)

  //如果没变,不修改
  if (maxDate.value === maxDateTemp && minDate.value === minDateTemp) {
    return
  }
  //否则发射calendar-change事件
  emit('calendar-change', [minTemp.toDate(), maxTemp && maxTemp.toDate()])
  //修改maxDate,minDate
  maxDate.value = maxDateTemp
  minDate.value = minDateTemp

  //如果不close或者显示时间,返回,否则调用handleRangeConfirm
  if (!close || showTime.value) return
  handleRangeConfirm()
}

//关闭minTimePicker
const handleMinTimeClose = () => {
  minTimePickerVisible.value = false
}
//关闭maxTimePicker
const handleMaxTimeClose = () => {
  maxTimePickerVisible.value = false
}

//input事件
const handleDateInput = (value: string | null, type: ChangeType) => {
  //设置input日期对应值
  inputDate.value[type] = value
  //获取对应解析值
  const parsedValueD = dayjs(value, dateFormat.value).locale(lang.value)
  //如果通过验证,设置对应的leftDate | minDate | rightDate | maxDate
  if (parsedValueD.isValid()) {
    //如果disable
    if (disabledDate && disabledDate(parsedValueD.toDate())) {
      return
    }
    if (type === 'min') {
      leftDate.value = parsedValueD
      minDate.value = (minDate.value || leftDate.value)
        .year(parsedValueD.year())
        .month(parsedValueD.month())
        .date(parsedValueD.date())
      if (!props.unlinkPanels) {
        rightDate.value = parsedValueD.add(1, 'month')
        maxDate.value = minDate.value.add(1, 'month')
      }
    } else {
      rightDate.value = parsedValueD
      maxDate.value = (maxDate.value || rightDate.value)
        .year(parsedValueD.year())
        .month(parsedValueD.month())
        .date(parsedValueD.date())
      if (!props.unlinkPanels) {
        leftDate.value = parsedValueD.subtract(1, 'month')
        minDate.value = maxDate.value.subtract(1, 'month')
      }
    }
  }
}

const handleDateChange = (_: unknown, type: ChangeType) => {
  inputDate.value[type] = null
}

const handleTimeInput = (value: string | null, type: ChangeType) => {
  inputTime.value[type] = value
  const parsedValueD = dayjs(value, timeFormat.value).locale(lang.value)

  if (parsedValueD.isValid()) {
    if (type === 'min') {
      //显示minTime选择器
      minTimePickerVisible.value = true
      minDate.value = (minDate.value || leftDate.value)
        .hour(parsedValueD.hour())
        .minute(parsedValueD.minute())
        .second(parsedValueD.second())
      leftDate.value = minDate.value
      //如果maxDate不存在或者maxDate在minDate之前,设置maxDate为minDate
      if (!maxDate.value || maxDate.value.isBefore(minDate.value)) {
        maxDate.value = minDate.value
      }
    } else {
      //显示maxTime选择器
      maxTimePickerVisible.value = true
      maxDate.value = (maxDate.value || rightDate.value)
        .hour(parsedValueD.hour())
        .minute(parsedValueD.minute())
        .second(parsedValueD.second())
      rightDate.value = maxDate.value
      //如果maxDate存在且maxDate在minDate之前,设置minDate为maxDate
      if (maxDate.value && maxDate.value.isBefore(minDate.value)) {
        minDate.value = maxDate.value
      }
    }
  }
}

const handleTimeChange = (_: unknown, type: ChangeType) => {
  //清空指定inputTime
  inputTime.value[type] = null
  /* (源代码) if (type === 'min') {
    leftDate.value = minDate.value!
  } else {
    rightDate.value = maxDate.value!
  } */
  minTimePickerVisible.value = false
}

//处理minTime点击事件
const handleMinTimePick = (value: Dayjs, visible: boolean, first: boolean) => {
  //如果不存在,返回
  if (inputTime.value.min) return
  //判断value是否存在,用于修改leftDate,minDate
  if (value) {
    leftDate.value = value
    minDate.value = (minDate.value || leftDate.value)
      .hour(value.hour())
      .minute(value.minute())
      .second(value.second())
  }

  if (!first) {
    minTimePickerVisible.value = visible
  }

  if (!maxDate.value || maxDate.value.isBefore(minDate.value)) {
    maxDate.value = minDate.value
    rightDate.value = value
  }
}

//同handleMinTimePick
const handleMaxTimePick = (
  value: Dayjs | null,
  visible: boolean,
  first: boolean
) => {
  if (inputTime.value.max) return
  if (value) {
    rightDate.value = value
    maxDate.value = (maxDate.value || rightDate.value)
      .hour(value.hour())
      .minute(value.minute())
      .second(value.second())
  }

  if (!first) {
    maxTimePickerVisible.value = visible
  }

  if (maxDate.value && maxDate.value.isBefore(minDate.value)) {
    minDate.value = maxDate.value
  }
}

//清除事件
const handleClear = () => {
  //设置leftDate为默认值
  leftDate.value = getDefaultValue(unref(defaultValue), {
    lang: unref(lang),
    unit: 'month',
    unlinkPanels: props.unlinkPanels,
  })[0]
  //设置right为leftDate + 1
  rightDate.value = leftDate.value.add(1, 'month')
  emit('pick', null)
}

//通过format,转化为string
const formatToString = (value: Dayjs | Dayjs[]) => {
  return isArray(value)
    ? value.map((item) => item.format(format))
    : value.format(format)
}

//解析用户输入
const parseInput = (value: Dayjs | Dayjs[]) => {
  return isArray(value)
    ? value.map((item) => dayjs(item, format).locale(lang.value))
    : dayjs(value, format).locale(lang.value)
}

//传入值改变事件
function onParsedValueChanged(
  minDate: Dayjs | undefined,
  maxDate: Dayjs | undefined
) {
  //如果面板不联动,且有最大值
  if (props.unlinkPanels && maxDate) {
    const minDateYear = minDate?.year() || 0
    const minDateMonth = minDate?.month() || 0
    const maxDateYear = maxDate.year()
    const maxDateMonth = maxDate.month()
    //当最小日期和最大日期年月相同时,设置rightDate为最大日期加一月,否则设置为minDate
    rightDate.value =
      minDateYear === maxDateYear && minDateMonth === maxDateMonth
        ? maxDate.add(1, unit)
        : maxDate
  } else {
    //否则设置rightDate为leftDate + 1
    rightDate.value = leftDate.value.add(1, unit)
    //如果最大日期存在,修改rightDate
    if (maxDate) {
      rightDate.value = rightDate.value
        .hour(maxDate.hour())
        .minute(maxDate.minute())
        .second(maxDate.second())
    }
  }
}
//判断是否是时间范围
emit('set-picker-option', ['isValidValue', isValidRange])
//解析用户输入
emit('set-picker-option', ['parseInput', parseInput])
//格式化
emit('set-picker-option', ['formatToString', formatToString])
//清除事件
emit('set-picker-option', ['handleClear', handleClear])
</script>
