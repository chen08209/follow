<template>
  <p>
    <fl-radio-group v-model="radio1" color="#E42D44">
      <fl-radio label="1">Option 1</fl-radio>
      <fl-radio label="2">Option 2</fl-radio>
    </fl-radio-group>
  </p>
  <p>
    <fl-radio-group v-model="radio2" color="#614F4D">
      <fl-radio label="1">Option 1</fl-radio>
      <fl-radio label="2">Option 2</fl-radio>
    </fl-radio-group>
  </p>
  <p>
    <fl-radio-group v-model="radio3" color="#BCCF90">
      <fl-radio label="1">Option 1</fl-radio>
      <fl-radio label="2">Option 2</fl-radio>
    </fl-radio-group>
  </p>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const radio1 = ref('1')
const radio2 = ref('1')
const radio3 = ref('1')
</script>
