<template>
  <div
    v-show="type !== 'hidden'"
    v-bind="containerAttrs"
    :class="[
      type === 'textarea' ? nsTextarea.b() : nsInput.b(),
      nsInput.m(inputSize),
      nsInput.is('disabled', inputDisabled),
      nsInput.is('exceed', inputExceed),
      {
        [nsInput.b('group')]: $slots.prepend || $slots.append,
        [nsInput.bm('group', 'append')]: $slots.append,
        [nsInput.bm('group', 'prepend')]: $slots.prepend,
        [nsInput.m('prefix')]: $slots.prefix || prefixIcon,
        [nsInput.m('suffix')]:
          $slots.suffix || suffixIcon || clearable || showPassword,
        [nsInput.bm('suffix', 'password-clear')]: showClear && showPwdVisible,
      },
      $attrs.class,
    ]"
    :style="containerStyle"
    :role="containerRole"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- input -->
    <template v-if="type !== 'textarea'">
      <!-- prepend slot -->
      <div v-if="$slots.prepend" :class="nsInput.be('group', 'prepend')">
        <slot name="prepend" />
      </div>

      <div :class="[nsInput.e('wrapper'), nsInput.is('focus', focused)]">
        <!-- prefix slot -->
        <span v-if="$slots.prefix || prefixIcon" :class="nsInput.e('prefix')">
          <span :class="nsInput.e('prefix-inner')">
            <slot name="prefix" />
            <fl-icon v-if="prefixIcon" :class="nsInput.e('icon')">
              <component :is="prefixIcon" />
            </fl-icon>
          </span>
        </span>

        <input
          :id="inputId"
          ref="input"
          :class="nsInput.e('inner')"
          v-bind="attrs"
          :type="showPassword ? (passwordVisible ? 'text' : 'password') : type"
          :disabled="inputDisabled"
          :formatter="formatter"
          :parser="parser"
          :readonly="readonly"
          :autocomplete="autocomplete"
          :tabindex="tabindex"
          :aria-label="label"
          :placeholder="placeholder"
          :style="inputStyle"
          @compositionstart="handleCompositionStart"
          @compositionupdate="handleCompositionUpdate"
          @compositionend="handleCompositionEnd"
          @input="handleInput"
          @focus="handleFocus"
          @blur="handleBlur"
          @change="handleChange"
          @keydown="handleKeydown"
        />

        <!-- suffix slot -->
        <span v-if="suffixVisible" :class="nsInput.e('suffix')">
          <span :class="nsInput.e('suffix-inner')">
            <!--自定义后缀图标 -->
            <template
              v-if="!showClear || !showPwdVisible || !isWordLimitVisible"
            >
              <slot name="suffix" />
              <fl-icon v-if="suffixIcon" :class="nsInput.e('icon')">
                <component :is="suffixIcon" />
              </fl-icon>
            </template>

            <!--clear图标 -->
            <fl-icon
              v-if="showClear"
              :class="[nsInput.e('icon'), nsInput.e('clear')]"
              @mousedown.prevent="NOOP"
              @click="clear"
            >
              <circle-close />
            </fl-icon>

            <!--密码显示图标 -->
            <fl-icon
              v-if="showPwdVisible"
              :class="[nsInput.e('icon'), nsInput.e('password')]"
              @click="handlePasswordVisible"
            >
              <component :is="passwordIcon" />
            </fl-icon>

            <!--字数显示 -->
            <span v-if="isWordLimitVisible" :class="nsInput.e('count')">
              <span :class="nsInput.e('count-inner')">
                {{ textLength }} / {{ attrs.maxlength }}
              </span>
            </span>

            <!--校验图标 -->
            <fl-icon
              v-if="validateState && validateIcon && needStatusIcon"
              :class="[
                nsInput.e('icon'),
                nsInput.e('validateIcon'),
                nsInput.is('loading', validateState === 'validating'),
              ]"
            >
              <component :is="validateIcon" />
            </fl-icon>
          </span>
        </span>
      </div>

      <!-- append slot -->
      <div v-if="$slots.append" :class="nsInput.be('group', 'append')">
        <slot name="append" />
      </div>
    </template>

    <!-- textarea -->
    <template v-else>
      <textarea
        :id="inputId"
        ref="textarea"
        :class="nsTextarea.e('inner')"
        v-bind="attrs"
        :tabindex="tabindex"
        :disabled="inputDisabled"
        :readonly="readonly"
        :autocomplete="autocomplete"
        :style="textareaStyle"
        :aria-label="label"
        :placeholder="placeholder"
        @compositionstart="handleCompositionStart"
        @compositionupdate="handleCompositionUpdate"
        @compositionend="handleCompositionEnd"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @change="handleChange"
        @keydown="handleKeydown"
      />
      <span
        v-if="isWordLimitVisible"
        :style="countStyle"
        :class="nsInput.e('count')"
      >
        {{ textLength }} / {{ attrs.maxlength }}
      </span>
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  getCurrentInstance,
  nextTick,
  onMounted,
  onUpdated,
  ref,
  shallowRef,
  toRef,
  useAttrs as useRawAttrs,
  useSlots,
  watch,
} from 'vue'
import { UPDATE_MODEL_EVENT } from '@follow-ui/constants'
import {
  useAttrs,
  useCursor,
  useDisabled,
  useFormItem,
  useFormItemInputId,
  useNamespace,
  useSize,
} from '@follow-ui/hooks'
import {
  NOOP,
  ValidateComponentsMap,
  debugWarn,
  isObject,
} from '@follow-ui/utils'
import { isClient, useResizeObserver } from '@vueuse/core'
import { isNil } from 'lodash-unified'
import {
  CircleClose,
  Hide as IconHide,
  View as IconView,
} from '@element-plus/icons-vue'
import { FlIcon } from '../../icon'
import { calcTextareaHeight, inputEmits, inputProps } from './ts'

