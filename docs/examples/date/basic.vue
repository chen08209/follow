<template>
  <div class="list">
    <div class="item">
      <p>Day</p>
      <fl-date-picker v-model="value1" type="date" placeholder="选择一日" />
    </div>
    <div class="item">
      <p>Week</p>
      <fl-date-picker v-model="value2" type="week" placeholder="选择一周" />
    </div>
    <div class="item">
      <p>Year</p>
      <fl-date-picker v-model="value3" type="year" placeholder="选择一年" />
    </div>
    <div class="item">
      <p>Month</p>
      <fl-date-picker v-model="value4" type="month" placeholder="选择一月" />
    </div>
    <div class="item">
      <p>Dates</p>
      <fl-date-picker
        v-model="value5"
        type="dates"
        placeholder="选择多个日期"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref('')
const value2 = ref('')
const value3 = ref('')
const value4 = ref('')
const value5 = ref('')
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
