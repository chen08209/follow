<template>
  <div ref="scrollbar" :class="ns.b()">
    <div
      ref="wrap"
      :class="[
        wrapClass,
        ns.e('wrap'),
        { [ns.em('wrap', 'hidden-default')]: !native },
      ]"
      :style="style"
      @scroll="handleScroll"
    >
      <component
        :is="tag"
        ref="resize"
        :class="[ns.e('view'), viewClass]"
        :style="viewStyle"
      >
        <slot />
      </component>
    </div>
    <template v-if="!native">
      <bar
        ref="barRef"
        :height="sizeHeight"
        :width="sizeWidth"
        :always="always"
        :ratio-x="ratioX"
        :ratio-y="ratioY"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onMounted,
  onUpdated,
  provide,
  reactive,
  ref,
  watch,
} from 'vue'
import { useNamespace } from '@follow-ui/hooks'
import {
  addUnit,
  debugWarn,
  isNumber,
  isObject,
  scrollbarContextKey,
} from '@follow-ui/utils'
import { useEventListener, useResizeObserver } from '@vueuse/core'
import { GAP, scrollbarEmits, scrollbarProps } from './ts'
import Bar from './bar.vue'
import type { BarInstance } from './ts'
import type { CSSProperties, StyleValue } from 'vue'

defineOptions({
  name: 'FlScrollbar',
})

const props = defineProps(scrollbarProps)
const emit = defineEmits(scrollbarEmits)

const ns = useNamespace('scrollbar')
let stopResizeObserver: (() => void) | undefined = undefined
let stopResizeListener: (() => void) | undefined = undefined

const scrollbar = ref<HTMLDivElement>()
const wrap = ref<HTMLDivElement>()
const resize = ref<HTMLElement>()

const sizeWidth = ref('0')
const sizeHeight = ref('0')
const barRef = ref<BarInstance>()
const ratioY = ref(1)
const ratioX = ref(1)
const SCOPE = 'FlScrollbar'

const style = computed<StyleValue>(() => {
  const style: CSSProperties = {}
  if (props.height) style.height = addUnit(props.height)
  if (props.maxHeight) style.maxHeight = addUnit(props.maxHeight)
  return [props.wrapStyle, style]
})

const handleScroll = () => {
  if (wrap.value) {
    barRef.value?.handleScroll(wrap.value)
    emit('scroll', {
      scrollTop: wrap.value.scrollTop,
      scrollLeft: wrap.value.scrollLeft,
    })
  }
}

function scrollTo(arg1: unknown, arg2?: number) {
  if (isObject(arg1)) {
    wrap.value!.scrollTo(arg1)
  } else if (isNumber(arg1) && isNumber(arg2)) {
    wrap.value!.scrollTo(arg1, arg2)
  }
}

const setScrollTop = (value: number) => {
  if (!isNumber(value)) {
    debugWarn(SCOPE, 'value must be a number')
    return
  }
  wrap.value!.scrollTop = value
}

const setScrollLeft = (value: number) => {
  if (!isNumber(value)) {
    debugWarn(SCOPE, 'value must be a number')
    return
  }
  wrap.value!.scrollLeft = value
}

const update = () => {
  if (!wrap.value) return
  const offsetHeight = wrap.value.offsetHeight - GAP
  const offsetWidth = wrap.value.offsetWidth - GAP

  const originalHeight = offsetHeight ** 2 / wrap.value.scrollHeight
  const originalWidth = offsetWidth ** 2 / wrap.value.scrollWidth
  const height = Math.max(originalHeight, props.minSize)
  const width = Math.max(originalWidth, props.minSize)

  ratioY.value =
    originalHeight /
    (offsetHeight - originalHeight) /
    (height / (offsetHeight - height))
  ratioX.value =
    originalWidth /
    (offsetWidth - originalWidth) /
    (width / (offsetWidth - width))

  sizeHeight.value = height + GAP < offsetHeight ? `${height}px` : ''
  sizeWidth.value = width + GAP < offsetWidth ? `${width}px` : ''
}

watch(
  () => props.noResize,
  (noResize) => {
    if (noResize) {
      stopResizeObserver?.()
      stopResizeListener?.()
    } else {
      ;({ stop: stopResizeObserver } = useResizeObserver(resize, update))
      stopResizeListener = useEventListener('resize', update)
    }
  },
  { immediate: true }
)

watch(
  () => [props.maxHeight, props.height],
  () => {
    if (!props.native)
      nextTick(() => {
        update()
        if (wrap.value) {
          barRef.value?.handleScroll(wrap.value)
        }
      })
  }
)

provide(
  scrollbarContextKey,
  reactive({
    scrollbarElement: scrollbar,
    wrapElement: wrap,
  })
)

onMounted(() => {
  if (!props.native)
    nextTick(() => {
      update()
    })
})
onUpdated(() => update())

defineExpose({
  wrap,
  update,
  scrollTo,
  setScrollTop,
  setScrollLeft,
  handleScroll,
})
</script>
