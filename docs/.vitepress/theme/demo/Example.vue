<template>
  <div class="example-showcase">
    <ClientOnly>
      <component :is="demo" v-if="demo" v-bind="$attrs" />
    </ClientOnly>
  </div>
</template>
<script setup lang="ts">
defineProps({
  file: {
    type: String,
    required: true,
  },
  demo: {
    type: String,
    required: true,
  },
})
</script>
<style scoped lang="scss">
.example-showcase{
  padding: 1.5rem;
}
</style>
