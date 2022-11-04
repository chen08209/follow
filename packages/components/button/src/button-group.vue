<template>
  <div :class="`${ns.b('group')}`">
    <slot />
  </div>
</template>
<script lang="ts" setup>
import { provide, reactive, toRef } from 'vue'
import { buttonGroupContextKey } from '@follow-ui/tokens'
import { useNamespace } from '@follow-ui/hooks'
import { buttonGroupProps } from './ts'

defineOptions({
  name: 'FlButtonGroup',
})
const props = defineProps(buttonGroupProps)
provide(
  buttonGroupContextKey,
  reactive({
    size: toRef(props, 'size'),
    type: toRef(props, 'type'),
  })
)
const ns = useNamespace('button')
</script>
