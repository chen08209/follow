<template>
  <p>
    <fl-color-picker v-model="color1" />
    <fl-color-picker v-model="color2" show-label />
  </p>
</template>
<script setup lang="ts">
import { ref } from 'vue'

const color1 = ref('#056de8')
const color2 = ref('#f56c6c')
</script>
