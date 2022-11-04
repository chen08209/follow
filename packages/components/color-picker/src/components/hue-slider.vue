<template>
  <div :class="[ns.b(), ns.is('vertical', vertical)]">
    <div ref="bar" :class="ns.e('bar')" @click="handleClick" />
    <div
      ref="thumb"
      :class="ns.e('thumb')"
      :style="{
        left: thumbLeft + 'px',
        top: thumbTop + 'px',
      }"
    />
  </div>
</template>
<script setup lang="ts">
import { computed, getCurrentInstance, onMounted, ref, watch } from 'vue'
import { definePropType, getClientXY } from '@follow-ui/utils'
import { useNamespace } from '@follow-ui/hooks'
import { Color, draggable } from '../ts';

defineOptions({
  name: 'FlColorHueSlider',
})
const props = defineProps({
  color: {
    type: definePropType<Color>([Object]),
    required: true,
  },

  vertical: Boolean,
})

const ns = useNamespace('color-hue-slider')
const instance = getCurrentInstance()!
const thumb = ref<HTMLElement>()
const bar = ref<HTMLElement>()
const thumbLeft = ref(0)
const thumbTop = ref(0)
const hueValue = computed(() => {
  return props.color.get('hue')
})

const handleClick = (event: MouseEvent | TouchEvent) => {
  const target = event.target

  if (target !== thumb.value) {
    handleDrag(event)
  }
}

const handleDrag = (event: MouseEvent | TouchEvent) => {
  if (!bar.value || !thumb.value) return

  const el = instance.vnode.el as HTMLElement
  const rect = el.getBoundingClientRect()
  const { clientX, clientY } = getClientXY(event)
  let hue: number

  if (!props.vertical) {
    let left = clientX - rect.left
    left = Math.min(left, rect.width - thumb.value.offsetWidth / 2)
    left = Math.max(thumb.value.offsetWidth / 2, left)

    hue = Math.round(
      ((left - thumb.value.offsetWidth / 2) /
        (rect.width - thumb.value.offsetWidth)) *
        360
    )
  } else {
    let top = clientY - rect.top

    top = Math.min(top, rect.height - thumb.value.offsetHeight / 2)
    top = Math.max(thumb.value.offsetHeight / 2, top)
    hue = Math.round(
      ((top - thumb.value.offsetHeight / 2) /
        (rect.height - thumb.value.offsetHeight)) *
        360
    )
  }
  props.color.set('hue', hue)
}

const getThumbLeft = () => {
  if (!thumb.value) return 0

  const el = instance.vnode.el

  if (props.vertical) return 0
  const hue = props.color.get('hue')

  if (!el) return 0
  return Math.round(
    (hue * (el.offsetWidth - thumb.value.offsetWidth / 2)) / 360
  )
}

const getThumbTop = () => {
  if (!thumb.value) return 0

  const el = instance.vnode.el as HTMLElement
  if (!props.vertical) return 0
  const hue = props.color.get('hue')

  if (!el) return 0
  return Math.round(
    (hue * (el.offsetHeight - thumb.value.offsetHeight / 2)) / 360
  )
}

const update = () => {
  thumbLeft.value = getThumbLeft()
  thumbTop.value = getThumbTop()
}

onMounted(() => {
  if (!bar.value || !thumb.value) return

  const dragConfig = {
    drag: (event: MouseEvent | TouchEvent) => {
      handleDrag(event)
    },
    end: (event: MouseEvent | TouchEvent) => {
      handleDrag(event)
    },
  }

  draggable(bar.value, dragConfig)
  draggable(thumb.value, dragConfig)
  update()
})

watch(
  () => hueValue.value,
  () => {
    update()
  }
)

defineExpose({
  update,
})
</script>
