<template>
  <fl-date-picker
    v-model="value"
    type="datetimerange"
    start-placeholder="开始日期"
    end-placeholder="结束日期"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('')
</script>
