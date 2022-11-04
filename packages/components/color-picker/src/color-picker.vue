<template>
  <fl-tooltip
    ref="popper"
    :visible="showPicker"
    :show-arrow="false"
    :fallback-placements="['bottom', 'top', 'right', 'left']"
    :gpu-acceleration="false"
    :popper-class="[ns.be('picker', 'panel'), ns.b('dropdown'), popperClass]"
    :stop-popper-mouse-event="false"
    effect="light"
    trigger="click"
    :transition="`${ns.namespace.value}-zoom-in-top`"
    persistent
  >
    <template #content>
      <div v-click-outside="hide">
        <div :class="ns.be('dropdown', 'main-wrapper')">
          <!-- 色度滑块 -->
          <hue-slider ref="hue" class="hue-slider" :color="color" vertical />
          <sv-panel ref="sv" :color="color" />
        </div>
        <!-- 透明度滑块 -->
        <alpha-slider v-if="showAlpha" ref="alpha" :color="color" />
        <predefine
          v-if="predefine"
          ref="predefine"
          :color="color"
          :colors="predefine"
        />
        <div :class="ns.be('dropdown', 'btns')">
          <span :class="ns.be('dropdown', 'value')">
            <fl-input
              v-model="customInput"
              :validate-event="false"
              size="small"
              @keyup.enter="handleConfirm"
              @blur="handleConfirm"
            />
          </span>
          <fl-button
            :class="ns.be('dropdown', 'link-btn')"
            text
            size="small"
            @click="clear"
          >
            {{ t('fl.colorpicker.clear') }}
          </fl-button>
          <fl-button
            plain
            size="small"
            :class="ns.be('dropdown', 'btn')"
            @click="confirmValue"
          >
            {{ t('fl.colorpicker.confirm') }}
          </fl-button>
        </div>
      </div>
    </template>
    <template #default>
      <fl-button
        :id="buttonId"
        plain
        :class="[
          ns.b('picker'),
          ns.bm('picker', colorSize),
          ns.is('only-color', !showLabel || !customInput),
        ]"
        role="button"
        :aria-label="buttonAriaLabel"
        :aria-labelledby="buttonAriaLabelledby"
        :aria-description="
          t('fl.colorpicker.description', { color: modelValue || '' })
        "
        :tabindex="tabindex"
        :disabled="colorDisabled"
        :color="currentColor"
        @click="handleTrigger"
        @keydown.enter="handleTrigger"
      >
        <span
          v-if="showLabel && customInput"
          :class="ns.be('picker', 'label')"
          >{{ customInput }}</span
        >
        <span :class="[ns.be('picker', 'color'), ns.is('alpha', showAlpha)]">
          <span
            :class="ns.be('picker', 'color-inner')"
            :style="{
              backgroundColor: displayedColor,
            }"
          />
        </span>
      </fl-button>
    </template>
  </fl-tooltip>
</template>

<script lang="ts" setup>
import { onMounted, provide } from 'vue'
import { ClickOutside as vClickOutside } from '@follow-ui/directives'
import { useNamespace } from '@follow-ui/hooks'
import { colorPickerContextKey } from '@follow-ui/tokens'
import { FlButton } from '../../button'
import { FlTooltip } from '../../tooltip'
import { FlInput } from '../../input'
import HueSlider from './components/hue-slider.vue'
import SvPanel from './components/sv-panel.vue'
import AlphaSlider from './components/alpha-slider.vue'
import Predefine from './components/predefine.vue'
import { colorPickerEmits, colorPickerProps, useColorPicker } from './ts'
defineOptions({
  name: 'FlColorPicker',
})
const props = defineProps(colorPickerProps)
const emit = defineEmits(colorPickerEmits)

const ns = useNamespace('color')

const {
  t,
  hue,
  sv,
  alpha,
  color,
  showPicker,
  currentColor,
  customInput,
  colorSize,
  buttonId,
  popper,
  colorDisabled,
  displayedColor,
  buttonAriaLabel,
  buttonAriaLabelledby,
  hide,
  handleTrigger,
  handleConfirm,
  confirmValue,
  clear,
} = useColorPicker(props, emit)

onMounted(() => {
  if (props.modelValue) {
    customInput.value = currentColor.value
  }
})

provide(colorPickerContextKey, {
  currentColor,
})

defineExpose({
  color,
})
</script>
