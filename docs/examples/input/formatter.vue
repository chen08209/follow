<template>
  <fl-input
      v-model="input"
      placeholder="请输入"
      :formatter="(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
      :parser="(value) => value.replace(/\¥\s?|(,*)/g, '')"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'
const input = ref('')
</script>
