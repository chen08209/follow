<template>
  <fl-switch v-model="value" disabled />
</template>

<script lang="ts" setup>
import { ref } from 'vue'
const value = ref(true)
</script>
