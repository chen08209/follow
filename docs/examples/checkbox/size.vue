<template>
  <p>
    <fl-radio-group v-model="size" size="large" color="#213547">
      <fl-radio-button label="small">Small</fl-radio-button>
      <fl-radio-button label="default">Default</fl-radio-button>
      <fl-radio-button label="large">Large</fl-radio-button>
    </fl-radio-group>
  </p>
  <p style="padding-top: 3px; width: 40%; border-top: 1px solid #dcdfe6" />
  <p>
    <fl-checkbox-group v-model="checked1" :size="size">
      <fl-checkbox-button label="Option 1" />
      <fl-checkbox-button label="Option 2" />
      <fl-checkbox-button label="Option 3" />
    </fl-checkbox-group>
  </p>
  <p>
    <fl-checkbox-group v-model="checked2" :size="size">
      <fl-checkbox label="Option 1" />
      <fl-checkbox label="Option 2" />
      <fl-checkbox label="Option 3" />
    </fl-checkbox-group>
  </p>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
const size = ref('default')
const checked1 = ref(['Option 1'])
const checked2 = ref(['Option 2'])
</script>
