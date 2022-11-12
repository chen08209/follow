<template>
  <slot :handle-keydown="onKeydown" />
</template>
<script lang="ts" setup>
//@ts-nocheck
import {
  nextTick,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  unref,
  watch,
} from 'vue'
import { isNil } from 'lodash-unified'
import { EVENT_CODE } from '@follow-ui/constants'
import { useEscapeKeydown } from '@follow-ui/hooks'
import { isString } from '@follow-ui/utils'
import {
  FOCUS_AFTER_RELEASED,
  FOCUS_AFTER_TRAPPED,
  FOCUS_AFTER_TRAPPED_OPTS,
  FOCUS_TRAP_INJECTION_KEY,
  ON_RELEASE_FOCUS_EVT,
  ON_TRAP_FOCUS_EVT,
} from '@follow-ui/tokens'

import {
  createFocusOutPreventedEvent,
  focusFirstDescendant,
  focusableStack,
  getEdges,
  isFocusCausedByUserEvent,
  obtainAllFocusableElements,
  tryFocus,
  useFocusReason,
} from './utils'
import type { FocusLayer } from './utils'
import type { PropType } from 'vue'

defineOptions({
  name: 'FlFocusTrap',
  inheritAttrs: false,
})

const props = defineProps({
  loop: Boolean,
  trapped: Boolean,
  focusTrapEl: Object as PropType<HTMLElement>,
  focusStartEl: {
    type: [Object, String] as PropType<'container' | 'first' | HTMLElement>,
    default: 'first',
  },
})

const emit = defineEmits([
  ON_TRAP_FOCUS_EVT,
  ON_RELEASE_FOCUS_EVT,
  'focusin',
  'focusout',
  'focusout-prevented',
  'release-requested',
])

const forwardRef = ref<HTMLElement | undefined>()
let lastFocusBeforeTrapped: HTMLElement | null
let lastFocusAfterTrapped: HTMLElement | null

const { focusReason } = useFocusReason()

//esc事件
useEscapeKeydown((event) => {
  if (props.trapped && !focusLayer.paused) {
    emit('release-requested', event)
  }
})

const focusLayer: FocusLayer = {
  paused: false,
  pause() {
    this.paused = true
  },
  resume() {
    this.paused = false
  },
}

const onKeydown = (e: KeyboardEvent) => {
  if (!props.loop && !props.trapped) return
  if (focusLayer.paused) return

  const { key, altKey, ctrlKey, metaKey, currentTarget, shiftKey } = e
  const { loop } = props
  const isTabbing = key === EVENT_CODE.tab && !altKey && !ctrlKey && !metaKey

  const currentFocusingEl = document.activeElement
  if (isTabbing && currentFocusingEl) {
    const container = currentTarget as HTMLElement
    const [first, last] = getEdges(container)
    const isTabbable = first && last
    if (!isTabbable) {
      if (currentFocusingEl === container) {
        const focusoutPreventedEvent = createFocusOutPreventedEvent({
          focusReason: focusReason.value,
        })
        emit('focusout-prevented', focusoutPreventedEvent)
        if (!focusoutPreventedEvent.defaultPrevented) {
          e.preventDefault()
        }
      }
    } else {
      if (!shiftKey && currentFocusingEl === last) {
        const focusoutPreventedEvent = createFocusOutPreventedEvent({
          focusReason: focusReason.value,
        })
        emit('focusout-prevented', focusoutPreventedEvent)
        if (!focusoutPreventedEvent.defaultPrevented) {
          e.preventDefault()
          if (loop) tryFocus(first, true)
        }
      } else if (
        shiftKey &&
        [first, container].includes(currentFocusingEl as HTMLElement)
      ) {
        const focusoutPreventedEvent = createFocusOutPreventedEvent({
          focusReason: focusReason.value,
        })
        emit('focusout-prevented', focusoutPreventedEvent)
        if (!focusoutPreventedEvent.defaultPrevented) {
          e.preventDefault()
          if (loop) tryFocus(last, true)
        }
      }
    }
  }
}

const trapOnFocus = (e: Event) => {
  emit(ON_TRAP_FOCUS_EVT, e)
}
const releaseOnFocus = (e: Event) => emit(ON_RELEASE_FOCUS_EVT, e)

//聚焦
const onFocusIn = (e: FocusEvent) => {
  const trapContainer = unref(forwardRef)
  if (!trapContainer) return

  const target = e.target as HTMLElement | null
  const relatedTarget = e.relatedTarget as HTMLElement | null

  //判断target是否在容器内
  const isFocusedInTrap = target && trapContainer.contains(target)

  //如果未捕获,设置
  if (!props.trapped) {
    //判断上一个捕获的元素是否在容器内
    const isPrevFocusedInTrap =
      relatedTarget && trapContainer.contains(relatedTarget)
    //如果不在容器内,设置上一个捕获的元素为relatedTarget
    if (!isPrevFocusedInTrap) {
      lastFocusBeforeTrapped = relatedTarget
    }
  }

  if (isFocusedInTrap) emit('focusin', e)

  if (focusLayer.paused) return

  //聚焦最后捕获的元素
  if (props.trapped) {
    if (isFocusedInTrap) {
      lastFocusAfterTrapped = target
    } else {
      tryFocus(lastFocusAfterTrapped, true)
    }
  }
}