import type { StyleValue } from 'vue'

type TargetElement = HTMLInputElement | HTMLTextAreaElement

const PENDANT_MAP = {
  suffix: 'append',
  prefix: 'prepend',
} as const

defineOptions({
  name: 'FlInput',
  inheritAttrs: false,
})
const props = defineProps(inputProps)
const emit = defineEmits(inputEmits)

const instance = getCurrentInstance()!
const rawAttrs = useRawAttrs()
const slots = useSlots()

//attrs容器
const containerAttrs = computed(() => {
  const comboBoxAttrs: Record<string, unknown> = {}
  if (props.containerRole === 'combobox') {
    comboBoxAttrs['aria-haspopup'] = rawAttrs['aria-haspopup']
    comboBoxAttrs['aria-owns'] = rawAttrs['aria-owns']
    comboBoxAttrs['aria-expanded'] = rawAttrs['aria-expanded']
  }
  return comboBoxAttrs
})

//返回attrs容器中不存在对应key的attr
const attrs = useAttrs({
  excludeKeys: computed<string[]>(() => {
    return Object.keys(containerAttrs.value)
  }),
})

const { form, formItem } = useFormItem()

const { inputId } = useFormItemInputId(props, {
  formItemContext: formItem,
})

const inputSize = useSize()
const inputDisabled = useDisabled()
const nsInput = useNamespace('input')
const nsTextarea = useNamespace('textarea')

const input = shallowRef<HTMLInputElement>()
const textarea = shallowRef<HTMLTextAreaElement>()

//是否聚焦
const focused = ref(false)

const hovering = ref(false)

//判断是否处于合成输入期间
const isComposing = ref(false)

//是否显示密码
const passwordVisible = ref(false)

//字数统计样式
const countStyle = ref<StyleValue>()

/**
 * 文本域样式:
 * {
 *  height?:string,
 *  minHeight?:string
 * }
 */
const textareaCalcStyle = shallowRef(props.inputStyle)

//组件ref
const inputRef = computed(() => input.value || textarea.value)

//状态图标
const needStatusIcon = computed(() => form?.statusIcon ?? false)

//校验状态
const validateState = computed(() => formItem?.validateState || '')

//校验图标
const validateIcon = computed(
  () => validateState.value && ValidateComponentsMap[validateState.value]
)

//密码图标
const passwordIcon = computed(() =>
  passwordVisible.value ? IconView : IconHide
)

//容器样式
const containerStyle = computed<StyleValue>(() => [
  rawAttrs.style as StyleValue,
  props.inputStyle,
])

//文本域样式 props.inputStyle + textareaCalcStyle.value
const textareaStyle = computed<StyleValue>(() => [
  props.inputStyle,
  textareaCalcStyle.value,
  { resize: props.resize },
])

//本地inputValue,通过更新modelValue获取
const nativeInputValue = computed(() =>
  isNil(props.modelValue) ? '' : String(props.modelValue)
)

//显示clear图标
const showClear = computed(
  () =>
    props.clearable &&
    !inputDisabled.value &&
    !props.readonly &&
    !!nativeInputValue.value &&
    (focused.value || hovering.value)
)

