<template>
  <div :class="ns.b()" />
</template>
<script setup lang="ts">
import { useNamespace } from '@follow-ui/hooks'
defineOptions({
  name: 'FlRipple',
})
const ns = useNamespace('ripple')
</script>
