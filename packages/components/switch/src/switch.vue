<template>
  <div :class="switchKls" :style="styles" @click.prevent="switchValue">
    <input
      :id="inputId"
      ref="input"
      :class="ns.e('input')"
      type="checkbox"
      role="switch"
      :aria-checked="checked"
      :aria-disabled="switchDisabled"
      :name="name"
      :true-value="activeValue"
      :false-value="inactiveValue"
      :disabled="switchDisabled"
      :tabindex="tabindex"
      @change="handleChange"
      @keydown.enter="switchValue"
    />
    <span :class="ns.e('inner')" />
    <span ref="core" :class="ns.e('core')" :style="coreStyle">
      <div :class="ns.e('warpper')">
        <ripple-wrapper center :disabled="switchDisabled" />
        <div :class="ns.e('action')">
          <fl-icon v-if="loading" :class="ns.is('loading')"
            ><loading
          /></fl-icon>
          <fl-icon v-else-if="checked" :class="[ns.is('icon')]">
            <component :is="activeIcon" />
          </fl-icon>
          <fl-icon v-else-if="!checked" :class="[ns.is('icon')]">
            <component :is="inactiveIcon" />
          </fl-icon>
        </div>
      </div>
    </span>
  </div>
</template>
<script lang="ts" setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { isPromise } from '@vue/shared'
import { addUnit, debugWarn } from '@follow-ui/utils'
import {
  CHANGE_EVENT,
  INPUT_EVENT,
  UPDATE_MODEL_EVENT,
} from '@follow-ui/constants'
import {
  useCustom,
  useDisabled,
  useFormItem,
  useFormItemInputId,
  useNamespace,
  useSize,
} from '@follow-ui/hooks'
import { Loading } from '@element-plus/icons-vue'
import { FlIcon } from '../../icon'
import { rippleWrapper } from '../../ripple'
import { switchEmits, switchProps } from './ts'
import type { CSSProperties } from 'vue'
defineOptions({
  name: 'FlSwitch',
})

const props = defineProps(switchProps)
const emit = defineEmits(switchEmits)

const { formItem } = useFormItem()
const switchSize = useSize()
const ns = useNamespace('switch')

const { inputId } = useFormItemInputId(props, {
  formItemContext: formItem,
})

const switchDisabled = useDisabled(computed(() => props.loading))
const input = ref<HTMLInputElement>()
const core = ref<HTMLSpanElement>()

//switch类数组
const switchKls = computed(() => [
  ns.b(),
  ns.m(switchSize.value),
  ns.is('disabled', switchDisabled.value),
  ns.is('checked', checked.value),
])

//设置宽度
const coreStyle = computed<CSSProperties>(() => ({
  width: addUnit(props.width),
}))

//是否选中
const checked = computed(() => props.modelValue === props.activeValue)

if (![props.activeValue, props.inactiveValue].includes(props.modelValue)) {
  emit(UPDATE_MODEL_EVENT, props.inactiveValue)
  emit(CHANGE_EVENT, props.inactiveValue)
  emit(INPUT_EVENT, props.inactiveValue)
}

//change事件
const handleChange = () => {
  const val = checked.value ? props.inactiveValue : props.activeValue
  emit(UPDATE_MODEL_EVENT, val)
  emit(CHANGE_EVENT, val)
  emit(INPUT_EVENT, val)
  nextTick(() => {
    input.value!.checked = checked.value
  })
}

//切换value
const switchValue = () => {
  if (switchDisabled.value) return
  const { beforeChange } = props
  if (!beforeChange) {
    handleChange()
    return
  }

  const shouldChange = beforeChange()

  if (isPromise(shouldChange)) {
    shouldChange
      .then((result) => {
        if (result) {
          handleChange()
        }
      })
      .catch((e) => {
        debugWarn('FlSwitch', `some error occurred: ${e}`)
      })
  } else if (shouldChange) {
    handleChange()
  }
}

//样式数组
const styles = computed(() => {
  let styles: Record<string, string> | undefined = {}
  if (props.color && !switchDisabled.value) {
    const colorList = useCustom(props.color)
    styles = {
      ...styles,
      'ripple-bg-color-9': colorList[9],
      'on-color': colorList[0],
    }
  }
  return ns.cssVarBlock(styles)
})

//聚焦事件
const focus = (): void => {
  input.value?.focus?.()
}

//监听checked,设置checked 如果需要验证,触发验证
watch(checked, (val) => {
  input.value!.checked = val
  if (props.validateEvent) {
    formItem?.validate?.('change').catch((err) => debugWarn(err))
  }
})

//挂载事件
onMounted(() => {
  input.value!.checked = checked.value
})

defineExpose({
  focus,
  checked,
})
</script>
