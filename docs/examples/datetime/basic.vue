<template>
  <fl-date-picker v-model="value" type="datetime" placeholder="选择日期时间" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('')
</script>
