<template>
  <teleport :disabled="!teleported" :to="appendTo">
    <transition
      :name="transition"
      @after-leave="onTransitionLeave"
      @before-enter="onBeforeEnter"
      @after-enter="onAfterShow"
      @before-leave="onBeforeLeave"
    >
      <fl-popper-content
        v-if="shouldRender"
        v-show="shouldShow"
        :id="id"
        ref="contentRef"
        v-bind="$attrs"
        :aria-label="ariaLabel"
        :aria-hidden="ariaHidden"
        :boundaries-padding="boundariesPadding"
        :fallback-placements="fallbackPlacements"
        :gpu-acceleration="gpuAcceleration"
        :offset="offset"
        :placement="placement"
        :popper-options="popperOptions"
        :strategy="strategy"
        :effect="effect"
        :enterable="enterable"
        :pure="pure"
        :popper-class="popperClass"
        :popper-style="[popperStyle, contentStyle]"
        :reference-el="referenceEl"
        :trigger-target-el="triggerTargetEl"
        :visible="shouldShow"
        :z-index="zIndex"
        @mouseenter="onContentEnter"
        @mouseleave="onContentLeave"
        @blur="onBlur"
        @close="onClose"
      >
        <template v-if="!destroyed">
          <slot />
        </template>
      </fl-popper-content>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { computed, inject, onBeforeUnmount, ref, unref, watch } from 'vue'
import { composeEventHandlers } from '@follow-ui/utils'
import { onClickOutside } from '@vueuse/core'
import { TOOLTIP_INJECTION_KEY } from '@follow-ui/tokens'
import { FlPopperContent } from '../../popper'
import { tooltipContentProps } from './ts'
import type { FlTooltipInjectionContext } from '@follow-ui/tokens'

defineOptions({
  name: 'FlTooltipContent',
  inheritAttrs: false,
})
const props = defineProps(tooltipContentProps)

//组建实例
const contentRef = ref<InstanceType<typeof FlPopperContent> | null>(null)

const intermediateOpen = ref(false)

const entering = ref(false)

const leaving = ref(false)

const destroyed = ref(false)

//从祖组件获取值
const {
  controlled,
  id,
  open,
  trigger,
  onClose,
  onOpen,
  onShow,
  onHide,
  onBeforeShow,
  onBeforeHide,
} = inject(TOOLTIP_INJECTION_KEY, undefined) as FlTooltipInjectionContext

const persistentRef = computed(() => {
  if (process.env.NODE_ENV === 'test') {
    return true
  }
  return props.persistent
})

onBeforeUnmount(() => {
  destroyed.value = true
})

const shouldRender = computed(() => {
  return unref(persistentRef) ? true : unref(open)
})

const shouldShow = computed(() => {
  return props.disabled ? false : unref(open)
})

const contentStyle = computed(() => (props.style ?? {}) as any)

const ariaHidden = computed(() => !unref(open))

const onTransitionLeave = () => {
  onHide()
}

const stopWhenControlled = () => {
  if (unref(controlled)) return true
}

const onContentEnter = composeEventHandlers(stopWhenControlled, () => {
  if (props.enterable && unref(trigger) === 'hover') {
    onOpen()
  }
})

const onContentLeave = composeEventHandlers(stopWhenControlled, () => {
  if (unref(trigger) === 'hover') {
    onClose()
  }
})

const onBeforeEnter = () => {
  contentRef.value?.updatePopper?.()
  onBeforeShow?.()
}

const onBeforeLeave = () => {
  onBeforeHide?.()
}

const onAfterShow = () => {
  onShow()
  stopHandle = onClickOutside(
    computed(() => contentRef.value?.popperContentRef),
    () => {
      if (unref(controlled)) return
      const $trigger = unref(trigger)
      if ($trigger !== 'hover') {
        onClose()
      }
    }
  )
}

//失焦后调用 onClose()方法
const onBlur = () => {
  if (!props.virtualTriggering) {
    onClose()
  }
}

let stopHandle: ReturnType<typeof onClickOutside>

watch(
  () => unref(open),
  (val) => {
    //如果val != true,调用stopHandle
    if (!val) {
      stopHandle?.()
    } else {
      stopHandle = onClickOutside(
        computed(() => contentRef.value?.popperContentRef),
        () => {
          if (unref(controlled)) return
          const $trigger = unref(trigger)
          if ($trigger !== 'hover') {
            onClose()
          }
        }
      )
    }
  },
  {
    flush: 'post',
  }
)

defineExpose({
  contentRef,
  intermediateOpen,
  entering,
  leaving,
})
</script>
