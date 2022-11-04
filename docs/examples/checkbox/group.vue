<template>
  <p>
    <fl-checkbox-group v-model="checked">
      <fl-checkbox label="Option 1" />
      <fl-checkbox label="Option 2" />
      <fl-checkbox label="Option 3" />
    </fl-checkbox-group>
  </p>
</template>
<script lang="ts" setup>
import { ref } from 'vue'

const checked = ref(['Option 1'])
</script>
