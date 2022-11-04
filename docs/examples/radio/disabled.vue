<template>
  <p>
    <fl-radio-group v-model="radio1" disabled>
      <fl-radio label="1">Option 1</fl-radio>
      <fl-radio label="2">Option 2</fl-radio>
    </fl-radio-group>
  </p>
  <p>
    <fl-radio-group v-model="radio2" disabled>
      <fl-radio-button label="1">Option 1</fl-radio-button>
      <fl-radio-button label="2">Option 2</fl-radio-button>
    </fl-radio-group>
  </p>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const radio1 = ref('1')
const radio2 = ref('1')
</script>
