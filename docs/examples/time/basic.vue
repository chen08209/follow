<template>
  <div class="list">
    <div class="item">
      <p>defalut</p>
      <fl-time-picker v-model="value1" placeholder="选择时间" />
    </div>
    <div class="item">
      <p>arrow-control</p>
      <fl-time-picker v-model="value2" arrow-control placeholder="选择时间" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
const value1 = ref()
const value2 = ref()
</script>

<style scoped>
.list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
}
.item {
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
}
p {
  color: var(--fl-text-color-secondary);
}
</style>
