<template>
  <div class="code-wrapper">
    <div class="code-container" :class="languageClass" v-html="decoded" />
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  language: String,
  source: {
    type: String,
    required: true,
  },
})

const languageClass = computed(() => `language-${props.language}`)

const decoded = computed(() => {
  return decodeURIComponent(props.source)
})
</script>
<style scoped lang="scss">
.language-vue {
  margin: 0 !important;
  border-radius: 0 !important;
}
</style>
