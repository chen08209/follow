<template>
  <p>
    <fl-radio-group v-model="size">
      <fl-radio-button label="large" />
      <fl-radio-button label="default" />
      <fl-radio-button label="small" />
    </fl-radio-group>
  </p>
  <p>
    <fl-button :size="size">{{ size }}</fl-button>
    <fl-button :size="size" :icon="Search">{{ size }}</fl-button>
  </p>
  <p>
    <fl-button :size="size" round>{{ size }}</fl-button>
    <fl-button :size="size" :icon="Search" round>{{ size }}</fl-button>
  </p>
  <p>
    <fl-button :size="size" :icon="Search" circle />
  </p>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'

const size = ref('default')
</script>
