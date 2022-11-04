<template>
  <div
    ref="popperContentRef"
    tabindex="-1"
    :class="[ns.b(), ns.is('pure', pure), ns.is(effect), popperClass]"
    :style="contentStyle"
    @mouseenter="(e) => $emit('mouseenter', e)"
    @mouseleave="(e) => $emit('mouseleave', e)"
  >
    <fl-focus-trap
      :trapped="trapped"
      :trap-on-focus-in="true"
      :focus-trap-el="popperContentRef"
      :focus-start-el="focusStartRef"
      @focus-after-trapped="onFocusAfterTrapped"
      @focus-after-released="onFocusAfterReleased"
      @focus-in="onFocusInTrap"
      @focus-out-prevented="onFocusOutPrevented"
      @release-requested="onReleaseRequested"
    >
      <slot />
    </fl-focus-trap>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  toRefs,
  unref,
  watch,
} from 'vue'
import { NOOP } from '@vue/shared'
import {
  POPPER_CONTENT_INJECTION_KEY,
  POPPER_INJECTION_KEY,
  formItemContextKey,
} from '@follow-ui/tokens'
import { createPopper } from '@popperjs/core'
import { isElement } from '@follow-ui/utils'
import { useNamespace, useZIndex } from '@follow-ui/hooks'
import { isNil } from 'lodash-unified'
import FlFocusTrap from '../../focus-trap'
import {
  buildPopperOptions,
  popperContentEmits,
  popperContentProps,
  unwrapMeasurableEl,
} from './ts'

import type { WatchStopHandle } from 'vue'

defineOptions({
  name: 'FlPopperContent',
})

const emit = defineEmits(popperContentEmits)

const props = defineProps(popperContentProps)

const { popperInstanceRef, contentRef, triggerRef, role } = inject(
  POPPER_INJECTION_KEY,
  undefined
)!
const formItemContext = inject(formItemContextKey, undefined)
const { nextZIndex } = useZIndex()
const ns = useNamespace('popper')
const popperContentRef = ref<HTMLElement>()
const focusStartRef = ref<string | HTMLElement>('first')

const arrowRef = ref<HTMLElement>()
const arrowOffset = ref<number>()

//从poper.vue注入
provide(POPPER_CONTENT_INJECTION_KEY, {
  arrowRef,
  arrowOffset,
})

if (
  formItemContext &&
  (formItemContext.addInputId || formItemContext.removeInputId)
) {
  provide(formItemContextKey, {
    ...formItemContext,
    addInputId: NOOP,
    removeInputId: NOOP,
  })
}

const contentZIndex = ref<number>(props.zIndex || nextZIndex())

const trapped = ref<boolean>(false)

let triggerTargetAriaStopWatch: WatchStopHandle | undefined = undefined

//计算触发器
const computedReference = computed(
  () => unwrapMeasurableEl(props.referenceEl) || unref(triggerRef)
)

const contentStyle = computed(
  () => [{ zIndex: unref(contentZIndex) }, props.popperStyle] as any
)

const ariaModal = computed<string | undefined>(() => {
  return role && role.value === 'dialog' ? 'false' : undefined
})

//visible监听函数
const togglePopperAlive = () => {
  //可监听性
  const monitorable = { name: 'eventListeners', enabled: props.visible }

  //调用@popperjs上的setOptions,修改modifiers
  unref(popperInstanceRef)?.setOptions?.((options) => {
    return {
      ...options,
      modifiers: [...(options.modifiers || []), monitorable],
    }
  })

  //更新popper但不更新zIndex
  updatePopper(false)

  //关闭popper时关闭捕获,如果开启了focusOnShow,会在开启popper时开启捕获
  if (props.visible && props.focusOnShow) {
    trapped.value = true
  } else if (props.visible === false) {
    trapped.value = false
  }
}

//捕获focus之后
const onFocusAfterTrapped = () => {
  emit('focus')
}

//释放focus之后,重置focusStartRef,触发失焦
const onFocusAfterReleased = () => {
  focusStartRef.value = 'first'
  emit('blur')
}

