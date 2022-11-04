<template>
  <fl-switch v-model="value" :active-icon="Check" :inactive-icon="Close" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { Check, Close } from '@element-plus/icons-vue'
const value = ref(true)
</script>
