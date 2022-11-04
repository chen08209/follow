<template>
  <p>
    <fl-radio-group v-model="radio">
      <fl-radio label="1" size="large">Option 1</fl-radio>
      <fl-radio label="2" size="large">Option 2</fl-radio>
    </fl-radio-group>
  </p>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const radio = ref('1')
</script>
