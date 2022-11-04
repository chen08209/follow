<template>
  <p>
    <fl-button disabled>Default</fl-button>
    <fl-button type="primary" round disabled>Round</fl-button>
    <fl-button type="danger" :icon="Check" circle disabled />
    <fl-button type="success" text disabled>Text</fl-button>
  </p>
  <p>
    <fl-button plain disabled>Plain</fl-button>
    <fl-button type="primary" plain round disabled>Round</fl-button>
    <fl-button type="danger" :icon="Check" plain circle disabled />
    <fl-button type="success" plain text disabled>Text</fl-button>
  </p>
</template>
<script lang="ts" setup>
import { Check } from '@element-plus/icons-vue'
</script>
