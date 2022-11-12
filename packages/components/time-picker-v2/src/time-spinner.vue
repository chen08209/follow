<template>
  <div ref="spinner" :class="[ns.b('spinner'), { 'has-seconds': showSeconds }]">
    <fl-scrollbar
      v-for="item in spinnerItems"
      :key="item"
      :ref="(scrollbar: unknown) => setRef(scrollbar as any, item)"
      :class="ns.be('spinner', 'wrapper')"
      wrap-style="max-height: inherit;"
      :view-class="ns.be('spinner', 'list')"
      noresize
      tag="ul"
    >
      <li
        v-for="(disabled, key) in timeList[item]"
        :key="key"
        :class="[
          ns.be('spinner', 'item'),
          ns.is('active', key === timePartials[item]),
          ns.is('disabled', disabled),
        ]"
        @click="handleClick(item, { value: key, disabled })"
      >
        <template v-if="item === 'hours'">
          {{ ('0' + (amPmMode ? key % 12 || 12 : key)).slice(-2)
          }}{{ getAmPmFlag(key) }}
        </template>
        <template v-else>
          {{ ('0' + key).slice(-2) }}
        </template>
      </li>
    </fl-scrollbar>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, unref, watch } from 'vue'
import { useNamespace } from '@follow-ui/hooks'
import { timeUnits } from '@follow-ui/constants'
import { debounce } from 'lodash-unified'
import { useResizeObserver } from '@vueuse/core'
import { FlScrollbar } from '../../scrollbar'
import { timeSpinnerProps } from './props'
import { getTimeLists } from './hooks'
import type { Dayjs } from 'dayjs'
import type { ScrollbarInstance } from '../../scrollbar'
import type { TimeUnit } from '@follow-ui/constants'
import type { Ref } from 'vue'

//是否在滚动中
let isScrolling = false

const props = defineProps(timeSpinnerProps)

const emit = defineEmits(['change', 'select-range', 'set-option'])

const ns = useNamespace('time')

const { getHoursList, getMinutesList, getSecondsList } = getTimeLists(
  props.disabledHours,
  props.disabledMinutes,
  props.disabledSeconds
)

const spinner = ref<HTMLDivElement>()
const listHoursRef = ref<ScrollbarInstance>()
const listMinutesRef = ref<ScrollbarInstance>()
const listSecondsRef = ref<ScrollbarInstance>()

const listRefsMap: Record<TimeUnit, Ref<ScrollbarInstance | undefined>> = {
  hours: listHoursRef,
  minutes: listMinutesRef,
  seconds: listSecondsRef,
}

//获取对应时间单位滚动条的ref
const setRef = (scrollbar: ScrollbarInstance, type: TimeUnit) => {
  listRefsMap[type].value = scrollbar
}

const spinnerItems = computed(() => {
  return props.showSeconds ? timeUnits : timeUnits.slice(0, 2)
})

//spinnerDate对应时间单位结构值
const timePartials = computed<Record<TimeUnit, number>>(() => {
  const { spinnerDate } = props
  const hours = spinnerDate.hour()
  const minutes = spinnerDate.minute()
  const seconds = spinnerDate.second()
  return { hours, minutes, seconds }
})

const timeList = computed(() => {
  const { hours, minutes } = unref(timePartials)
  return {
    hours: getHoursList(props.role),
    minutes: getMinutesList(hours, props.role),
    seconds: getSecondsList(hours, minutes, props.role),
  }
})

//点击事件
const handleClick = (
  type: TimeUnit,
  { value, disabled }: { value: number; disabled: boolean }
) => {
  if (!disabled) {
    emitChange(type, value)
  }
}

//发射change
const emitChange = (type: TimeUnit, value: number) => {
  //获取对应list
  const list = unref(timeList)[type]
  const isDisabled = list[value]
  if (isDisabled) return
  //获取旋钮内部日期对应的hours,minutes,seconds
  const { hours, minutes, seconds } = unref(timePartials)
  let changeTo: Dayjs
  //通过switch修改对应单位时间,并设置changeTo
  switch (type) {
    case 'hours':
      changeTo = props.spinnerDate.hour(value).minute(minutes).second(seconds)
      break
    case 'minutes':
      changeTo = props.spinnerDate.hour(hours).minute(value).second(seconds)
      break
    case 'seconds':
      changeTo = props.spinnerDate.hour(hours).minute(minutes).second(value)
      break
  }
  //发射change事件
  emit('change', changeTo, props.role)
}

//处理滚动条滚动
const getScrollbarElement = (el: HTMLElement) =>
  el.querySelector(`.${ns.namespace.value}-scrollbar__wrap`) as HTMLElement

const bindScrollEvent = () => {
  //绑定方法
  const bindFunction = (type: TimeUnit) => {
    //获取对应滚动面板
    const scrollbar = unref(listRefsMap[type])
    //如果存在
    if (scrollbar && scrollbar.$el) {
      //获取滚动条元素,绑定滚动事件
      getScrollbarElement(scrollbar.$el).onscroll = () => {
        handleScroll(type)
      }
    }
  }
  bindFunction('hours')
  bindFunction('minutes')
  bindFunction('seconds')
}

const debouncedResetScroll = debounce((type) => {
  //设置滚动状态
  isScrolling = false
  adjustCurrentSpinner(type)
}, 200)

const handleScroll = async (type: TimeUnit) => {
  //设置滚动中
  isScrolling = true
  //防抖动重置Scroll
  debouncedResetScroll(type)
  const value = Math.min(
    Math.round(
      (getScrollbarElement(unref(listRefsMap[type])!.$el).scrollTop -
        (scrollBarHeight(type) * 0.5 - 10) / typeItemHeight(type) +
        3) /
        typeItemHeight(type)
    ),
    type === 'hours' ? 23 : 59
  )
  emitChange(type, value)
}

const scrollBarHeight = (type: TimeUnit) => {
  return unref(listRefsMap[type])!.$el.offsetHeight
}

//调整旋钮
const adjustCurrentSpinner = (type: TimeUnit) => {
  adjustSpinner(type, unref(timePartials)[type])
}
const adjustSpinners = () => {
  adjustCurrentSpinner('hours')
  adjustCurrentSpinner('minutes')
  adjustCurrentSpinner('seconds')
}
const adjustSpinner = (type: TimeUnit, value: number) => {
  //获取滚动面板
  const scrollbar = unref(listRefsMap[type])
  if (scrollbar && scrollbar.$el) {
    getScrollbarElement(scrollbar.$el).scrollTop = Math.max(
      0,
      value * typeItemHeight(type)
    )
  }
}
const typeItemHeight = (type: TimeUnit): number => {
  //滚动面板
  const scrollbar = unref(listRefsMap[type])
  //返回对应li的offsetHeight
  return scrollbar?.$el.querySelector('li').offsetHeight || 0
}
const getAmPmFlag = (hour: number) => {
  //判断是否显示amPm
  const shouldShowAmPm = !!props.amPmMode
  if (!shouldShowAmPm) return ''
  const isCapital = props.amPmMode === 'A'
  let content = hour < 12 ? ' am' : ' pm'
  if (isCapital) content = content.toUpperCase()
  return content
}

useResizeObserver(
  () => spinner.value,
  () => {
    bindScrollEvent()
    adjustSpinners()
  }
)

watch(
  () => props.spinnerDate,
  () => {
    setTimeout(() => {
      if (isScrolling) return
      adjustSpinners()
    }, 200)
  }
)
</script>
