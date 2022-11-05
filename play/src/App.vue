<template>
  <div class="body">
    <fl-scrollbar always>
      <div class="content" />
    </fl-scrollbar>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.body {
  width: 200px;
  height: 80vh;
  overflow: hidden;
}
.content {
  height: 200vh;

  background-color: yellow;
}
</style>