/**
 * 是否显示查看密码
 * 只有在
 * props.showPassword 是否显示查看密码图标
 * !inputDisabled.value input是否不是disabled
 * !props.readonly 是否不是readonly
 * !!nativeInputValue.value 是否存在 nativeInputValue.value
 * (多余, 注释)(!!nativeInputValue.value || focused.value) 是否存在nativeInputValue.value 或 focused.value
 * 都成立的时候才显示查看密码图标
 */
const showPwdVisible = computed(
  () =>
    props.showPassword &&
    !inputDisabled.value &&
    !props.readonly &&
    !!nativeInputValue.value
  // && (!!nativeInputValue.value || focused.value)
)

/**
 * 是否显示字数统计
 * 只有在
 * props.showWordLimit 是否显示字数统计
 * !!attrs.value.maxlength 是否有maxlength
 * (props.type === 'text' || props.type === 'textarea') type是否是text 或者 textarea
 * !inputDisabled.value  是否不是disable
 * !props.readonly && !props.showPassword 是否不是readonly以及showPassword
 * 都为true的时候才显示字数统计
 */
const isWordLimitVisible = computed(
  () =>
    props.showWordLimit &&
    !!attrs.value.maxlength &&
    (props.type === 'text' || props.type === 'textarea') &&
    !inputDisabled.value &&
    !props.readonly &&
    !props.showPassword
)

//文本长度
const textLength = computed(() => Array.from(nativeInputValue.value).length)

//input超出
const inputExceed = computed(
  () =>
    !!isWordLimitVisible.value &&
    textLength.value > Number(attrs.value.maxlength)
)

//后缀显示
const suffixVisible = computed(
  () =>
    !!slots.suffix ||
    !!props.suffixIcon ||
    showClear.value ||
    props.showPassword ||
    isWordLimitVisible.value ||
    (!!validateState.value && needStatusIcon.value)
)

const [recordCursor, setCursor] = useCursor(input)

/**
 * 观察文本框修改, 当文本框宽度变化时,修改字数统计right
 * 这是对原生ResizeObserver() 的封装
 */
useResizeObserver(textarea, (entries) => {
  // 如果isWordLimitVisible不为true或者props.resize !== both return
  /**
   * 原代码: if (!isWordLimitVisible.value || props.resize !== 'both') return
   * 无法监听horizontal时宽度变化导致字数统计失效
   */
  if (
    !isWordLimitVisible.value ||
    !['both', 'horizontal'].includes(props.resize as string)
  )
    return

  //当isWordLimitVisible.value为true 且 props.resize == 'both' 时执行以下函数
  const entry = entries[0]

  //获取当前文本框的宽度
  const { width } = entry.contentRect
  countStyle.value = {
    /** right: 100% - width + padding(15) + right(6) */
    right: `calc(100% - ${width + 15 + 6}px)`,
  }
})

//调整文本域行高
const resizeTextarea = () => {
  const { type, autosize } = props

  if (!isClient || type !== 'textarea') return

  //如果有autosize设置height和minHeight,否则只设置minHeight,保证最小为一行
  if (autosize) {
    const minRows = isObject(autosize) ? autosize['minRows'] : undefined
    const maxRows = isObject(autosize) ? autosize['maxRows'] : undefined
    textareaCalcStyle.value = {
      ...calcTextareaHeight(textarea.value!, minRows, maxRows),
    }
  } else {
    textareaCalcStyle.value = {
      minHeight: calcTextareaHeight(textarea.value!).minHeight,
    }
  }
}

//通过props.modelValue设置input.value
const setNativeInputValue = () => {
  const input = inputRef.value
  //如果没有input对象或者input的值 === nativeInputValue,则return
  if (!input || input.value === nativeInputValue.value) return

  //将nativeInputValue赋值给input
  input.value = nativeInputValue.value
}

const calcIconOffset = (place: 'prefix' | 'suffix') => {
  const { el } = instance.vnode

  if (!el) return

  //获取所有为插槽固定类名的元素
  const elList = Array.from(
    (el as Element).querySelectorAll<HTMLSpanElement>(`.${nsInput.e(place)}`)
  )

  //找到其中父节点为当前节点的元素
  const target = elList.find((item) => item.parentNode === el)

  //如果没有 return
  if (!target) return

  //用place转换对应的pendant
  const pendant = PENDANT_MAP[place]
  //如果存在对应pendant,用translateX修正位置,防止重叠,否则移除style
  if (slots[pendant]) {
    target.style.transform = `translateX(${place === 'suffix' ? '-' : ''}${
      el.querySelector(`.${nsInput.be('group', pendant)}`).offsetWidth
    }px)`
  } else {
    target.removeAttribute('style')
  }
}

