<template>
  <label
    :class="[
      ns.b('button'),
      ns.is('active', modelValue === label),
      ns.is('disabled', disabled),
      ns.is('focus', focus),
      ns.bm('button', size),
    ]"
    :style="styles"
  >
    <input
      ref="radioRef"
      v-model="modelValue"
      :class="ns.be('button', 'original-radio')"
      :value="label"
      type="radio"
      :name="name || radioGroup?.name"
      :disabled="disabled"
      @focus="focus = true"
      @blur="focus = false"
    />
    <span
      :class="ns.be('button', 'inner')"
      :style="modelValue === label ? activeStyle : {}"
      @keydown.stop
    >
      <ripple-wrapper :disabled="disabled" />
      <slot>
        {{ label }}
      </slot>
    </span>
  </label>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useNamespace } from '@follow-ui/hooks'
import { rippleWrapper } from '../../ripple'
import { radioButtonProps, useRadio } from './ts'
import type { CSSProperties } from 'vue'

defineOptions({
  name: 'FlRadioButton',
})

const props = defineProps(radioButtonProps)

const ns = useNamespace('radio')
const { radioRef, focus, size, disabled, modelValue, radioGroup, styles } =
  useRadio(props, undefined, ns)

const activeStyle = computed<CSSProperties>(() => {
  return {
    backgroundColor: radioGroup?.fill || '',
    borderColor: radioGroup?.fill || '',
    boxShadow: radioGroup?.fill ? `-1px 0 0 0 ${radioGroup.fill}` : '',
    color: radioGroup?.textColor || '',
  }
})
</script>
