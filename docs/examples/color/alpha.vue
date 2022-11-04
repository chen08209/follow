<template>
  <p>
    <fl-color-picker v-model="color" show-alpha />
  </p>
</template>
<script setup lang="ts">
import { ref } from 'vue'
const color = ref('#f56c6c')
</script>
