<template>
  <div
    :class="[
      ns.b('editor'),
      ns.is('range', isRange),
      nsInput.e('wrapper'),
      ns.is('disabled', pickerDisabled),
      ns.is('active', pickerActive),
      pickerSize ? ns.bm('editor', pickerSize) : '',
    ]"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <fl-icon class="mode-icon"><Clock /></fl-icon>
    <template v-for="(role, index) in roles" :key="role">
      <fl-tooltip
        :ref="(tooltip: any) => setTooltipRef(tooltip, role)"
        persistent
        effect="light"
        trigger="click"
        role="dialog"
        :show-arrow="false"
        :visible="pickerVisible[role]"
        :transition="`${ns.namespace.value}-zoom-in-top`"
        :popper-class="[`${ns.namespace.value}-picker__popper`]"
        :popper-options="flPopperOptions"
        :fallback-placements="['bottom', 'top', 'right', 'left']"
        :hide-after="100"
        :gpu-acceleration="false"
        :stop-popper-mouse-e="false"
      >
        <template #default>
          <input
            :ref="(input: any) => setInputRef(input, role)"
            :value="displayValue[index]"
            :disabled="pickerDisabled"
            :readonly="readonly"
            :placeholder="
              placeholder?.[role] ??
              placeholder ??
              t(`fl.${mode}picker.placeholder.${role}`)
            "
            @change="handleChangeInput($event, role)"
            @focus="handleFocusInput(role)"
            @blur="handleBlurInput(role)"
          />
        </template>
        <template #content>
          <slot
            :parsed-value="parsedValue"
            :show-seconds="showSeconds"
            :role="role"
            @pick="onPick"
          />
        </template>
      </fl-tooltip>
      <slot v-if="role === 'start'" name="separator">
        <span class="separator">{{ separator }}</span>
      </slot>
    </template>
    <fl-icon v-show="clearable && showClear" class="clear-icon" @click.stop="handleClear">
      <CircleClose />
    </fl-icon>
  </div>
</template>
<script setup lang="ts">
import { computed, inject, provide, ref, unref, watch } from 'vue'
import { useFormItem, useLocale, useNamespace, useSize } from '@follow-ui/hooks'
import { PICKER_BASE, PICKER_POPPER_OPTIONS } from '@follow-ui/tokens'
import { isArray } from '@follow-ui/utils'
import dayjs from 'dayjs'
import { onClickOutside } from '@vueuse/core'
import { CircleClose, Clock } from '@element-plus/icons-vue'
import { FlTooltip } from '../../tooltip'
import { FlIcon } from '../../icon'
import { pickerProps } from './picker'
import type { Options } from '@popperjs/core'
import type { Dayjs } from 'dayjs'
import type { ComputedRef } from 'vue'

const props = defineProps(pickerProps)
const emit = defineEmits(['update:modelValue'])
const flPopperOptions = inject(PICKER_POPPER_OPTIONS, {} as Options)

const ns = useNamespace('picker')
const nsInput = useNamespace('input')
const { t } = useLocale()
const { form } = useFormItem()
const pickerSize = useSize()
const pickerDisabled = computed(() => {
  return props.disabled || form?.disabled
})

let stopHandleList: ReturnType<typeof onClickOutside>[] = []
const inputRef = ref({})
const tooltipRef = ref({})
const pickerVisible = ref({})
const pickerActive = ref()

const shouldPrevent = () => props.readonly || pickerDisabled.value

//view相关处理

const hasClear = ref(false)

const showClear = computed(() => props.modelValue && hasClear.value)

const setInputRef = (inputInstance: any, role: string) => {
  inputRef.value[role] = inputInstance
}

const setTooltipRef = (tooltipInstance: any, role: string) => {
  tooltipRef.value[role] = tooltipInstance
}

const handleFocusInput = (role: string) => {
  if (shouldPrevent()) {
    return
  }
  pickerActive.value = true
  pickerVisible.value[role] = true
}

