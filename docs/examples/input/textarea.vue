<template>
  <fl-input type="textarea" v-model="input" placeholder="请输入" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'
const input = ref('')
</script>
