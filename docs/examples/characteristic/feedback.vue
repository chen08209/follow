<template>
  <div class="item">
    <fl-button size="large" type="primary" plain>点击按钮</fl-button>
  </div>
  <div class="item">
    <fl-switch v-model="switchModel" />
  </div>
  <div class="item">
    <fl-radio-group v-model="radio" size="large">
      <fl-radio label="1">Option 1</fl-radio>
      <fl-radio label="2">Option 2</fl-radio>
    </fl-radio-group>
  </div>
  <div class="item">
    <fl-checkbox-group v-model="checkbox" size="large">
      <fl-checkbox label="1">Option 1</fl-checkbox>
      <fl-checkbox label="2">Option 2</fl-checkbox>
    </fl-checkbox-group>
  </div>
  <div class="item">
    <fl-select v-model="select">
      <fl-option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </fl-select>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
const switchModel = ref()
const radio = ref('1')
const checkbox = ref(['1'])
const select = ref('Option1')
const options = [
  {
    value: 'Option1',
    label: 'Option1',
  },
  {
    value: 'Option2',
    label: 'Option2',
  },
  {
    value: 'Option3',
    label: 'Option3',
  },
  {
    value: 'Option4',
    label: 'Option4',
  },
  {
    value: 'Option5',
    label: 'Option5',
  },
]
</script>
<style scoped>
.box {
  padding: 1.5rem 0;
}

.item {
  display: flex;
  align-items: center;
  padding: 20px 0;
}
</style>