const handleBlurInput = (role: string) => {
  setTimeout(() => {
    if (
      !tooltipRef.value[role].isFocusInsideContent() &&
      !inputRef.value[role].contains(document.activeElement)
    ) {
      pickerVisible.value[role] = false
      pickerActive.value = false
    }
  }, 0)
}

const onMouseEnter = () => {
  if (shouldPrevent()) {
    return
  }
  hasClear.value = true
}

const onMouseLeave = () => {
  hasClear.value = false
}

//value相关处理
const valueIsEmpty = computed(() => {
  const { modelValue } = props
  return (
    !modelValue || (isArray(modelValue) && !modelValue.filter(Boolean).length)
  )
})

const roles = computed(() => {
  if (props.isRange) {
    return ['start', 'end']
  } else {
    return ['default']
  }
})

const parsedValue: ComputedRef<Dayjs[]> = computed(() => {
  if (valueIsEmpty.value) {
    return roles.value.map(() => dayjs())
  } else {
    if (isArray(props.modelValue)) {
      return roles.value.map((_, index) => {
        return dayjs(props.modelValue[index])
      })
    } else {
      return roles.value.map(() => dayjs(props.modelValue as Date))
    }
  }
})

const displayValue: ComputedRef<string[]> = computed(() => {
  if (valueIsEmpty.value) {
    return []
  } else {
    return parsedValue.value.map((item) => formatToString(item))
  }
})

const formatToString = (dayjs: Dayjs) => {
  return dayjs.format(props.valueFormat)
}

const onPick = (date: Dayjs, role: string, visible = false) => {
  pickerVisible.value[role] = visible
  emitInput(date, role)
}

const handleClear = (e) => {
  if (shouldPrevent() || !showClear.value) return
  //停止传播
  e.stopPropagation()
  emitInput(null)
  hasClear.value = false
  pickerVisible.value = {}
}

const emitInput = (date: Dayjs | null, role?: string) => {
  if (!role) {
    emit('update:modelValue', null)
  } else if (role === 'default') {
    const result = date ? date.toDate() : dayjs()
    emit('update:modelValue', result)
  } else {
    const reviseDate = date!.toDate()
    const result = isArray(props.modelValue)
      ? props.modelValue
      : parsedValue.value.map((item) => item.millisecond(0).toDate())
    if (role === 'start') {
      if (reviseDate.valueOf() <= result[1].valueOf()) {
        result[0] = reviseDate
        emit('update:modelValue', result)
      }
    } else {
      if (result[0].valueOf() <= reviseDate.valueOf()) {
        result[1] = reviseDate
        emit('update:modelValue', result)
      }
    }
  }
}

//输入事件
const handleChangeInput = (e: Event, role: string) => {
  const target = e.target as HTMLInputElement
  const date = parseInput(target.value)
  if (date?.isValid()) {
    emitInput(date, role)
  }
}

const parseInput = (value: string) => {
  if (!value) return null
  return dayjs(value, props.valueFormat)
}

watch(
  () => pickerVisible.value,
  (visible) => {
    if (visible) {
      Object.keys(visible)
        .filter(Boolean)
        .forEach((role) => {
          const stopHandle = onClickOutside(
            inputRef.value[role],
            (e: PointerEvent) => {
              const popperEl = unref(
                tooltipRef.value[role].popperRef.contentRef
              )
              const inputEl = unref(inputRef.value[role])
              if (
                (popperEl &&
                  (e.target === popperEl ||
                    e.composedPath().includes(popperEl))) ||
                e.target === inputEl ||
                e.composedPath().includes(inputEl)
              ) {
                return
              }
              pickerVisible.value[role] = false
              pickerActive.value = false
            }
          )
          stopHandleList.push(stopHandle)
        })
    } else {
      stopHandleList.forEach((item) => {
        item?.()
      })
      stopHandleList = []
    }
  },
  { deep: true }
)

provide(PICKER_BASE, {
  props,
})
</script>
