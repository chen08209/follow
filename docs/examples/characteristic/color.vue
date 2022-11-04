<template>
  <div class="item">
    <fl-button :color="color1">color1</fl-button>
    <fl-button :color="color1" plain>color1</fl-button>
    <div class="picker">
      <fl-color-picker v-model="color1" />
    </div>
  </div>
  <div class="item">
    <fl-radio-group v-model="radio" :color="color2">
      <fl-radio label="1">Option 1</fl-radio>
      <fl-radio label="2">Option 2</fl-radio>
    </fl-radio-group>
    <div class="picker">
      <fl-color-picker v-model="color2" />
    </div>
  </div>
  <div class="item">
    <fl-checkbox-group v-model="checkbox" :color="color3">
      <fl-checkbox label="1">Option 1</fl-checkbox>
      <fl-checkbox label="2">Option 2</fl-checkbox>
    </fl-checkbox-group>
    <div class="picker">
      <fl-color-picker v-model="color3" />
    </div>
  </div>
  <div class="item">
    <fl-switch v-model="switchVal" :color="color4">color1</fl-switch>
    <div class="picker">
      <fl-color-picker v-model="color4" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
const color1 = ref('#A64E4E')
const color2 = ref('#04BFF8')
const color3 = ref('#E35B17')
const color4 = ref('#6C11F4')
const radio = ref('1')
const checkbox = ref(['1'])
const switchVal = ref(true)
</script>
<style scoped>
.item {
  display: flex;
  align-items: center;
  padding: 20px 0;
}

.picker {
  margin-left: 64px;
}
</style>
