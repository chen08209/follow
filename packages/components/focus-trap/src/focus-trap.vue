<template>
  <slot :handle-keydown="onKeydown" />
</template>

<script setup lang="ts">
// @ts-nocheck
import {
  nextTick,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  unref,
  watch,
} from 'vue'
import { EVENT_CODE } from '@follow-ui/constants/aria'
import { useEscapeKeydown } from '@follow-ui/hooks/use-escape-keydown'
import { isString } from '@vueuse/core'
import {
  FOCUS_AFTER_RELEASED,
  FOCUS_AFTER_TRAPPED,
  FOCUS_AFTER_TRAPPED_OPTS,
  FOCUS_TRAP_INJECTION_KEY,
  ON_RELEASE_FOCUS_EVT,
  ON_TRAP_FOCUS_EVT,
  focusFirstDescendant,
  focusableStack,
  getEdges,
  obtainAllFocusableElements,
  tryFocus,
} from './ts'

import type { FocusLayer } from './ts'
import type { PropType } from 'vue'

defineOptions({
  name: 'FlFocusTrap',
  inheritAttrs: false,
})

const props = defineProps({
  loop: Boolean,
  //是否进入捕获状态
  trapped: Boolean,
  //容器
  focusTrapEl: Object as PropType<HTMLElement>,
  focusStartEl: {
    type: [Object, String] as PropType<string | HTMLElement>,
    default: 'first',
  },
})

const emit = defineEmits([
  //开始捕获
  ON_TRAP_FOCUS_EVT,
  //停止捕获
  ON_RELEASE_FOCUS_EVT,
  'focus-in',
  'focus-out',
  'focus-out-prevented',
  //esc事件
  'release-requested',
])

//传入的focusTrapEl,详见watch
const forwardRef = ref<HTMLElement | undefined>()

//进入trap前的最后一个元素
let lastFocusBeforeTrapped: HTMLElement | null

//进入trap后最后点击的元素
let lastFocusAfterTrapped: HTMLElement | null

