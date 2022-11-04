<template>
  <p>
    <fl-button :icon="Check">Check</fl-button>
    <fl-button>
      Check
      <fl-icon class="fl-icon--right"><check/></fl-icon>
    </fl-button>
  </p>
</template>

<script lang="ts" setup>
import {
  Check,
} from '@element-plus/icons-vue'
</script>
