<template>
  <div :class="[ns.b('spinner'), { 'has-seconds': showSeconds }]">
    <template v-if="!arrowControl">
      <fl-scrollbar
        v-for="item in spinnerItems"
        :key="item"
        :ref="(scrollbar: unknown) => setRef(scrollbar as any, item)"
        :class="ns.be('spinner', 'wrapper')"
        wrap-style="max-height: inherit;"
        :view-class="ns.be('spinner', 'list')"
        noresize
        tag="ul"
        @mouseenter="emitSelectRange(item)"
        @mousemove="adjustCurrentSpinner(item)"
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
          <!-- 添0截取两位数 -->
          <template v-if="item === 'hours'">
            {{ ('0' + (amPmMode ? key % 12 || 12 : key)).slice(-2)
            }}{{ getAmPmFlag(key) }}
          </template>
          <template v-else>
            {{ ('0' + key).slice(-2) }}
          </template>
        </li>
      </fl-scrollbar>
    </template>
    <template v-if="arrowControl">
      <div
        v-for="item in spinnerItems"
        :key="item"
        :class="[ns.be('spinner', 'wrapper'), ns.is('arrow')]"
        @mouseenter="emitSelectRange(item)"
      >
        <fl-icon
          v-repeat-click="onDecrement"
          :class="['arrow-up', ns.be('spinner', 'arrow')]"
        >
          <arrow-up />
        </fl-icon>
        <fl-icon
          v-repeat-click="onIncrement"
          :class="['arrow-down', ns.be('spinner', 'arrow')]"
        >
          <arrow-down />
        </fl-icon>
        <ul :class="ns.be('spinner', 'list')">
          <li
            v-for="(time, key) in arrowControlTimeList[item]"
            :key="key"
            :class="[
              ns.be('spinner', 'item'),
              ns.is('active', time === timePartials[item]),
              ns.is('disabled', timeList[item][time!]),
            ]"
          >
            <template v-if="typeof time === 'number'">
              <template v-if="item === 'hours'">
                {{ ('0' + (amPmMode ? time % 12 || 12 : time)).slice(-2)
                }}{{ getAmPmFlag(time) }}
              </template>
              <template v-else>
                {{ ('0' + time).slice(-2) }}
              </template>
            </template>
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>
<script lang="ts" setup>
import { computed, nextTick, onMounted, ref, unref, watch } from 'vue'
import { debounce } from 'lodash-unified'
import { useNamespace } from '@follow-ui/hooks'
import { vRepeatClick } from '@follow-ui/directives'
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import { FlIcon } from '../../../icon'
import { FlScrollbar } from '../../../scrollbar'
import {
  basicTimeSpinnerProps,
  buildTimeList,
  getTimeLists,
  timeUnits,
} from '../ts'
import type { TimeList, TimeUnit } from '../ts'
import type { Ref } from 'vue'
import type { ScrollbarInstance } from '../../../scrollbar'

const props = defineProps(basicTimeSpinnerProps)
const emit = defineEmits(['change', 'select-range', 'set-option'])

const ns = useNamespace('time')

//获取各时间单位数组
const { getHoursList, getMinutesList, getSecondsList } = getTimeLists(
  props.disabledHours,
  props.disabledMinutes,
  props.disabledSeconds
)

//是否在滚动中
let isScrolling = false
//当前滚动面板
const currentScrollbar = ref<TimeUnit>()
//小时滚动面板
const listHoursRef = ref<ScrollbarInstance>()
//分钟滚动面板
const listMinutesRef = ref<ScrollbarInstance>()
//秒滚动面板
const listSecondsRef = ref<ScrollbarInstance>()
//refMap
const listRefsMap: Record<TimeUnit, Ref<ScrollbarInstance | undefined>> = {
  hours: listHoursRef,
  minutes: listMinutesRef,
  seconds: listSecondsRef,
}
//旋钮项
const spinnerItems = computed(() => {
  return props.showSeconds ? timeUnits : timeUnits.slice(0, 2)
})

//spinnerDate对应时间单位结构值
const timePartials = computed<Record<TimeUnit, number>>(() => {
  //获取旋钮日期
  const { spinnerDate } = props
  const hours = spinnerDate.hour()
  const minutes = spinnerDate.minute()
  const seconds = spinnerDate.second()
  return { hours, minutes, seconds }
})

//时间列表
const timeList = computed(() => {
  const { hours, minutes } = unref(timePartials)
  return {
    hours: getHoursList(props.role),
    minutes: getMinutesList(hours, props.role),
    seconds: getSecondsList(hours, minutes, props.role),
  }
})

//箭头控制时间列表
const arrowControlTimeList = computed<Record<TimeUnit, TimeList>>(() => {
  const { hours, minutes, seconds } = unref(timePartials)
  return {
    hours: buildTimeList(hours, 23),
    minutes: buildTimeList(minutes, 59),
    seconds: buildTimeList(seconds, 59),
  }
})

//防抖动重置ScrollTop
const debouncedResetScroll = debounce((type) => {
  //设置滚动状态
  isScrolling = false
  adjustCurrentSpinner(type)
}, 200)

