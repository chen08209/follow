<template>
  <slot />
</template>

<script setup lang="ts">
import { computed, provide, ref } from 'vue'
import { POPPER_INJECTION_KEY } from '@follow-ui/tokens/popper'
import { popperProps } from './ts'

import type { Instance as PopperInstance } from '@popperjs/core'
import type { FlPopperInjectionContext } from '@follow-ui/tokens/popper'

defineOptions({
  name: 'FlPopperContent',
  inheritAttrs: false,
})

const props = defineProps(popperProps)

const triggerRef = ref<HTMLElement>()
const popperInstanceRef = ref<PopperInstance>()
const contentRef = ref<HTMLElement>()
const referenceRef = ref<HTMLElement>()
const role = computed(() => props.role)

const popperProvides = {
  triggerRef,
  popperInstanceRef,
  contentRef,
  referenceRef,
  role,
} as FlPopperInjectionContext

provide(POPPER_INJECTION_KEY, popperProvides)

defineExpose(popperProvides)
</script>
