<template>
  <fl-popper ref="popperRef" :role="role">
    <fl-tooltip-trigger
      :disabled="disabled"
      :trigger="trigger"
      :trigger-keys="triggerKeys"
      :virtual-triggering="virtualTriggering"
      :virtual-ref="virtualRef"
    >
      <slot v-if="$slots.default" />
    </fl-tooltip-trigger>

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
import { isBoolean } from '@follow-ui/utils'
import { TOOLTIP_INJECTION_KEY } from '@follow-ui/tokens'
import {
  FlPopper,
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

//???body????????????????????????content??????
usePopperContainer()

//????????????
const compatShowAfter = computed(() => {
  return props.openDelay || (props.showAfter as number)
})

//??????????????????
const compatShowArrow = computed(() => {
  return isBoolean(props.visibleArrow) ? props.visibleArrow : props.showArrow
})

//??????id
const id = useId()

const popperRef = ref<InstanceType<typeof FlPopper> | null>(null)

const contentRef = ref<InstanceType<typeof FlTooltipContent> | null>(null)

const updatePopper = () => {
  const popperComponent = unref(popperRef)
  if (popperComponent) {
    popperComponent.popperInstanceRef?.update()
  }
}

//????????????
const open = ref(false)

//????????????
const toggleReason = ref<Event | undefined>(undefined)

//??????show,hide??????
const { show, hide, hasUpdateHandler } = useModelTooltipToggle({
  indicator: open,
  toggleReason,
})

//??????show??????hide
const { onOpen, onClose } = useDelayedToggle({
  showAfter: compatShowAfter,
  hideAfter: toRef(props, 'hideAfter'),
  open: show,
  close: hide,
})

//????????????visible??????popper
const controlled = computed(
  () => !hasUpdateHandler.value
)

//?????????????????????
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

//??????disabled,??????disabled???true???,open.value??????true???open.value = false
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

//??????????????????open.value??????,??????hide()
onDeactivated(() => open.value && hide())

defineExpose({
  popperRef,
  updatePopper,
  isFocusInsideContent,
})
</script>
