<template>
  <p>
    <fl-time-picker2 v-model="value" />
  </p>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
const value = ref()
</script>
