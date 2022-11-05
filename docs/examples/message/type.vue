<template>
  <fl-button
    v-for="messageType in messageTypes"
    :key="messageType"
    :plain="true"
    :type="messageType === 'error' ? 'danger' : messageType"
    @click="open(messageType)"
    >{{ messageType }}消息</fl-button
  >
</template>

<script setup lang="ts">
import { FlMessage, messageTypes } from 'follow-ui'
import type { messageType } from 'follow-ui'

const open = (type: messageType) => {
  FlMessage({
    message: `这是一个${type}消息提示`,
    type,
  })
}
</script>
