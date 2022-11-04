<template>
  <fl-time-picker v-model="value" placeholder="选择时间" is-range />
</template>

<script lang="ts" setup>
import { ref } from 'vue'
const value = ref()
</script>
