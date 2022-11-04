<template>
  <p>
    <fl-input v-model="input" placeholder="请输入"  size="large"/>
  </p>
  <p>
    <fl-input v-model="input" placeholder="请输入" />
  </p>
  <p>
    <fl-input v-model="input" placeholder="请输入"  size="small"/>
  </p>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
const input = ref('')
</script>
