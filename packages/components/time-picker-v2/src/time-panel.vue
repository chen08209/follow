<template>
  <transition :name="transitionName">
    <div ref="panel" :class="ns.b('panel')">
      <div :class="[ns.be('panel', 'content'), { 'has-seconds': showSeconds }]">
        <time-spinner
          :role="role"
          :show-seconds="showSeconds"
          :spinner-date="spinnerDate"
          :disabled-hours="normalizedDisabledHours"
          :disabled-minutes="normalizedDisabledMinutes"
          :disabled-seconds="normalizedDisabledSeconds"
          @change="handleChange"
        />
      </div>
      <div :class="[ns.be('panel', 'footer')]">
        <fl-button link :class="ns.be('panel', 'btn')" @click="handleCancel">
          取消
        </fl-button>
        <fl-button
          link
          type="primary"
          :class="[ns.be('panel', 'btn'), 'confirm']"
          @click="handleConfirm"
        >
          确认
        </fl-button>
      </div>
    </div>
  </transition>
</template>
<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { useNamespace } from '@follow-ui/hooks'
import { PICKER_BASE } from '@follow-ui/tokens'
import { union } from 'lodash-unified'
import timeSpinner from './time-spinner.vue'
import { timePanelProps } from './props'
import {
  buildAvailableTimeSlotGetter,
  useOldValue,
  useTimePanel,
} from './hooks'
import type { Dayjs } from 'dayjs'

const props = defineProps(timePanelProps)
const pickerBase = inject(PICKER_BASE) as any
const panel = ref()
const emit = defineEmits(['pick'])
const ns = useNamespace('time')

const { disabledHours, disabledMinutes, disabledSeconds } = pickerBase.props

const { getAvailableHours, getAvailableMinutes, getAvailableSeconds } =
  buildAvailableTimeSlotGetter(disabledHours, disabledMinutes, disabledSeconds)

const { getAvailableTime } = useTimePanel({
  getAvailableHours,
  getAvailableMinutes,
  getAvailableSeconds,
})

const transitionName = computed(() => {
  return `${ns.namespace.value}-zoom-in-top`
})

const spinnerDate = computed(() => {
  if (props.role !== 'end') {
    return props.parsedValue?.[0]
  } else {
    return props.parsedValue?.[1]
  }
})

const oldValue = useOldValue(panel, spinnerDate)

const makeSelectRange = (start: number, end: number) => {
  const result: number[] = []
  for (let i = start; i <= end; i++) {
    result.push(i)
  }
  return result
}

const normalizedDisabledHours = (role: string, compare?: Dayjs) => {
  const defaultDisable = disabledHours ? disabledHours(role) : []
  if (role === 'default') {
    return defaultDisable
  } else {
    const isStart = role === 'start'
    const compareDate =
      compare || (isStart ? props.parsedValue?.[1] : props.parsedValue?.[0])
    const compareHour = compareDate.hour()
    const nextDisable = isStart
      ? makeSelectRange(compareHour + 1, 23)
      : makeSelectRange(0, compareHour - 1)
    //联合数组,排序,去重
    return union(defaultDisable, nextDisable)
  }
}

const normalizedDisabledMinutes = (
  hour: number,
  role: string,
  compare?: Dayjs
) => {
  const defaultDisable = disabledMinutes ? disabledMinutes(hour, role) : []
  if (role === 'default') {
    return disabledMinutes
  } else {
    const isStart = role === 'start'
    const compareDate =
      compare || (isStart ? props.parsedValue?.[1] : props.parsedValue?.[0])
    const compareHour = compareDate.hour()
    if (hour !== compareHour) {
      return defaultDisable
    }
    const compareMinute = compareDate.minute()
    const nextDisable = isStart
      ? makeSelectRange(compareMinute + 1, 59)
      : makeSelectRange(0, compareMinute - 1)
    return union(defaultDisable, nextDisable)
  }
}

const normalizedDisabledSeconds = (
  hour: number,
  minute: number,
  role: string,
  compare?: Dayjs
) => {
  const defaultDisable = disabledSeconds
    ? disabledSeconds(hour, minute, role)
    : []

  if (role === 'default') {
    return defaultDisable
  } else {
    const isStart = role === 'start'
    const compareDate =
      compare || (isStart ? props.parsedValue?.[1] : props.parsedValue?.[0])
    const compareHour = compareDate.hour()
    const compareMinute = compareDate.minute()
    if (hour !== compareHour || minute !== compareMinute) {
      return defaultDisable
    }
    const compareSecond = compareDate.second()
    const nextDisable = isStart
      ? makeSelectRange(compareSecond + 1, 59)
      : makeSelectRange(0, compareSecond - 1)
    return union(defaultDisable, nextDisable)
  }
}

const handleChange = (date: Dayjs, role: string) => {
  //获取date有效时间,设置毫秒数为0
  const result = getRangeAvailableTime(date).millisecond(0)
  //触发pick,不关闭弹窗
  emit('pick', result, role, true)
}

const handleCancel = () => {
  //触发pick,关闭弹窗
  emit('pick', oldValue.value, props.role, false)
}

const handleConfirm = () => {
  emit('pick', spinnerDate.value, props.role, false)
}

const getRangeAvailableTime = (date: Dayjs) => {
  return getAvailableTime(date, props.role, true)
}
</script>
