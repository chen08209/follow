<template>
  <p v-html="decodedDescription" />
  <div class="example">
    <Example :file="path" :demo="path" />
    <div class="btns">
      <fl-icon
        :size="16"
        class="btn"
        @click="handlerCode"
        @mouseleave="isCopied = false"
      >
        <component
          :is="isCopied ? VPIconCheck : VPIconCopy"
          :style="{
            fill: isCopied ? 'var(--fl-color-success)' : 'currentColor',
          }"
        />
      </fl-icon>
      <fl-icon :size="16" class="btn" @click="toggleSourceVisible()">
        <component :is="sourceVisible ? VPIconCodeOpen : VPIconCodeClose" />
      </fl-icon>
    </div>
    <FlCollapseTransition>
      <Code v-show="sourceVisible" ref="code" :source="source" language="vue" />
    </FlCollapseTransition>
    <Transition name="fl-fade-in-linear">
      <div v-show="sourceVisible" class="bar">
        <fl-button
          :icon="VPIconChevronUp"
          link
          @click="toggleSourceVisible(false)"
        >
          隐藏代码
        </fl-button>
      </div>
    </Transition>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useClipboard } from '@vueuse/core'
import VPIconCopy from '../../vitepress/components/icons/VPIconCopy.vue'
import VPIconCheck from '../../vitepress/components/icons/VPIconCheck.vue'
import VPIconChevronUp from '../../vitepress/components/icons/VPIconChevronUp.vue'
import VPIconCodeClose from '../../vitepress/components/icons/VPIconCodeClose.vue'
import VPIconCodeOpen from '../../vitepress/components/icons/VPIconCodeOpen.vue'
import Code from './Code.vue'
import Example from './Example.vue'
const props = defineProps<{
  source: string
  path: string
  rawSource: string
  description?: string
}>()

const code = ref()
const sourceVisible = ref(false)
const isCopied = ref(false)

const decodedDescription = computed(() =>
  decodeURIComponent(props.description!)
)

const copyTip = computed(() => (isCopied.value ? '复制成功' : '复制代码'))

const toggleTip = computed(() =>
  sourceVisible.value ? '隐藏代码' : '显示代码'
)

const handlerCode = async () => {
  const text = code.value.$el.textContent?.trim()
  if (text) {
    try {
      await navigator.clipboard.writeText(text)
      isCopied.value = true
    } catch (err) {
      console.log(err)
    }
  }
}

const toggleSourceVisible = (status?: boolean) => {
  if (status === undefined) {
    sourceVisible.value = !sourceVisible.value
  } else {
    sourceVisible.value = status
  }
}
</script>
<style scoped lang="scss">
.example {
  border: 1px solid var(--border-color);
  border-radius: 0.4rem;
}

.bar {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
}

.btns {
  cursor: pointer;
  display: flex;
  padding: 0.5rem 0.5rem;
  justify-content: flex-end;
  border-top: 1px solid var(--border-color);

  .btn {
    margin-left: 1rem;
    color: var(--fl-text-color-secondary);
  }
}
</style>
