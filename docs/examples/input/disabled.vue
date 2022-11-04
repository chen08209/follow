<template>
  <fl-input v-model="input" placeholder="请输入" disabled/>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

const input = ref('')
</script>