//修正同时使用对应PENDANT_MAP的slots时位置偏移量(未找到使用处)
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const updateIconOffset = () => {
  //前缀
  calcIconOffset('prefix')
  //后缀
  calcIconOffset('suffix')
}

//input事件
const handleInput = async (event: Event) => {
  //记录光标
  recordCursor()

  let { value } = event.target as TargetElement

  //如果有formatter
  if (props.formatter) {
    value = props.parser ? props.parser(value) : value
    value = props.formatter(value)
  }

  //如果处于合成输入期间
  if (isComposing.value) return

  // should remove the following line when we don't support IE
  if (value === nativeInputValue.value) {
    setNativeInputValue()
    return
  }

  //更新v-model
  emit(UPDATE_MODEL_EVENT, value)

  //触发input回调
  emit('input', value)

  // ensure native input value is controlled
  await nextTick()

  /**
   * 更新value,多余
   * nativeInputValue是computed, 当v-model更新时, nativeInputValue更新
   * nativeInputValue更新, 触发监听事件调用setNativeInputValue
   */
  // setNativeInputValue()

  //设置光标
  setCursor()
}

const handleChange = (event: Event) => {
  emit('change', (event.target as TargetElement).value)
}

//合成输入开始事件
const handleCompositionStart = (event: CompositionEvent) => {
  emit('compositionstart', event)

  //进入合成输入状态
  isComposing.value = true
}

//合成输入过程事件,在input事件之前触发
const handleCompositionUpdate = (event: CompositionEvent) => {
  emit('compositionupdate', event)
  // const text = (event.target as HTMLInputElement)?.value

  //如果最后一个字符是韩文,取消合成输入状态, 反之则不取消
  // const lastCharacter = text[text.length - 1] || ''
  // isComposing.value = !isKorean(lastCharacter)
}

//合成输入结束事件
const handleCompositionEnd = (event: CompositionEvent) => {
  emit('compositionend', event)

  //如果处于合成输入状态,结束合成输入,触发input事件
  if (isComposing.value) {
    isComposing.value = false
    handleInput(event)
  }
}

const handlePasswordVisible = () => {
  passwordVisible.value = !passwordVisible.value
  focus()
}

//native聚焦事件
const focus = async () => {
  await nextTick()
  inputRef.value?.focus()
}

//native失焦事件
const blur = () => inputRef.value?.blur()

//input聚焦事件
const handleFocus = (event: FocusEvent) => {
  focused.value = true
  emit('focus', event)
}

//input失焦事件
const handleBlur = (event: FocusEvent) => {
  focused.value = false
  emit('blur', event)
  if (props.validateEvent) {
    formItem?.validate?.('blur').catch((err) => debugWarn(err))
  }
}

//鼠标离开事件
const handleMouseLeave = (evt: MouseEvent) => {
  hovering.value = false
  emit('mouseleave', evt)
}

//鼠标进入事件
const handleMouseEnter = (evt: MouseEvent) => {
  hovering.value = true
  emit('mouseenter', evt)
}

//键盘事件
const handleKeydown = (evt: KeyboardEvent) => {
  emit('keydown', evt)
}

//native选中事件
const select = () => {
  inputRef.value?.select()
}

//清除事件, 使modelValue为''
const clear = () => {
  emit(UPDATE_MODEL_EVENT, '')
  emit('change', '')
  emit('clear')
  emit('input', '')
}

watch(
  () => props.modelValue,
  () => {
    nextTick(() => resizeTextarea())
    if (props.validateEvent) {
      formItem?.validate?.('change').catch((err) => debugWarn(err))
    }
  }
)

// native input value is set explicitly
// do not use v-model / :value in template
watch(nativeInputValue, () => setNativeInputValue())

// when change between <input> and <textarea>,
// update DOM dependent value and styles
watch(
  () => props.type,
  async () => {
    await nextTick()
    setNativeInputValue()
    resizeTextarea()
    // updateIconOffset()
  }
)

//挂载
onMounted(async () => {
  if (!props.formatter && props.parser) {
    debugWarn(
      'ElInput',
      'If you set the parser, you also need to set the formatter.'
    )
  }
  setNativeInputValue()
  // updateIconOffset()
  await nextTick()
  resizeTextarea()
})

onUpdated(async () => {
  await nextTick()
  // updateIconOffset()
})

defineExpose({
  input,
  textarea,
  ref: inputRef,
  textareaStyle,
  autosize: toRef(props, 'autosize'),
  focus,
  blur,
  select,
  clear,
  resizeTextarea,
})
</script>
