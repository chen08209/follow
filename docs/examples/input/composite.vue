<template>
  <p>
    <fl-input v-model="input1" placeholder="请输入">
      <template #prepend>Http://</template>
    </fl-input>
  </p>
  <p>
    <fl-input v-model="input2" placeholder="请输入">
      <template #append>.com</template>
    </fl-input>
  </p>
  <p>
    <fl-input v-model="input3" placeholder="请输入" class="select-with-prepend">
      <template #prepend>
        <fl-select v-model="select" placeholder="Select">
          <fl-option label="option1" value="1" />
          <fl-option label="option2" value="2" />
          <fl-option label="option3" value="3" />
        </fl-select>
      </template>
      <template #append>
        <fl-button :icon="Search" />
      </template>
    </fl-input>
  </p>
  <p>
    <fl-input v-model="input3" placeholder="请输入" class="select-with-append">
      <template #prepend>
        <fl-button :icon="Search" />
      </template>
      <template #append>
        <fl-select v-model="select" placeholder="Select">
          <fl-option label="option1" value="1" />
          <fl-option label="option2" value="2" />
          <fl-option label="option3" value="3" />
        </fl-select>
      </template>
    </fl-input>
  </p>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'
const input1 = ref('')
const input2 = ref('')
const input3 = ref('')
const select = ref('')
</script>
<style>
.select-with-prepend .fl-input-group__prepend {
  padding: 0 !important;
}
.select-with-append .fl-input-group__append {
  padding: 0 !important;
}
</style>
