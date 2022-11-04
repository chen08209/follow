<template>
  <p>
    <fl-color-picker v-model="color1" size="large" />
    <fl-color-picker v-model="color2" />
    <fl-color-picker v-model="color3" size="small" />
  </p>
  <p>
    <fl-color-picker v-model="color1" show-label size="large" />
    <fl-color-picker v-model="color2" show-label />
    <fl-color-picker v-model="color3" show-label size="small" />
  </p>
</template>
<script setup lang="ts">
import { ref } from 'vue'

const color1 = ref('#bbe70b')
const color2 = ref('#f56c6c')
const color3 = ref('#20dd00')
</script>
