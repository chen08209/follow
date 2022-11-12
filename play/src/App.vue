<template>
  <fl-time-picker v-model="value" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { FlTimePicker } from '@follow-ui/components/time-picker-v2'
const value = ref()
</script>
