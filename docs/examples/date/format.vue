<template>
  <div class="list">
    <div class="item">
      <p>value: {{ value1 }}</p>
      <fl-date-picker
        v-model="value1"
        type="date"
        format="YYYY/MM/DD"
        placeholder="选择一个日期"
        value-format="YYYY-MM-DD"
      />
    </div>
    <div class="item">
      <p>value: {{ value2 }}</p>
      <fl-date-picker
        v-model="value2"
        type="date"
        format="YYYY-MM-DD"
        placeholder="选择一个日期"
        value-format="x"
      />
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