//失焦
const onFocusOut = (e: Event) => {
  const trapContainer = unref(forwardRef)
  if (focusLayer.paused || !trapContainer) return

  if (props.trapped) {
    const relatedTarget = (e as FocusEvent).relatedTarget as HTMLElement | null
    if (!isNil(relatedTarget) && !trapContainer.contains(relatedTarget)) {
      setTimeout(() => {
        if (!focusLayer.paused && props.trapped) {
          //创建focusout阻止事件
          const focusoutPreventedEvent = createFocusOutPreventedEvent({
            focusReason: focusReason.value,
          })
          //触发focusoutPreventedEvent
          emit('focusout-prevented', focusoutPreventedEvent)
          //如果没有默认阻止,尝试聚焦最后捕获的聚焦元素
          if (!focusoutPreventedEvent.defaultPrevented) {
            tryFocus(lastFocusAfterTrapped, true)
          }
        }
      }, 0)
    }
  } else {
    const target = e.target as HTMLElement | null
    const isFocusedInTrap = target && trapContainer.contains(target)
    if (!isFocusedInTrap) emit('focusout', e)
  }
}

//开始捕获
const startTrap = async () => {
  await nextTick()
  const trapContainer = unref(forwardRef)
  //如果捕获容器存在
  if (trapContainer) {
    //入栈
    focusableStack.push(focusLayer)
    //获取上一个聚焦的元素
    const prevFocusedElement = trapContainer.contains(document.activeElement)
      ? lastFocusBeforeTrapped
      : document.activeElement

    //设置捕获前的最后一个元素
    lastFocusBeforeTrapped = prevFocusedElement as HTMLElement | null
    //判断上一个聚焦的元素
    const isPrevFocusContained = trapContainer.contains(prevFocusedElement)
    //如果不在
    if (!isPrevFocusContained) {
      //创建event
      const focusEvent = new Event(
        FOCUS_AFTER_TRAPPED,
        FOCUS_AFTER_TRAPPED_OPTS
      )
      trapContainer.addEventListener(FOCUS_AFTER_TRAPPED, trapOnFocus)

      //触发focusEvent
      trapContainer.dispatchEvent(focusEvent)

      //如果没有默认阻止
      if (!focusEvent.defaultPrevented) {
        nextTick(() => {
          //获取focusStartEl
          let focusStartEl = props.focusStartEl

          //如果不是string,尝试聚焦focusStartEl,设置focusStartEl为first
          if (!isString(focusStartEl)) {
            tryFocus(focusStartEl)
            if (document.activeElement !== focusStartEl) {
              focusStartEl = 'first'
            }
          }
          //聚焦第一个可聚焦的元素
          if (focusStartEl === 'first') {
            focusFirstDescendant(
              obtainAllFocusableElements(trapContainer),
              true
            )
          }
          //聚焦当前容器
          if (
            document.activeElement === prevFocusedElement ||
            focusStartEl === 'container'
          ) {
            tryFocus(trapContainer)
          }
        })
      }
    }
  }
}

//停止捕获
const stopTrap = () => {
  //获取容器
  const trapContainer = unref(forwardRef)

  if (trapContainer) {
    //移除监听
    trapContainer.removeEventListener(FOCUS_AFTER_TRAPPED, trapOnFocus)

    //创建releasedEvent监听事件
    const releasedEvent = new CustomEvent(FOCUS_AFTER_RELEASED, {
      ...FOCUS_AFTER_TRAPPED_OPTS,
      detail: {
        focusReason: focusReason.value,
      },
    })
    trapContainer.addEventListener(FOCUS_AFTER_RELEASED, releaseOnFocus)
    //触发releasedEvent事件
    trapContainer.dispatchEvent(releasedEvent)
    //如果没有默认阻止,且来自键盘或者非用户引起,尝试聚焦捕获前的最后后一个元素
    if (
      !releasedEvent.defaultPrevented &&
      (focusReason.value == 'keyboard' || !isFocusCausedByUserEvent())
    ) {
      tryFocus(lastFocusBeforeTrapped ?? document.body, true)
    }

    //移除监听
    trapContainer.removeEventListener(FOCUS_AFTER_RELEASED, trapOnFocus)

    //出栈
    focusableStack.remove(focusLayer)
  }
}

onMounted(() => {
  if (props.trapped) {
    startTrap()
  }

  watch(
    () => props.trapped,
    (trapped) => {
      if (trapped) {
        startTrap()
      } else {
        stopTrap()
      }
    }
  )
})

onBeforeUnmount(() => {
  if (props.trapped) {
    stopTrap()
  }
})

provide(FOCUS_TRAP_INJECTION_KEY, {
  focusTrapRef: forwardRef,
  onKeydown,
})

//监听focusTrapEl修改forwardRef
watch(
  () => props.focusTrapEl,
  (focusTrapEl) => {
    if (focusTrapEl) {
      forwardRef.value = focusTrapEl
    }
  },
  { immediate: true }
)

//监听forwardRef,添加监听事件
watch([forwardRef], ([forwardRef], [oldForwardRef]) => {
  if (forwardRef) {
    forwardRef.addEventListener('keydown', onKeydown)
    forwardRef.addEventListener('focusin', onFocusIn)
    forwardRef.addEventListener('focusout', onFocusOut)
  }
  if (oldForwardRef) {
    oldForwardRef.removeEventListener('keydown', onKeydown)
    oldForwardRef.removeEventListener('focusin', onFocusIn)
    oldForwardRef.removeEventListener('focusout', onFocusOut)
  }
})
</script>
