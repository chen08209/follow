<template>
  <div
    :class="ns.b()"
    :style="{
      backgroundColor: background,
    }"
  >
    <div :class="ns.e('white')" />
    <div :class="ns.e('black')" />
    <div
      :class="ns.e('cursor')"
      :style="{
        top: cursorTop + 'px',
        left: cursorLeft + 'px',
      }"
    >
      <div />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, onMounted, ref, watch } from 'vue'
import { definePropType, getClientXY } from '@follow-ui/utils'
import { useNamespace } from '@follow-ui/hooks'
import { draggable } from '../ts'
import type { Color } from '../ts'

defineOptions({
  name: 'FlSlPanel',
})

const props = defineProps({
  color: {
    type: definePropType<Color>([Object]),
    required: true,
  },
})

const ns = useNamespace('color-svpanel')
const instance = getCurrentInstance()!
const cursorTop = ref(0)
const cursorLeft = ref(0)
const background = ref('hsl(0, 100%, 50%)')
const colorValue = computed(() => {
  const hue = props.color.get('hue')
  const value = props.color.get('value')
  return { hue, value }
})

const update = () => {
  const saturation = props.color.get('saturation')
  const value = props.color.get('value')

  const el = instance.vnode.el!
  const { clientWidth: width, clientHeight: height } = el

  cursorLeft.value = (saturation * width) / 100
  cursorTop.value = ((100 - value) * height) / 100
  //100%饱和度，50%亮度
  background.value = `hsl(${props.color.get('hue')}, 100%, 50%)`
}

const handleDrag = (event: MouseEvent | TouchEvent) => {
  const el = instance.vnode.el!
  const rect = el.getBoundingClientRect()
  const { clientX, clientY } = getClientXY(event)

  //离左边的距离
  let left = clientX - rect.left
  //离顶部的距离
  let top = clientY - rect.top
  //最小为0
  left = Math.max(0, left)
  //最大为rect.width
  left = Math.min(left, rect.width)
  top = Math.max(0, top)
  top = Math.min(top, rect.height)

  cursorLeft.value = left
  cursorTop.value = top

  /**
   * 饱和度右边为100%,左边为0
   * value上面为100%，下面为0
   */
  props.color.set({
    saturation: (left / rect.width) * 100,
    value: 100 - (top / rect.height) * 100,
  })
}

watch(
  () => colorValue.value,
  () => {
    update()
  }
)

onMounted(() => {
  draggable(instance.vnode.el as HTMLElement, {
    drag: (event) => {
      handleDrag(event)
    },
    end: (event) => {
      handleDrag(event)
    },
  })
  update()
})

defineExpose({
  update,
})
</script>