//按下esc时触发的hook
useEscapeKeydown((event) => {
  //如果已经捕获而且未暂停,执行release-requested
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
  //如果没有聚焦容器
  if (!props.loop && !props.trapped) return

  if (focusLayer.paused) return

  const { key, altKey, ctrlKey, metaKey, currentTarget, shiftKey } = e

  const { loop } = props

  //判断是否点击的是tab键
  const isTabbing = key === EVENT_CODE.tab && !altKey && !ctrlKey && !metaKey

  const currentFocusingEl = document.activeElement

  //如果是tab键,使用gatEdges获得可focus的元素数组边界
  if (isTabbing && currentFocusingEl) {
    const container = currentTarget as HTMLElement

    const [first, last] = getEdges(container)

    //判断是否可以tabbable
    const isTabbable = first && last

    //如果不可以tabbable
    if (!isTabbable) {
      //且当前聚焦的元素正好是target,触发失焦回调
      if (currentFocusingEl === container) {
        //阻止默认操作
        e.preventDefault()
        emit('focus-out-prevented')
      }
    } else {
      /**
       * 如果没有按住shift键，且currentFocusingEl是最后一个可tabbable，触发失焦事件
       * 如果按住了shift键,，tab会往前寻找，如果currentFocusingEl是第一个元素或者是当前元素，触发失焦事件
       */
      if (!shiftKey && currentFocusingEl === last) {
        e.preventDefault()
        if (loop) {
          tryFocus(first, true)
        }
        emit('focus-out-prevented')
      } else if (
        shiftKey &&
        [first, container].includes(currentFocusingEl as HTMLElement)
      ) {
        e.preventDefault()
        if (loop) {
          tryFocus(last, true)
        }
        emit('focus-out-prevented')
      }
    }
  }
}

provide(FOCUS_TRAP_INJECTION_KEY, {
  focusTrapRef: forwardRef,
  onKeydown,
})

//监听传入的容器
watch(
  () => props.focusTrapEl,
  (focusTrapEl) => {
    if (focusTrapEl) {
      forwardRef.value = focusTrapEl
    }
  },
  { immediate: true }
)

//监听forwardRef,为新的容器增加监听事件,移除旧的容器监听事件
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

//捕获聚焦事件
const trapOnFocus = (e: Event) => {
  emit(ON_TRAP_FOCUS_EVT, e)
}

const releaseOnFocus = (e: Event) => emit(ON_RELEASE_FOCUS_EVT, e)

//聚焦事件
const onFocusIn = (e: Event) => {
  //如果不存在容器return
  const trapContainer = unref(forwardRef)
  if (!trapContainer) return

  const target = e.target as HTMLElement | null

  //判断target是否在容器中
  const isFocusedInTrap = target && trapContainer.contains(target)

  //触发focus-in
  if (isFocusedInTrap) {
    emit('focus-in', e)
  }

  //如果已暂停，return
  if (focusLayer.paused) return

  //如果已捕获
  if (props.trapped) {
    if (isFocusedInTrap) {
      //保存最后依次点击的目标
      lastFocusAfterTrapped = target
    } else {
      tryFocus(lastFocusAfterTrapped, true)
    }
  }
}

//失焦事件
const onFocusOut = (e: Event) => {
  //如果已经暂停或者没有捕获容器,return
  const trapContainer = unref(forwardRef)
  if (focusLayer.paused || !trapContainer) return

  //如果是捕获阶段
  if (props.trapped) {
    const relatedTarget = (e as FocusEvent).relatedTarget as HTMLElement | null
    //如果存在辅助目标,且辅助目标不属于trapContainer(当点击的节点不可聚焦时辅助目标为null)
    if (relatedTarget && !trapContainer.contains(relatedTarget)) {
      setTimeout(() => {
        if (!focusLayer.paused && props.trapped) {
          //聚焦进入捕获后最后focus的元素
          tryFocus(lastFocusAfterTrapped, true)
        }
      }, 0)
    }
  } else {
    const target = e.target as HTMLElement | null
    const isFocusedInTrap = target && trapContainer.contains(target)
    if (!isFocusedInTrap) emit('focus-out', e)
  }
}

//开始捕获
async function startTrap() {
  //等待forwardRef赋值完成
  await nextTick()

  //获取捕获容器
  const trapContainer = unref(forwardRef)

  //如果有捕获容器
  if (trapContainer) {
    //入栈
    focusableStack.push(focusLayer)

    const prevFocusedElement = document.activeElement

    //获取进入容器前的activeElement
    lastFocusBeforeTrapped = prevFocusedElement as HTMLElement | null

    //判断当前激活的元素是否在容器内
    const isPrevFocusContained = trapContainer.contains(prevFocusedElement)

    if (!isPrevFocusContained) {
      //自定义focus事件
      const focusEvent = new Event(
        FOCUS_AFTER_TRAPPED,
        FOCUS_AFTER_TRAPPED_OPTS
      )

      //为自定义的聚焦后事件添加监听
      trapContainer.addEventListener(FOCUS_AFTER_TRAPPED, trapOnFocus)

      //触发自定义的聚焦后事件
      trapContainer.dispatchEvent(focusEvent)

      //如果focusEvent未被阻止
      if (!focusEvent.defaultPrevented) {
        nextTick(() => {
          let focusStartEl = props.focusStartEl

          //如果focusStartEl不是string类型,尝试聚焦,如果无法聚焦设置为first
          if (!isString(focusStartEl)) {
            tryFocus(focusStartEl)
            if (document.activeElement !== focusStartEl) {
              focusStartEl = 'first'
            }
          }

          //如果focusStartEl是first
          if (focusStartEl === 'first') {
            focusFirstDescendant(
              obtainAllFocusableElements(trapContainer),
              true
            )
          }

          //如果document.activeElement没变化或者focusStartEl === "container",则tryFocus当前容器
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
function stopTrap() {
  const trapContainer = unref(forwardRef)

  if (trapContainer) {
    trapContainer.removeEventListener(FOCUS_AFTER_TRAPPED, trapOnFocus)

    const releasedEvent = new Event(
      FOCUS_AFTER_RELEASED,
      FOCUS_AFTER_TRAPPED_OPTS
    )

    trapContainer.addEventListener(FOCUS_AFTER_RELEASED, releaseOnFocus)

    trapContainer.dispatchEvent(releasedEvent)

    /* 如果focusEvent未被阻止,判断lastFocusBeforeTrapped是否存在
    如果存在尝试聚焦lastFocusBeforeTrapped，否则尝试聚焦body */
    if (!releasedEvent.defaultPrevented) {
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

  //监听trapped,调用startTrap()或者stopTrap()
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

//卸载阶段
onBeforeUnmount(() => {
  if (props.trapped) {
    stopTrap()
  }
})
</script>
