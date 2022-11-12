<template>
  <p>
    <fl-time-picker2 v-model="value1" disabled />
  </p>
  <p>
    <fl-time-picker2 v-model="value2" disabled is-range />
  </p>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
const value1 = ref()
const value2 = ref()
</script>
