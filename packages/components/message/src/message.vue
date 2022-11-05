<template>
  <transition
    :name="ns.b('fade')"
    @before-leave="onClose"
    @after-leave="$emit('destroy')"
  >
    <div
      v-show="visible"
      :id="id"
      ref="messageRef"
      :class="[
        ns.b(),
        { [ns.m(type)]: type && !icon },
        ns.is('center', center),
        ns.is('closable', showClose),
        customClass,
      ]"
      :style="customStyle"
      role="alert"
      @mouseenter="clearTimer"
      @mouseleave="startTimer"
    >
      <fl-badge
        v-if="repeatNum > 1"
        :value="repeatNum"
        :type="badgeType"
        :class="ns.e('badge')"
      />
      <fl-icon v-if="iconComponent" :class="[ns.e('icon'), typeClass]">
        <component :is="iconComponent" />
      </fl-icon>
      <slot>
        <p v-if="!html" :class="ns.e('content')">
          {{ message }}
        </p>
        <p v-else :class="ns.e('content')" v-html="message" />
      </slot>
      <fl-icon v-if="showClose" :class="ns.e('closeBtn')" @click.stop="close">
        <Close />
      </fl-icon>
    </div>
  </transition>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useEventListener, useResizeObserver, useTimeoutFn } from '@vueuse/core'
import { TypeComponents, TypeComponentsMap } from '@follow-ui/utils'
import { EVENT_CODE } from '@follow-ui/constants'
import { useNamespace } from '@follow-ui/hooks'
import { FlBadge } from '../../../components/badge'
import { FlIcon } from '../../../components/icon'
import { getLastOffset, messageEmits, messageProps } from './ts'
import type { BadgeProps } from '@follow-ui/components/badge'
import type { CSSProperties } from 'vue'

const { Close } = TypeComponents

defineOptions({
  name: 'FlMessage',
})

const props = defineProps(messageProps)
defineEmits(messageEmits)

const ns = useNamespace('message')

const messageRef = ref<HTMLDivElement>()
const visible = ref(false)
const height = ref(0)

let stopTimer: (() => void) | undefined = undefined

const badgeType = computed<BadgeProps['type']>(() =>
  props.type ? (props.type === 'error' ? 'danger' : props.type) : 'info'
)

const typeClass = computed(() => {
  const type = props.type
  return { [ns.bm('icon', type)]: type && TypeComponentsMap[type] }
})

const iconComponent = computed(
  () => props.icon || TypeComponentsMap[props.type] || ''
)
//上一个元素的偏移量
const lastOffset = computed(() => getLastOffset(props.id))
//当前元素偏移量
const offset = computed(() => props.offset + lastOffset.value)
//获得bottom,用于计算下一个元素的偏移量
const bottom = computed((): number => height.value + offset.value)
const customStyle = computed<CSSProperties>(() => ({
  top: `${offset.value}px`,
  zIndex: props.zIndex,
}))

//开始计时
const startTimer = () => {
  //如果持续实践为0,返回
  if (props.duration === 0) return
  ;({ stop: stopTimer } = useTimeoutFn(() => {
    close()
  }, props.duration))
}

//清除计时
const clearTimer = () => {
  stopTimer?.()
}

//关闭
const close = () => {
  visible.value = false
}

//鼠标按下事件
const keydown = ({ code }: KeyboardEvent) => {
  if (code === EVENT_CODE.esc) {
    close()
  }
}

//挂载阶段开始计时
onMounted(() => {
  startTimer()
  visible.value = true
})

watch(
  () => props.repeatNum,
  () => {
    clearTimer()
    startTimer()
  }
)

//鼠标按下钩子
useEventListener(document, 'keydown', keydown)

//监听大小变化事件
useResizeObserver(messageRef, () => {
  height.value = messageRef.value!.getBoundingClientRect().height
})

defineExpose({
  visible,
  bottom,
  close,
})
</script>