//聚焦容器时
const onFocusInTrap = (event: FocusEvent) => {
  if (props.visible && !trapped.value) {
    //设置focusStartRef
    if (event.target) {
      focusStartRef.value = event.target as typeof focusStartRef.value
    }
    //开启捕获
    trapped.value = true
    //相关目标如果存在,聚焦
    if (event.relatedTarget) {
      ;(event.relatedTarget as HTMLElement)?.focus()
    }
  }
}

//可阻止的失焦事件
const onFocusOutPrevented = () => {
  if (!props.trapping) {
    trapped.value = false
  }
}

//按下esc,捕获释放,触发close回调
const onReleaseRequested = () => {
  trapped.value = false
  emit('close')
}

//创建popper
const createPopperInstance = ({ referenceEl, popperContentEl, arrowEl }) => {
  const options = buildPopperOptions(props, {
    arrowEl,
    arrowOffset: unref(arrowOffset),
  })

  return createPopper(referenceEl, popperContentEl, options)
}

//更新popper
const updatePopper = (shouldUpdateZIndex = true) => {
  unref(popperInstanceRef)?.update()
  shouldUpdateZIndex && (contentZIndex.value = props.zIndex || nextZIndex())
}

//挂载
onMounted(() => {
  let updateHandle: WatchStopHandle

  //监听reference,创建并更新实例
  watch(
    computedReference,
    (referenceEl) => {
      //清除referenceEl.getBoundingClientRect()的监听
      updateHandle?.()

      //获取popper实例
      const popperInstance = unref(popperInstanceRef)

      //销毁实例
      popperInstance?.destroy?.()

      if (referenceEl) {
        const popperContentEl = unref(popperContentRef)

        //为contentRef赋值
        contentRef.value = popperContentEl

        //创建Popper实例
        popperInstanceRef.value = createPopperInstance({
          referenceEl,
          popperContentEl,
          arrowEl: unref(arrowRef),
        })

        //监听reference视图位置信息，更新Popper
        updateHandle = watch(
          () => referenceEl.getBoundingClientRect(),
          () => updatePopper(),
          {
            immediate: true,
          }
        )
      } else {
        popperInstanceRef.value = undefined
      }
    },
    {
      immediate: true,
    }
  )

  //以下是无障碍相关功能
  watch(
    () => props.triggerTargetEl,
    (triggerTargetEl, prevTriggerTargetEl) => {
      triggerTargetAriaStopWatch?.()
      triggerTargetAriaStopWatch = undefined

      const el = unref(triggerTargetEl || popperContentRef.value)
      const prevEl = unref(prevTriggerTargetEl || popperContentRef.value)
      if (isElement(el)) {
        const { ariaLabel, id } = toRefs(props)
        triggerTargetAriaStopWatch = watch(
          [role, ariaLabel, ariaModal, id],
          (watches) => {
            ;['role', 'aria-label', 'aria-modal', 'id'].forEach((key, idx) => {
              isNil(watches[idx])
                ? el.removeAttribute(key)
                : el.setAttribute(key, watches[idx] as unknown as string)
            })
          },
          { immediate: true }
        )
      }

      if (isElement(prevEl)) {
        ;['role', 'aria-label', 'aria-modal', 'id'].forEach((key) => {
          prevEl.removeAttribute(key)
        })
      }
    },
    { immediate: true }
  )

  //监听可见性
  watch(() => props.visible, togglePopperAlive, { immediate: true })

  //修改箭头
  watch(
    () =>
      buildPopperOptions(props, {
        arrowEl: unref(arrowRef),
        arrowOffset: unref(arrowOffset),
      }),
    (option) => popperInstanceRef.value?.setOptions(option)
  )
})

//停用无障碍监听
onBeforeUnmount(() => {
  triggerTargetAriaStopWatch?.()
  triggerTargetAriaStopWatch = undefined
})

onBeforeUnmount(() => {
  triggerTargetAriaStopWatch?.()
  triggerTargetAriaStopWatch = undefined
})

defineExpose({
  //content实例
  popperContentRef,
  //popper实例
  popperInstanceRef,
  //更新popper
  updatePopper,
  //content样式
  contentStyle,
})
</script>
