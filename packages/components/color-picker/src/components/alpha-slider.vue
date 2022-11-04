<template>
  <div :class="[ns.b(), ns.is('vertical', vertical)]">
    <div
      ref="bar"
      :class="ns.e('bar')"
      :style="{
        background,
      }"
      @click="handleClick"
    />
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
import { getCurrentInstance, onMounted, ref, shallowRef, watch } from 'vue'
import { definePropType, getClientXY } from '@follow-ui/utils'
import { useNamespace } from '@follow-ui/hooks'
import { draggable } from '../ts'
import type { Color } from '../ts'
defineOptions({
  name: 'FlColorAlphaSlider',
})
const props = defineProps({
  color: {
    type: definePropType<Color>([Object]),
    required: true,
  },
  vertical: {
    type: Boolean,
    default: false,
  },
})

const ns = useNamespace('color-alpha-slider')

const instance = getCurrentInstance()!
const thumb = shallowRef<HTMLElement>()
const bar = shallowRef<HTMLElement>()
const thumbLeft = ref(0)
const thumbTop = ref(0)
const background = ref<string>()

//获取thumb的left(仅限于水平布局)
const getThumbLeft = () => {
  if (!thumb.value) return 0

  if (props.vertical) return 0
  //获取当前元素
  const el = instance.vnode.el
  //获取透明度
  const alpha = props.color.get('alpha')
  if (!el) return 0
  //通过透明度和当前元素可用长度获得left
  return Math.round(
    (alpha * (el.offsetWidth - thumb.value.offsetWidth / 2)) / 100
  )
}
//获取thumb的top(仅限于垂直布局),同getThumbLeft
const getThumbTop = () => {
  if (!thumb.value) return 0

  const el = instance.vnode.el
  if (!props.vertical) return 0
  const alpha = props.color.get('alpha')

  if (!el) return 0
  return Math.round(
    (alpha * (el.offsetHeight - thumb.value.offsetHeight / 2)) / 100
  )
}
//获取bar的背景颜色
const getBackground = () => {
  if (props.color && props.color.value) {
    const { r, g, b } = props.color.toRgb()
    return `linear-gradient(to right, rgba(${r}, ${g}, ${b}, 0) 0%, rgba(${r}, ${g}, ${b}, 1) 100%)`
  }
  return ''
}
//单击事件
const handleClick = (event: MouseEvent | TouchEvent) => {
  const target = event.target
  if (target !== thumb.value) {
    handleDrag(event)
  }
}

//处理拖拽
const handleDrag = (event: MouseEvent | TouchEvent) => {
  if (!bar.value || !thumb.value) return
  //获取bar
  const el = instance.vnode.el as HTMLElement
  //获取bar的大小以及位置
  const rect = el.getBoundingClientRect()
  //获取clientX, clientY
  const { clientX, clientY } = getClientXY(event)
  //根据布局,设置颜色透明度
  if (!props.vertical) {
    //获取点击处到bar左边的距离
    let left = clientX - rect.left
    //左边距至少要有二分之一的thumb.value.offsetWidth
    left = Math.max(thumb.value.offsetWidth / 2, left)
    //左边距最多只有 rect.width - 二分之一的thumb.value.offsetWidth
    left = Math.min(left, rect.width - thumb.value.offsetWidth / 2)
    /**
     * 设置透明度
     * Math.round +0.5,取最小整数
     * left - thumb.value.offsetWidth / 2 左边距离thumb中心的距离
     * rect.width - thumb.value.offsetWidth 总长度
     */
    props.color.set(
      'alpha',
      Math.round(
        ((left - thumb.value.offsetWidth / 2) /
          (rect.width - thumb.value.offsetWidth)) *
          100
      )
    )
  } else {
    let top = clientY - rect.top
    top = Math.max(thumb.value.offsetHeight / 2, top)
    top = Math.min(top, rect.height - thumb.value.offsetHeight / 2)

    props.color.set(
      'alpha',
      Math.round(
        ((top - thumb.value.offsetHeight / 2) /
          (rect.height - thumb.value.offsetHeight)) *
          100
      )
    )
  }
}
//更新方法
const update = () => {
  //设置thumb的left
  thumbLeft.value = getThumbLeft()
  //设置thumb的top
  thumbTop.value = getThumbTop()
  //设置bar的background
  background.value = getBackground()
}

//监听颜色透明度调用update
watch(
  () => props.color.get('alpha'),
  () => {
    update()
  }
)
//监听颜色调用update
watch(
  () => props.color.value,
  () => {
    update()
  }
)

onMounted(() => {
  //如果bar获取thumb有一个不存在,返回
  if (!bar.value || !thumb.value) return
  //拖动配置
  const dragConfig = {
    drag: (event: MouseEvent | TouchEvent) => {
      handleDrag(event)
    },
    end: (event: MouseEvent | TouchEvent) => {
      handleDrag(event)
    },
  }

  //监听拖动事件
  draggable(bar.value, dragConfig)
  draggable(thumb.value, dragConfig)
  update()
})

defineExpose({
  update,
})
</script>
