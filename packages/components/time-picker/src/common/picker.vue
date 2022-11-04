<template>
  <fl-tooltip
    ref="popperRef"
    pure
    teleported
    effect="light"
    trigger="click"
    v-bind="$attrs"
    role="dialog"
    :visible="pickerVisible"
    :show-arrow="false"
    :transition="`${nsDate.namespace.value}-zoom-in-top`"
    :popper-class="[`${nsDate.namespace.value}-picker__popper`, popperClass]"
    :popper-options="flPopperOptions"
    :fallback-placements="['bottom', 'top', 'right', 'left']"
    :gpu-acceleration="false"
    :stop-popper-mouse-e="false"
    :hide-after="100"
    persistent
    @before-show="onBeforeShow"
    @show="onShow"
    @hide="onHide"
  >
    <template #default>
      <fl-input
        v-if="!isRangeInput"
        :id="(id as string | undefined)"
        ref="inputRef"
        container-role="combobox"
        :model-value="(displayValue as string)"
        :name="name"
        :size="pickerSize"
        :disabled="pickerDisabled"
        :placeholder="placeholder"
        :class="[nsDate.b('editor'), nsDate.bm('editor', type), $attrs.class]"
        :style="$attrs.style"
        :readonly="!editable || readonly || isDatesPicker || type === 'week'"
        :label="label"
        :tabindex="tabindex"
        :validate-e="false"
        @input="handleInput"
        @focus="handleFocusInput"
        @blur="handleBlurInput"
        @change="handleChange"
        @mousedown="onMouseDownInput"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
        @touchstart="onTouchStartInput"
        @click.stop
        @keydown="handleKeydownInput"
      >
        <template #prefix>
          <fl-icon
            v-if="triggerIcon"
            :class="nsInput.e('icon')"
            @mousedown.prevent="onMouseDownInput"
            @touchstart="onTouchStartInput"
          >
            <component :is="triggerIcon" />
          </fl-icon>
        </template>
        <template #suffix>
          <fl-icon
            v-if="showClear && clearIcon"
            :class="`${nsInput.e('icon')} clear-icon`"
            @click.stop="handleClear"
          >
            <component :is="clearIcon" />
          </fl-icon>
        </template>
      </fl-input>
      <div
        v-else
        ref="inputRef"
        :class="[
          nsDate.b('editor'),
          nsDate.bm('editor', type),
          nsInput.e('wrapper'),
          nsDate.is('disabled', pickerDisabled),
          nsDate.is('active', pickerVisible),
          nsRange.b('editor'),
          pickerSize ? nsRange.bm('editor', pickerSize) : '',
          $attrs.class,
        ]"
        :style="($attrs.style as any)"
        @click="handleFocusInput"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
        @touchstart="onTouchStartInput"
        @keydown="handleKeydownInput"
      >
        <fl-icon
          v-if="triggerIcon"
          :class="[nsInput.e('icon'), nsRange.e('icon')]"
          @mousedown.prevent="onMouseDownInput"
          @touchstart="onTouchStartInput"
        >
          <component :is="triggerIcon" />
        </fl-icon>
        <input
          :id="id && id[0]"
          autocomplete="off"
          :name="name && name[0]"
          :placeholder="startPlaceholder"
          :value="displayValue && displayValue[0]"
          :disabled="pickerDisabled"
          :readonly="!editable || readonly"
          :class="nsRange.b('input')"
          @mousedown="onMouseDownInput"
          @input="handleStartInput"
          @change="handleStartChange"
          @focus="handleFocusInput"
          @blur="handleBlurInput"
        />
        <slot name="range-separator">
          <span :class="nsRange.b('separator')">{{ rangeSeparator }}</span>
        </slot>
        <input
          :id="id && id[1]"
          autocomplete="off"
          :name="name && name[1]"
          :placeholder="endPlaceholder"
          :value="displayValue && displayValue[1]"
          :disabled="pickerDisabled"
          :readonly="!editable || readonly"
          :class="nsRange.b('input')"
          @mousedown="onMouseDownInput"
          @focus="handleFocusInput"
          @blur="handleBlurInput"
          @input="handleEndInput"
          @change="handleEndChange"
        />
        <fl-icon
          v-if="clearIcon"
          :class="[
            nsInput.e('icon'),
            nsRange.e('close-icon'),
            {
              [nsRange.e('close-icon--hidden')]: !showClear,
            },
          ]"
          @click="handleClear"
        >
          <component :is="clearIcon" />
        </fl-icon>
      </div>
    </template>
    <template #content>
      <slot
        :visible="pickerVisible"
        :actual-visible="pickerActualVisible"
        :parsed-value="parsedValue"
        :format="format"
        :unlink-panels="unlinkPanels"
        :type="type"
        :default-value="defaultValue"
        @pick="onPick"
        @select-range="setSelectionRange"
        @set-picker-option="onSetPickerOption"
        @calendar-change="onCalendarChange"
        @panel-change="onPanelChange"
        @keydown="onKeydownPopperContent"
        @mousedown.stop
      />
    </template>
  </fl-tooltip>
</template>
<script setup lang="ts">
import { FlInput } from '../../../input'
import { FlIcon } from '../../../icon'
import { FlTooltip } from '../../../tooltip'
import { pickerEmits, pickerProps, usePicker } from '../ts'

const props = defineProps(pickerProps)

const emit = defineEmits(pickerEmits)

const {
  popperRef,
  inputRef,
  onPick,
  onHide,
  onShow,
  nsDate,
  nsInput,
  nsRange,
  showClear,
  displayValue,
  parsedValue,
  pickerSize,
  pickerDisabled,
  pickerActualVisible,
  pickerVisible,
  flPopperOptions,
  isRangeInput,
  isDatesPicker,
  handleOpen,
  handleClose,
  handleChange,
  handleFocusInput,
  triggerIcon,
  handleClear,
  setSelectionRange,
  onBeforeShow,
  onMouseDownInput,
  onMouseEnter,
  onKeydownPopperContent,
  onMouseLeave,
  handleKeydownInput,
  onTouchStartInput,
  handleBlurInput,
  handleInput,
  handleStartInput,
  handleEndInput,
  handleStartChange,
  handleEndChange,
  onSetPickerOption,
  onCalendarChange,
  onPanelChange,
} = usePicker(props, emit)

defineExpose({
  focus,
  handleFocusInput,
  handleBlurInput,
  handleOpen,
  handleClose,
  onPick,
})
</script>
