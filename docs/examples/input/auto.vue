<template>
  <p>
    <fl-input type="textarea" v-model="input" placeholder="请输入" autosize/>
  </p>
  <p>
    <fl-input type="textarea" v-model="input" placeholder="请输入" :autosize="{ minRows: 3, maxRows: 4 }"/>
  </p>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

const input = ref('')
</script>
