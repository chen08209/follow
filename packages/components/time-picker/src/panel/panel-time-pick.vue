<template>
  <transition :name="transitionName">
    <div v-if="actualVisible || visible" :class="ns.b('panel')">
      <div :class="[ns.be('panel', 'content'), { 'has-seconds': showSeconds }]">
        <time-spinner
          ref="spinner"
          :role="datetimeRole || 'start'"
          :arrow-control="arrowControl"
          :show-seconds="showSeconds"
          :am-pm-mode="amPmMode"
          :spinner-date="(parsedValue as any)"
          :disabled-hours="disabledHours"
          :disabled-minutes="disabledMinutes"
          :disabled-seconds="disabledSeconds"
          @change="handleChange"
          @set-option="onSetOption"
          @select-range="setSelectionRange"
        />
      </div>
      <div :class="ns.be('panel', 'footer')">
        <button
          type="button"
          :class="[ns.be('panel', 'btn'), 'cancel']"
          @click="handleCancel"
        >
          {{ t('fl.datepicker.cancel') }}
        </button>
        <button
          type="button"
          :class="[ns.be('panel', 'btn'), 'confirm']"
          @click="handleConfirm()"
        >
          {{ t('fl.datepicker.confirm') }}
        </button>
      </div>
    </div>
  </transition>
</template>

<script lang="ts" setup>
import { computed, inject, ref } from 'vue'
import dayjs from 'dayjs'
import { EVENT_CODE } from '@follow-ui/constants'
import { useLocale, useNamespace } from '@follow-ui/hooks'
import { isUndefined } from '@follow-ui/utils'

import { PICKER_BASE } from '@follow-ui/tokens'
import TimeSpinner from '../basic/basic-time-spinner.vue'

import {
  buildAvailableTimeSlotGetter,
  panelTimePickerProps,
  useOldValue,
  useTimePanel,
} from '../ts'
import type { Dayjs } from 'dayjs'

const props = defineProps(panelTimePickerProps)
const emit = defineEmits(['pick', 'select-range', 'set-picker-option'])

//注入参数
const pickerBase = inject(PICKER_BASE) as any
const {
  arrowControl,
  disabledHours,
  disabledMinutes,
  disabledSeconds,
  defaultValue,
} = pickerBase.props

//获取AvailableTimeGetter
const { getAvailableHours, getAvailableMinutes, getAvailableSeconds } =
  buildAvailableTimeSlotGetter(disabledHours, disabledMinutes, disabledSeconds)

/**
 * getAvailableTime 获取有效时间
 * timePickerOptions 时间选择器配置
 * onSetOption 设置时间选择器函数
 */
const { timePickerOptions, onSetOption, getAvailableTime } = useTimePanel({
  getAvailableHours,
  getAvailableMinutes,
  getAvailableSeconds,
})

const ns = useNamespace('time')
const { t, lang } = useLocale()

//选择的时间单位,默认选中小时
const selectionRange = ref([0, 2])
//获取关闭前的parsedValue
const oldValue = useOldValue(props)

//动画类名,如果actualVisible不存在,设置为time-zoom-in-top,否则为null
const transitionName = computed(() => {
  return isUndefined(props.actualVisible)
    ? `${ns.namespace.value}-zoom-in-top`
    : ''
})
//是否显示秒
const showSeconds = computed(() => {
  return props.format.includes('ss')
})
//大小写ampm
const amPmMode = computed(() => {
  if (props.format.includes('A')) return 'A'
  if (props.format.includes('a')) return 'a'
  return ''
})
//判断date是否有效
const isValidValue = (date: Dayjs) => {
  const parsedDate = dayjs(date).locale(lang.value)
  const result = getRangeAvailableTime(parsedDate)
  return parsedDate.isSame(result)
}
//取消,触发emit,返回oldValue
const handleCancel = () => {
  emit('pick', oldValue.value, false)
}
//确认,触发emit,返回parsedValue
const handleConfirm = (visible = false, first = false) => {
  if (first) return
  emit('pick', props.parsedValue, visible)
}

const handleChange = (date: Dayjs) => {
  //如果picker不显示,return
  if (!props.visible) {
    return
  }
  //获取date有效时间,设置毫秒数为0
  const result = getRangeAvailableTime(date).millisecond(0)
  //触发pick,并关闭弹窗
  emit('pick', result, true)
}

//设置选中的时间单位
const setSelectionRange = (start: number, end: number) => {
  emit('select-range', start, end)
  selectionRange.value = [start, end]
}

//改变选中的时间单位
const changeSelectionRange = (step: number) => {
  //对应时间单位范围的起始Index数组
  const list = [0, 3].concat(showSeconds.value ? [6] : [])
  //对应时间单位的数组
  const mapping = ['hours', 'minutes'].concat(
    showSeconds.value ? ['seconds'] : []
  )
  const index = list.indexOf(selectionRange.value[0])
  //找到下一个index
  const next = (index + step + list.length) % list.length
  //触发对应面板传入的start_emitSelectRange函数,例如spinner
  timePickerOptions['start_emitSelectRange'](mapping[next])
}

/**
 * 判断date是否有效,有效返回相同值,无效返回date对应类型有效数组的对应第一个数
 * @param date dayjs日期
 * getAvailableTime (date:时间,props.datetimeRole:角色,true:是否返回对应类型有效数组的第一个数)
 */
const getRangeAvailableTime = (date: Dayjs) => {
  return getAvailableTime(date, props.datetimeRole || '', true)
}
//picker-option handleKeydownInput
const handleKeydown = (event: KeyboardEvent) => {
  const code = event.code
  const { left, right, up, down } = EVENT_CODE

  //如果是左右
  if ([left, right].includes(code)) {
    const step = code === left ? -1 : 1
    changeSelectionRange(step)
    event.preventDefault()
    return
  }

  //如果是上下
  if ([up, down].includes(code)) {
    const step = code === up ? -1 : 1
    //触发对应面板传入的参数,例如spinner
    timePickerOptions['start_scrollDown'](step)
    event.preventDefault()
    return
  }
}
//picker-option parseInput
const parseInput = (value: Dayjs) => {
  if (!value) return null
  return dayjs(value, props.format).locale(lang.value)
}
//picker-option formatToString
const formatToString = (value: Dayjs) => {
  if (!value) return null
  return value.format(props.format)
}
//picker-option getDefaultValue
const getDefaultValue = () => {
  return dayjs(defaultValue).locale(lang.value)
}

emit('set-picker-option', ['isValidValue', isValidValue])
emit('set-picker-option', ['formatToString', formatToString])
emit('set-picker-option', ['parseInput', parseInput])
emit('set-picker-option', ['handleKeydownInput', handleKeydown])
emit('set-picker-option', ['getRangeAvailableTime', getRangeAvailableTime])
emit('set-picker-option', ['getDefaultValue', getDefaultValue])
</script>
