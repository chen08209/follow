<template>
  <fl-popper ref="popperRef" :role="role">
    <!--触发元素 -->
    <fl-tooltip-trigger
      :disabled="disabled"
      :trigger="trigger"
      :trigger-keys="triggerKeys"
      :virtual-triggering="virtualTriggering"
      :virtual-ref="virtualRef"
    >
      <slot v-if="$slots.default" />
    </fl-tooltip-trigger>

    <!--popper内容 -->
    <fl-tooltip-content
      ref="contentRef"
      :append-to="appendTo"
      :aria-label="ariaLabel"
      :boundaries-padding="boundariesPadding"
      :content="content"
      :disabled="disabled"
      :effect="effect"
      :enterable="enterable"
      :fallback-placements="fallbackPlacements"
      :gpu-acceleration="gpuAcceleration"
      :hide-after="hideAfter"
      :offset="offset"
      :persistent="persistent"
      :placement="placement"
      :popper-class="popperClass"
      :popper-options="popperOptions"
      :popper-style="popperStyle"
      :pure="pure"
      :raw-content="rawContent"
      :reference-el="referenceEl"
      :show-after="compatShowAfter"
      :strategy="strategy"
      :teleported="teleported"
      :transition="transition"
      :trigger-target-el="triggerTargetEl"
      :virtual-triggering="virtualTriggering"
      :z-index="zIndex"
    >
      <slot name="content">
        <span v-if="rawContent" v-html="content" />
        <span v-else>{{ content }}</span>
      </slot>
      <fl-popper-arrow v-if="compatShowArrow" :arrow-offset="arrowOffset" />
    </fl-tooltip-content>
  </fl-popper>
</template>
<script setup lang="ts">
import {
  computed,
  onDeactivated,
  provide,
  readonly,
  ref,
  toRef,
  unref,
  watch,
} from 'vue'
import { useDelayedToggle, useId, usePopperContainer } from '@follow-ui/hooks'
import { debugWarn, isBoolean, isUndefined } from '@follow-ui/utils'
import { TOOLTIP_INJECTION_KEY } from '@follow-ui/tokens'
import FlPopper, {
  FlPopperArrow,
  popperArrowProps,
  popperProps,
} from '../../popper'
import FlTooltipContent from './content.vue'
import FlTooltipTrigger from './trigger.vue'
import {
  tooltipContentProps,
  tooltipProps,
  tooltipTriggerProps,
  useModelTooltipToggle,
  useModelTooltipToggleEmits,
  useModelTooltipToggleProps,
} from './ts'

defineOptions({
  name: 'FlTooltip',
})
const props = defineProps({
  ...popperProps,
  ...useModelTooltipToggleProps,
  ...tooltipContentProps,
  ...tooltipTriggerProps,
  ...popperArrowProps,
  ...tooltipProps,
})

const emit = defineEmits([
  ...useModelTooltipToggleEmits,
  'before-show',
  'before-hide',
  'show',
  'hide',
  'open',
  'close',
])

//在body下创建容器，用于content组件
usePopperContainer()

//延迟弹出
const compatShowAfter = computed(() => {
  if (!isUndefined(props.openDelay)) {
    debugWarn(
      'ElTooltip',
      'open-delay is about to be deprecated in the next major version, please use `show-after` instead'
    )
  }
  return props.openDelay || (props.showAfter as number)
})

//是否显示箭头
const compatShowArrow = computed(() => {
  if (!isUndefined(props.visibleArrow)) {
    debugWarn(
      'ElTooltip',
      '`visible-arrow` is about to be deprecated in the next major version, please use `show-arrow` instead'
    )
  }
  return isBoolean(props.visibleArrow) ? props.visibleArrow : props.showArrow
})

//创建id
const id = useId()

const popperRef = ref<InstanceType<typeof FlPopper> | null>(null)

const contentRef = ref<InstanceType<typeof FlTooltipContent> | null>(null)

const updatePopper = () => {
  const popperComponent = unref(popperRef)
  if (popperComponent) {
    popperComponent.popperInstanceRef?.update()
  }
}

//是否打开
const open = ref(false)

//触发理由
const toggleReason = ref<Event | undefined>(undefined)

//得到show,hide方法
const { show, hide, hasUpdateHandler } = useModelTooltipToggle({
  indicator: open,
  toggleReason,
})

//延迟show或者hide
const { onOpen, onClose } = useDelayedToggle({
  showAfter: compatShowAfter,
  hideAfter: toRef(props, 'hideAfter'),
  open: show,
  close: hide,
})

//是否通过visible控制popper
const controlled = computed(
  () => isBoolean(props.visible) && !hasUpdateHandler.value
)

//传递给子孙组件
provide(TOOLTIP_INJECTION_KEY, {
  controlled,
  id,
  open: readonly(open),
  trigger: toRef(props, 'trigger'),
  onOpen: (event?: Event) => {
    onOpen(event)
  },
  onClose: (event?: Event) => {
    onClose(event)
  },
  onToggle: (event?: Event) => {
    if (unref(open)) {
      onClose(event)
    } else {
      onOpen(event)
    }
  },
  onShow: () => {
    emit('show', toggleReason.value)
  },
  onHide: () => {
    emit('hide', toggleReason.value)
  },
  onBeforeShow: () => {
    emit('before-show', toggleReason.value)
  },
  onBeforeHide: () => {
    emit('before-hide', toggleReason.value)
  },
  updatePopper,
})

//监听disabled,如果disabled为true时,open.value也为true时open.value = false
watch(
  () => props.disabled,
  (disabled) => {
    if (disabled && open.value) {
      open.value = false
    }
  }
)

const isFocusInsideContent = () => {
  const popperContent: HTMLElement | undefined =
    contentRef.value?.contentRef?.popperContentRef
  return popperContent && popperContent.contains(document.activeElement)
}

//未激活时如果open.value存在,调用hide()
onDeactivated(() => open.value && hide())

defineExpose({
  popperRef,
  updatePopper,
  isFocusInsideContent,
})
</script>
