<template>
  <p>
    <fl-checkbox-group v-model="checked1" color="#E42D44">
      <fl-checkbox label="Option 1" />
      <fl-checkbox label="Option 2" />
      <fl-checkbox label="Option 3" />
    </fl-checkbox-group>
  </p>
  <p>
    <fl-checkbox-group v-model="checked2" color="#41B883">
      <fl-checkbox label="Option 1" />
      <fl-checkbox label="Option 2" />
      <fl-checkbox label="Option 3" />
    </fl-checkbox-group>
  </p>
  <p>
    <fl-checkbox-group v-model="checked3" color="#F9630E">
      <fl-checkbox-button label="Option 1" />
      <fl-checkbox-button label="Option 2" />
      <fl-checkbox-button label="Option 3" />
    </fl-checkbox-group>
  </p>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
const checked1 = ref(['Option 1'])
const checked2 = ref(['Option 2'])
const checked3 = ref(['Option 3'])
</script>
