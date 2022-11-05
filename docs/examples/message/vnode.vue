<template>
  <fl-button :plain="true" @click="open">显示VNode消息</fl-button>
</template>

<script setup lang="ts">
import { h } from 'vue'
import { FlMessage } from 'follow-ui'

const open = () => {
  FlMessage({
    message: h('p', null, [
      h('span', {}, '消息来自'),
      h('i', { style: 'color: teal' }, 'VNode'),
    ]),
  })
}
</script>
