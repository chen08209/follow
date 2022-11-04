<template>
  <div
    ref="wrapperRef"
    :class="[
      ns.b('wrapper'),
      ns.is('center', center),
      ns.is('disabled', disabled),
    ]"
    @mousedown="handleMouseDown"
    @mouseup="end"
    @mouseleave="end"
    @touchstart="handleTouchStart"
    @touchend="end"
    @touchcancel="end"
  >
    <TransitionGroup v-on="on">
      <ripple v-for="item in ripples" :key="item.key" :style="item.style" />
    </TransitionGroup>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useNamespace } from '@follow-ui/hooks'
import ripple from './ripple.vue'
import type { CSSProperties, RendererElement } from 'vue'
defineOptions({
  name: 'FlRippleWrapper',
})
const ns = useNamespace('ripple')
const props = defineProps({
  center: Boolean,
  disabled: Boolean,
})
const wrapperRef = ref<HTMLDivElement>()
const nextKey = ref<number>(0)
const ripples = ref<any[]>([])
const ignoreNextMouseDown = ref<boolean>(false)

const handleMouseDown = (event: MouseEvent) => {
  if (event.button === 0) {
    start(event, false)
  }
}

const handleTouchStart = (event: TouchEvent) => {
  start(event.touches[0] as any, true)
}

const start = (event: MouseEvent, isTouch: boolean) => {
  if (ignoreNextMouseDown.value && !isTouch) {
    ignoreNextMouseDown.value = false
    return
  }
  ripples.value.push({
    key: nextKey.value++,
    style: getRippleStyle(event),
  })
  ignoreNextMouseDown.value = isTouch
}

const end = () => {
  if (ripples.value.length === 0) return
  ripples.value.splice(0, 1)
}

const getRippleStyle = (event: MouseEvent) => {
  let style: CSSProperties = {}
  if (wrapperRef.value) {
    const width = wrapperRef.value.offsetWidth
    const height = wrapperRef.value.offsetHeight
    const radius = Math.sqrt(width * width + height * height) * 2
    style = {
      width: `${radius}px`,
      height: `${radius}px`,
    }
    if (props.center) return style
    const x = event.offsetX
    const y = event.offsetY
    style = {
      ...style,
      left: `${x - radius / 2}px`,
      top: `${y - radius / 2}px`,
    }
  }
  return style
}

const on = {
  enter(e: RendererElement) {
    e.classList.add('is-enter')
  },
  leave(e: RendererElement) {
    e.classList.add('is-leave')
  },
}
</script>
