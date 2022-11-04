<template>
  <label
    :class="[
      ns.b('button'),
      ns.bm('button', checkboxButtonSize),
      ns.is('disabled', isDisabled),
      ns.is('checked', isChecked),
      ns.is('focus', isFocused),
    ]"
    :style="styles"
  >
    <input
      v-if="trueLabel || falseLabel"
      v-model="model"
      :class="ns.be('button', 'original')"
      type="checkbox"
      :name="name"
      :tabindex="tabindex"
      :disabled="isDisabled"
      :true-value="trueLabel"
      :false-value="falseLabel"
      @change="handleChange"
      @focus="isFocused = true"
      @blur="isFocused = false"
    />
    <input
      v-else
      v-model="model"
      :class="ns.be('button', 'original')"
      type="checkbox"
      :name="name"
      :tabindex="tabindex"
      :disabled="isDisabled"
      :value="label"
      @change="handleChange"
      @focus="isFocused = true"
      @blur="isFocused = false"
    />

    <span
      v-if="$slots.default || label"
      :class="ns.be('button', 'inner')"
      :style="isChecked ? activeStyle : undefined"
    >
      <ripple-wrapper :disabled="isDisabled" />
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<script lang="ts" setup>
import { computed, inject, useSlots } from 'vue'
import { useNamespace } from '@follow-ui/hooks'
import { checkboxGroupContextKey } from '@follow-ui/tokens'
import { rippleWrapper } from '../../ripple'
import { checkboxEmits, checkboxProps, useCheckbox } from './ts'
import type { CSSProperties } from 'vue'

defineOptions({
  name: 'FlCheckboxButton',
})

const ns = useNamespace('checkbox')
const props = defineProps(checkboxProps)
defineEmits(checkboxEmits)
const slots = useSlots()

const {
  isFocused,
  isChecked,
  isDisabled,
  checkboxButtonSize,
  model,
  handleChange,
  styles,
} = useCheckbox(props, slots, ns)
const checkboxGroup = inject(checkboxGroupContextKey, undefined)

const activeStyle = computed<CSSProperties>(() => {
  const fillValue = checkboxGroup?.fill?.value ?? ''
  return {
    backgroundColor: fillValue,
    borderColor: fillValue,
    color: checkboxGroup?.textColor?.value ?? '',
    boxShadow: fillValue ? `-1px 0 0 0 ${fillValue}` : undefined,
  }
})
</script>
