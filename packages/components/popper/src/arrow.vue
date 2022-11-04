<template>
  <span ref="arrowRef" :class="ns.e('arrow')" data-popper-arrow="" />
</template>

<script setup lang="ts">
import { inject, onBeforeUnmount, watch } from 'vue'
import { useNamespace } from '@follow-ui/hooks'
import { POPPER_CONTENT_INJECTION_KEY } from '@follow-ui/tokens'
import { popperArrowProps } from './ts'

defineOptions({
  name: 'FlPopperArrow',
  inheritAttrs: false,
})

const props = defineProps(popperArrowProps)

const ns = useNamespace('popper')
const { arrowOffset, arrowRef } = inject(
  POPPER_CONTENT_INJECTION_KEY,
  undefined
)!

watch(
  () => props.arrowOffset,
  (val) => {
    arrowOffset.value = val
  }
)
onBeforeUnmount(() => {
  arrowRef.value = undefined
})

defineExpose({
  arrowRef,
})
</script>
