<template>
  <p>
    <fl-switch v-model="value1" size="large" />
  </p>
  <p>
    <fl-switch v-model="value2" />
  </p>
  <p>
    <fl-switch v-model="value3" size="small" />
  </p>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
const value1 = ref(false)
const value2 = ref(true)
const value3 = ref(true)
</script>
