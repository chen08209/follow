<template>
  <fl-time-picker
    v-model="value"
    is-range
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'
const value = ref()
</script>
