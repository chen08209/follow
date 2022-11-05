<template>
  <fl-button :plain="true" @click="open">显示HTML消息</fl-button>
</template>

<script setup lang="ts">
import { FlMessage } from 'follow-ui'

const open = () => {
  FlMessage({
    html: true,
    message: '<h1>这是一个<strong>HTML</strong>片段</h1>',
  })
}
</script>
