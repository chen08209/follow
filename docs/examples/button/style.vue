<template>
  <p>
    <fl-button>Default</fl-button>
    <fl-button type="primary" round>Round</fl-button>
    <fl-button type="danger" :icon="Check" circle />
    <fl-button type="success" text>Text</fl-button>
  </p>
  <p>
    <fl-button plain>Plain</fl-button>
    <fl-button type="primary" plain round>Round</fl-button>
    <fl-button type="danger" :icon="Check" plain circle />
    <fl-button type="success" plain text>Text</fl-button>
  </p>
</template>
<script lang="ts" setup>
import { Check } from '@element-plus/icons-vue'
</script>
