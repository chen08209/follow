<template>
  <fl-button :plain="true" @click="open">显示消息</fl-button>
</template>

<script setup lang="ts">
import { FlMessage } from 'follow-ui';

const open = () => {
  FlMessage('这是一个消息提示')
}
</script>
