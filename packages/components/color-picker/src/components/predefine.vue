<template>
  <div :class="ns.b()">
    <div :class="ns.e('colors')">
      <div
        v-for="(item, index) in rgbaColors"
        :key="colors[index]"
        :class="[
          ns.e('color-selector'),
          ns.is('alpha', item._alpha < 100),
          { selected: item.selected },
        ]"
        @click="handleSelect(index)"
      >
        <div :style="{ backgroundColor: item.value }" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { inject, ref, watch, watchEffect } from 'vue'
import { useNamespace } from '@follow-ui/hooks'
import { colorPickerContextKey } from '@follow-ui/tokens'
import { Color } from '../ts'
import type { PropType, Ref } from 'vue'
const props = defineProps({
  colors: {
    type: Array as PropType<string[]>,
    required: true,
  },
  color: {
    type: Object as PropType<Color>,
    required: true,
  },
})

const ns = useNamespace('color-predefine')
const { currentColor } = inject(colorPickerContextKey)!

watchEffect(() => {
  rgbaColors.value = parseColors(props.colors, props.color)
})

const handleSelect = (index: number) => {
  props.color.fromString(props.colors[index])
}

const parseColors = (colors: string[], color: Color) => {
  return colors.map((value) => {
    const c = new Color()
    c.enableAlpha = true
    c.format = 'rgba'
    c.fromString(value)
    c.selected = c.value === color.value
    return c
  })
}

const rgbaColors = ref(parseColors(props.colors, props.color)) as Ref<Color[]>

watch(
  () => currentColor.value,
  (val) => {
    const color = new Color()
    color.fromString(val)

    rgbaColors.value.forEach((item) => {
      item.selected = color.compare(item)
    })
  }
)
</script>
