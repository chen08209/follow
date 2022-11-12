<template>
  <p>
    <fl-time-picker v-model="value" />
  </p>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
const value = ref()
</script>
