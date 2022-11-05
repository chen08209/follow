<template>
  <p>
    <fl-button-group>
      <fl-button type="primary" :icon="ArrowLeft">Previous Page</fl-button>
      <fl-button type="primary" :icon="ArrowRight" icon-position="right">
        Next Page
      </fl-button>
    </fl-button-group>
  </p>

  <p>
    <fl-button-group>
      <fl-button type="primary" :icon="Edit" />
      <fl-button type="primary" :icon="Share" />
      <fl-button type="primary" :icon="Delete" />
    </fl-button-group>
  </p>
</template>

<script setup lang="ts">
import {
  ArrowLeft,
  ArrowRight,
  Delete,
  Edit,
  Share,
} from '@element-plus/icons-vue'
</script>