//获取ampm标识
const getAmPmFlag = (hour: number) => {
  //判断是否显示amPm
  const shouldShowAmPm = !!props.amPmMode
  if (!shouldShowAmPm) return ''
  const isCapital = props.amPmMode === 'A'
  let content = hour < 12 ? ' am' : ' pm'
  if (isCapital) content = content.toUpperCase()
  return content
}

//发射选中时间单位
const emitSelectRange = (type: TimeUnit) => {
  let range
  switch (type) {
    case 'hours':
      range = [0, 2]
      break
    case 'minutes':
      range = [3, 5]
      break
    case 'seconds':
      range = [6, 8]
      break
  }
  const [left, right] = range
  emit('select-range', left, right)
  currentScrollbar.value = type
}

//跳转当前旋钮
const adjustCurrentSpinner = (type: TimeUnit) => {
  adjustSpinner(type, unref(timePartials)[type])
}

const adjustSpinners = () => {
  adjustCurrentSpinner('hours')
  adjustCurrentSpinner('minutes')
  adjustCurrentSpinner('seconds')
}
//获取滚动条元素
const getScrollbarElement = (el: HTMLElement) =>
  el.querySelector(`.${ns.namespace.value}-scrollbar__wrap`) as HTMLElement
//调整scrollTop以对应value
const adjustSpinner = (type: TimeUnit, value: number) => {
  //如果使用箭头控制,return
  if (props.arrowControl) return
  //获取滚动面板
  const scrollbar = unref(listRefsMap[type])
  if (scrollbar && scrollbar.$el) {
    //设置scrollTop
    getScrollbarElement(scrollbar.$el).scrollTop = Math.max(
      0,
      value * typeItemHeight(type)
    )
  }
}
//对应类型item高度
const typeItemHeight = (type: TimeUnit): number => {
  //滚动面板
  const scrollbar = unref(listRefsMap[type])
  //返回对应li的offsetHeight
  return scrollbar?.$el.querySelector('li').offsetHeight || 0
}

//加
const onIncrement = () => {
  scrollDown(1)
}
//减
const onDecrement = () => {
  scrollDown(-1)
}

//滚动条上下时间
const scrollDown = (step: number) => {
  if (!currentScrollbar.value) {
    emitSelectRange('hours')
  }
  //当前滚动面板
  const label = currentScrollbar.value!
  //当前面板对应具体时间
  const now = unref(timePartials)[label]
  //总数
  const total = currentScrollbar.value === 'hours' ? 24 : 60
  //下一个有效值
  const next = findNextUnDisabled(label, now, step, total)

  //调用change
  emitChange(label, next)
  //更新scroll
  // adjustSpinner(label, next)
  //更新完成后,设置选中事件单位
  nextTick(() => emitSelectRange(label))
}
//找到下一个不是disabled的值
const findNextUnDisabled = (
  type: TimeUnit,
  now: number,
  step: number,
  total: number
) => {
  //获取下一个值
  let next = (now + step + total) % total
  //获取对应时间单位的list
  const list = unref(timeList)[type]
  /**
   *  通过while语句找到下一个不是disabled和now的值
   */
  while (list[next] && next !== now) {
    next = (next + step + total) % total
  }
  return next
}
//发射change
const emitChange = (type: TimeUnit, value: number) => {
  //获取对应list
  const list = unref(timeList)[type]
  const isDisabled = list[value]
  if (isDisabled) return
  //获取旋钮内部日期对应的hours,minutes,seconds
  const { hours, minutes, seconds } = unref(timePartials)
  let changeTo
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
  emit('change', changeTo)
}
//点击事件
const handleClick = (
  type: TimeUnit,
  { value, disabled }: { value: number; disabled: boolean }
) => {
  if (!disabled) {
    emitChange(type, value)
    emitSelectRange(type)
    adjustSpinner(type, value)
  }
}
//滚动事件
const handleScroll = (type: TimeUnit) => {
  //设置滚动中
  isScrolling = true
  //防抖动重置Scroll
  debouncedResetScroll(type)
  const value = Math.min(
    Math.round(
      getScrollbarElement(unref(listRefsMap[type])!.$el).scrollTop /
        typeItemHeight(type)
    ),
    type === 'hours' ? 23 : 59
  )
  emitChange(type, value)
}
//绑定滚动事件
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

onMounted(() => {
  nextTick(() => {
    //如果不是用箭头控制,绑定滚动事件
    !props.arrowControl && bindScrollEvent()
    //同步value和滚动条
    adjustSpinners()
    //如果当前角色为start,设置选中hours
    if (props.role === 'start') emitSelectRange('hours')
  })
})

//获取对应时间单位滚动条的ref
const setRef = (scrollbar: ScrollbarInstance, type: TimeUnit) => {
  listRefsMap[type].value = scrollbar
}

emit('set-option', [`${props.role}_scrollDown`, scrollDown])
emit('set-option', [`${props.role}_emitSelectRange`, emitSelectRange])

//如果更新,当不是在滚动中时,调用adjustSpinners()
watch(
  () => props.spinnerDate,
  () => {
    if (isScrolling) return
    adjustSpinners()
  }
)
</script>
