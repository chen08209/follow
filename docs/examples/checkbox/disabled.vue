<template>
  <p>
    <fl-checkbox v-model="checked1" label="Option 1" disabled />
    <fl-checkbox v-model="checked2" label="Option 2" disabled />
  </p>
</template>
<script lang="ts" setup>
import { ref } from 'vue'

const checked1 = ref(true)
const checked2 = ref(false)
</script>
