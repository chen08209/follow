<template>
  <div
    :class="[ns.b('dropdown'), ns.is('multiple', isMultiple), popperClass]"
    :style="{ [isFitInputWidth ? 'width' : 'minWidth']: minWidth }"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, ref } from 'vue'
import { useNamespace } from '@follow-ui/hooks'
import { useResizeObserver } from '@vueuse/core'
import { selectKey } from '@follow-ui/tokens'
import type { SelectContext } from '@follow-ui/tokens'
defineOptions({
  name: 'FlSelectDropdown',
})
const select = inject(selectKey) as SelectContext
const ns = useNamespace('select')
const popperClass = computed(() => select.props.popperClass)
const isMultiple = computed(() => select.props.multiple)
const isFitInputWidth = computed(() => select.props.fitInputWidth)
const minWidth = ref('')

//更新最小宽度
function updateMinWidth() {
  minWidth.value = `${select.selectWrapper?.offsetWidth}px`
}

onMounted(() => {
  updateMinWidth()
  //创建resize事件监听select.selectWrapper变化
  useResizeObserver(select.selectWrapper, updateMinWidth)
})
</script>
