<template>
  <div class="list">
    <div class="item">
      <p>Daterange</p>
      <fl-date-picker
        v-model="value1"
        type="daterange"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
      />
    </div>
    <div class="item">
      <p>Monthrange</p>
      <fl-date-picker
        v-model="value2"
        type="monthrange"
        start-placeholder="开始月份"
        end-placeholder="结束月份"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref('')
const value2 = ref('')
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
  width: 100%;
}
p {
  color: var(--fl-text-color-secondary);
}
</style>
