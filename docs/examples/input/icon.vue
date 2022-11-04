<template>
  <p>
    <fl-input
        v-model="input1"
        placeholder="Pick a date"
        :suffix-icon="Calendar"
    />
  </p>
  <p>
    <fl-input
        v-model="input2"
        placeholder="Pick a date"
        :prefix-icon="Search"
    />
  </p>
  <p>
    <fl-input
        v-model="input1"
        placeholder="Pick a date"
    >
      <template #suffix>
        <fl-icon>
          <Calendar/>
        </fl-icon>
      </template>
    </fl-input>
  </p>
  <p>
    <fl-input
        v-model="input2"
        placeholder="Pick a date"
    >
      <template #prefix>
        <fl-icon>
          <Search/>
        </fl-icon>
      </template>
    </fl-input>
  </p>
</template>

<script lang="ts" setup>
import {Calendar, Search} from '@element-plus/icons-vue'
import {ref} from 'vue'

const input1 = ref('')
const input2 = ref('')
</script>
