<template>
  <div style="display: inline-block">
    <p style="margin-left: 10px">collapse-tags</p>
    <fl-select v-model="value1" multiple collapse-tags placeholder="请选择">
      <fl-option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </fl-select>
  </div>
  <div style="display: inline-block; margin-left: 20px !important">
    <p style="margin-left: 10px">collapse-tags-tooltip</p>
    <fl-select
      v-model="value2"
      multiple
      collapse-tags
      collapse-tags-tooltip
      placeholder="请选择"
    >
      <fl-option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </fl-select>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref(['Option1', 'Option2', 'Option3'])
const value2 = ref(['Option1', 'Option2', 'Option3'])

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
