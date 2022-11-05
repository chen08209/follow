<template>
  <button
    ref="buttonRef"
    :class="[
      ns.b(),
      ns.m(type),
      ns.m(size),
      ns.is('disabled', disabled),
      ns.is('loading', loading),
      ns.is('plain', plain),
      ns.is('round', round),
      ns.is('circle', circle),
      ns.is('text', text),
      ns.is('link', link),
      ns.is('has-bg', bg),
    ]"
    :aria-disabled="disabled || loading"
    :disabled="disabled || loading"
    :autofocus="autofocus"
    :type="nativeType"
    :style="buttonStyle"
    @click="handleClick"
  >
    <ripple-wrapper v-if="isRipple" :disabled="disabled" />
    <template v-if="iconPosition !== 'right'">
      <template v-if="loading">
        <slot v-if="$slots.loading" name="loading" />
        <fl-icon v-else :class="ns.is('loading')">
          <component :is="loadingIcon" />
        </fl-icon>
      </template>
      <fl-icon v-else-if="icon || $slots.icon">
        <component :is="icon" v-if="icon" />
        <slot v-else name="icon" />
      </fl-icon>
    </template>
    <span
      v-if="$slots.default"
      :class="{ [ns.em('text', 'expand')]: shouldAddSpace }"
    >
      <slot />
    </span>
    <template v-if="iconPosition === 'right'">
      <template v-if="loading">
        <slot v-if="$slots.loading" name="loading" />
        <fl-icon v-else :class="ns.is('loading')">
          <component :is="loadingIcon" />
        </fl-icon>
      </template>
      <fl-icon v-else-if="icon || $slots.icon">
        <component :is="icon" v-if="icon" />
        <slot v-else name="icon" />
      </fl-icon>
    </template>
  </button>
</template>

<script setup lang="ts">
import { Text, computed, inject, ref, useSlots } from 'vue'
import {
  useDisabled,
  useFormItem,
  useGlobalConfig,
  useNamespace,
  useSize,
} from '@follow-ui/hooks'
import { buttonGroupContextKey } from '@follow-ui/tokens'
import { FlIcon } from '../../icon'
import { rippleWrapper } from '../../ripple'
import { buttonEmits, buttonProps, useButtonCustomStyle } from './ts'

defineOptions({
  name: 'FlButton',
})

const props = defineProps(buttonProps)

const emit = defineEmits(buttonEmits)

const slots = useSlots()

const buttonGroupContext = inject(buttonGroupContextKey, undefined)
const globalConfig = useGlobalConfig('button')

const ns = useNamespace('button')
const { form } = useFormItem()
const size = useSize(computed(() => buttonGroupContext?.size))
const disabled = useDisabled()
const buttonRef = ref<HTMLButtonElement>()

const type = computed(() => props.type || buttonGroupContext?.type || '')
const isRipple = computed(() => props.ripple && !props.link)
const autoInsertSpace = computed(
  () => props.autoInsertSpace ?? globalConfig.value?.autoInsertSpace ?? false
)
// 是否在两个汉字中添加空格
const shouldAddSpace = computed(() => {
  const defaultSlot = slots.default?.()
  if (autoInsertSpace.value && defaultSlot?.length === 1) {
    const slot = defaultSlot[0]
    if (slot?.type === Text) {
      const text = slot.children as string

      ///^\p{Unified_Ideograph}{2}$/u => 匹配两个汉字
      return /^\p{Unified_Ideograph}{2}$/u.test(text.trim())
    }
  }
  return false
})
//按钮颜色
const buttonStyle = useButtonCustomStyle(props)

const handleClick = (evt: MouseEvent) => {
  if (props.nativeType === 'reset') {
    form?.resetFields()
  }
  emit('click', evt)
}

defineExpose({
  ref: buttonRef,
  size,
  type,
  disabled,
  shouldAddSpace,
})
</script>
