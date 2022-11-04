<template>
  <div
    ref="formItemRef"
    :class="formItemClasses"
    :role="isGroup ? 'group' : undefined"
    :aria-labelledby="isGroup ? labelId : undefined"
  >
    <form-label-wrap
      :is-auto-width="labelStyle.width === 'auto'"
      :update-all="formContext?.labelWidth === 'auto'"
    >
      <component
        :is="labelFor ? 'label' : 'div'"
        v-if="hasLabel"
        :id="labelId"
        :for="labelFor"
        :class="ns.e('label')"
        :style="labelStyle"
      >
        <slot name="label" :label="currentLabel">
          {{ currentLabel }}
        </slot>
      </component>
    </form-label-wrap>
    <div :class="ns.e('content')" :style="contentStyle">
      <slot />
      <transition :name="`${ns.namespace.value}-zoom-in-top`">
        <slot v-if="shouldShowError" name="error" :error="validateMessage">
          <div :class="validateClasses">
            {{ validateMessage }}
          </div>
        </slot>
      </transition>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  computed,
  inject,
  nextTick,
  onBeforeUnmount,
  onMounted,
  provide,
  reactive,
  ref,
  toRefs,
  useSlots,
  watch,
} from 'vue'
import AsyncValidator from 'async-validator'
import { clone } from 'lodash-unified'
import { refDebounced } from '@vueuse/core'
import {
  addUnit,
  castArray,
  getProp,
  isBoolean,
  isFunction,
  isString,
} from '@follow-ui/utils'
import { formContextKey, formItemContextKey } from '@follow-ui/tokens'
import { useId, useNamespace, useSize } from '@follow-ui/hooks'
import { formItemProps } from './ts'
import FormLabelWrap from './form-label-wrap'

import type { CSSProperties } from 'vue'
import type { RuleItem } from 'async-validator'
import type {
  FormItemContext,
  FormItemRule,
  FormValidateFailure,
} from '@follow-ui/tokens'
import type { Arrayable } from '@follow-ui/utils'
import type { FormItemValidateState } from './ts'

defineOptions({
  name: 'FlFormItem',
})
const props = defineProps(formItemProps)
const slots = useSlots()

//来自form
const formContext = inject(formContextKey, undefined)
//来自formItem,用于判断是否嵌套
const parentFormItemContext = inject(formItemContextKey, undefined)

const size = useSize(undefined, { formItem: false })
const ns = useNamespace('form-item')

const labelId = useId().value
const inputIds = ref<string[]>([])

//验证状态
const validateState = ref<FormItemValidateState>('')
//验证状态去抖动
const validateStateDebounced = refDebounced(validateState, 100)
//验证消息
const validateMessage = ref('')
//formItem的ref
const formItemRef = ref<HTMLDivElement>()
//初始化值
let initialValue: any = undefined
//是否正在重置字段
let isResettingField = false

//标签样式
const labelStyle = computed<CSSProperties>(() => {
  if (formContext?.labelPosition === 'top') {
    return {}
  }

  const labelWidth = addUnit(props.labelWidth || formContext?.labelWidth || '')
  if (labelWidth) return { width: labelWidth }
  return {}
})

//内容样式
const contentStyle = computed<CSSProperties>(() => {
  if (formContext?.labelPosition === 'top' || formContext?.inline) {
    return {}
  }
  if (!props.label && !props.labelWidth && isNested) {
    return {}
  }
  const labelWidth = addUnit(props.labelWidth || formContext?.labelWidth || '')
  if (!props.label && !slots.label) {
    return { marginLeft: labelWidth }
  }
  return {}
})

//item类
const formItemClasses = computed(() => [
  ns.b(),
  ns.m(size.value),
  ns.is('error', validateState.value === 'error'),
  ns.is('validating', validateState.value === 'validating'),
  ns.is('success', validateState.value === 'success'),
  ns.is('required', isRequired.value || props.required),
  ns.is('no-asterisk', formContext?.hideRequiredAsterisk),
  formContext?.requireAsteriskPosition === 'right'
    ? 'asterisk-right'
    : 'asterisk-left',
  { [ns.m('feedback')]: formContext?.statusIcon },
])

//是否在一行显示消息
const inlineMessage = computed(() =>
  isBoolean(props.inlineMessage)
    ? props.inlineMessage
    : formContext?.inlineMessage || false
)

//校验类
const validateClasses = computed(() => [
  ns.e('error'),
  { [ns.em('error', 'inline')]: inlineMessage.value },
])

//将prop转化为string
const propString = computed(() => {
  if (!props.prop) return ''
  return isString(props.prop) ? props.prop : props.prop.join('.')
})

//是否有label
const hasLabel = computed<boolean>(() => {
  return !!(props.label || slots.label)
})
//是否是label
const labelFor = computed<string | undefined>(() => {
  //如果for存在,且inputIds的长度为1,返回inputIds.value[0],否则undefined
  return props.for || inputIds.value.length === 1
    ? inputIds.value[0]
    : undefined
})

//是否是组
const isGroup = computed<boolean>(() => {
  return !labelFor.value && hasLabel.value
})

//是否是嵌套
const isNested = !!parentFormItemContext

//字段显示值
const fieldValue = computed(() => {
  //获取来自form的mode
  const model = formContext?.model
  //如果model和prop都不存在
  if (!model || !props.prop) {
    return
  }
  //否则获取model上的props.prop属性
  return getProp(model, props.prop).value
})

//通用规则
const normalizedRules = computed(() => {
  const { required } = props
  //验证规则数组
  const rules: FormItemRule[] = []

  //如果props.rules存在,添加来自props.rules的验证规则
  if (props.rules) {
    rules.push(...castArray(props.rules))
  }
  //获取来自form的rules
  const formRules = formContext?.rules

  //如果formRules和prop都存在,添加来自formRules的验证规则
  if (formRules && props.prop) {
    const propRules = getProp<Arrayable<FormItemRule> | undefined>(
      formRules,
      props.prop
    ).value
    if (propRules) {
      rules.push(...castArray(propRules))
    }
  }

  //如果来自props的required已经定义
  if (required !== undefined) {
    //获取有required的规则数组
    const requiredRules = rules
      .map((rule, i) => [rule, i] as const)
      .filter(([rule]) => Object.keys(rule).includes('required'))
    /**
     * 如果规则大于0,遍历requiredRules,
     * 当rule里的required与required相等时,停止当前循环
     * 否则修改rule,设置required
     */
    if (requiredRules.length > 0) {
      for (const [rule, i] of requiredRules) {
        if (rule.required === required) continue
        rules[i] = { ...rule, required }
      }
    } else {
      rules.push({ required })
    }
  }

  return rules
})

//判断是否有验证规则
const validateEnabled = computed(() => normalizedRules.value.length > 0)

//判断是否必填
const isRequired = computed(() =>
  normalizedRules.value.some((rule) => rule.required)
)

//是否应该展示error信息
const shouldShowError = computed(
  () =>
    validateStateDebounced.value === 'error' &&
    props.showMessage &&
    (formContext?.showMessage ?? true)
)

//当前label
const currentLabel = computed(
  () => `${props.label || ''}${formContext?.labelSuffix || ''}`
)

///获取过滤trigger的规则
const getFilteredRule = (trigger: string) => {
  //获取规则
  const rules = normalizedRules.value
  return (
    rules
      //过滤规则
      .filter((rule) => {
        //过滤出没有trigger的
        if (!rule.trigger || !trigger) return true
        /* 判断rule里的trigger是否是数组,
        是,返回数组中包含trigger的rule,
        否,判断 rule里的trigger是否等于传入的taigger */
        if (Array.isArray(rule.trigger)) {
          return rule.trigger.includes(trigger)
        } else {
          return rule.trigger === trigger
        }
      })
      //去除trigger
      .map(({ trigger, ...rule }): RuleItem => rule)
  )
}

//设置验证状态
const setValidationState = (state: FormItemValidateState) => {
  validateState.value = state
}

//验证失败,打印error
const onValidationFailed = (error: FormValidateFailure) => {
  const { errors, fields } = error
  if (!errors || !fields) {
    console.error(error)
  }
  //设置验证状态为erro
  setValidationState('error')
  //设置验证消息为errors
  validateMessage.value = errors
    ? errors?.[0]?.message ?? `${props.prop} is required`
    : ''

  formContext?.emit('validate', props.prop!, false, validateMessage.value)
}

//验证成功,设置验证状态,触发验证回调
const onValidationSucceeded = () => {
  setValidationState('success')
  formContext?.emit('validate', props.prop!, true, '')
}

//验证处理
const doValidate = async (rules: RuleItem[]): Promise<true> => {
  //获取prop
  const modelName = propString.value
  //设置验证器
  const validator = new AsyncValidator({
    [modelName]: rules,
  })
  /**
   * 校验
   * firstFields: true => 调用当指定字段的第一个验证规则生成错误时，不再处理同一字段的验证规则。
   */
  return validator
    .validate({ [modelName]: fieldValue.value }, { firstFields: true })
    .then(() => {
      //调用验证成功
      onValidationSucceeded()
      return Promise.resolve(true as const)
    })
    .catch((err: FormValidateFailure) => {
      //调用验证失败方法
      onValidationFailed(err as FormValidateFailure)
      return Promise.reject(err)
    })
}

//验证
const validate: FormItemContext['validate'] = async (trigger, callback) => {
  //如果在重置字段,返回false
  if (isResettingField) {
    return false
  }
  //判断回调是否是函数
  const hasCallback = isFunction(callback)
  //如果没有验证规则,触发回调,返回false
  if (!validateEnabled.value) {
    callback?.(false)
    return false
  }
  //获取过滤trigger后的规则
  const rules = getFilteredRule(trigger)
  //如果没有,触发回调,返回true
  if (rules.length === 0) {
    callback?.(true)
    return true
  }
  //设置验证状态为验证中
  setValidationState('validating')
  //调用验证处理
  return doValidate(rules)
    .then((e) => {
      //成功触发回调,返回true
      callback?.(true)
      return Promise.resolve(true as const)
    })
    .catch((err: FormValidateFailure) => {
      const { fields } = err
      callback?.(false, fields)
      //如果回调不是函数,返回Promise.reject(fields),否则返回false
      return hasCallback ? false : Promise.reject(fields)
    })
}

//清除校验
const clearValidate: FormItemContext['clearValidate'] = () => {
  //设置验证状态为 ''
  setValidationState('')
  //设置验证消息为 ''
  validateMessage.value = ''
  //设置是否正在重置字段为false
  isResettingField = false
}

//重置字段
const resetField: FormItemContext['resetField'] = async () => {
  //获取model
  const model = formContext?.model

  //如果都不存在 return
  if (!model || !props.prop) return

  //从model获取prop
  const computedValue = getProp(model, props.prop)

  //设置重置状态,防止校验
  isResettingField = true

  //浅拷贝
  computedValue.value = clone(initialValue)

  await nextTick()

  //清除验证
  clearValidate()

  //取消重置状态
  isResettingField = false
}
//为input添加id
const addInputId: FormItemContext['addInputId'] = (id: string) => {
  if (!inputIds.value.includes(id)) {
    inputIds.value.push(id)
  }
}
//为input移除id
const removeInputId: FormItemContext['removeInputId'] = (id: string) => {
  inputIds.value = inputIds.value.filter((listId) => listId !== id)
}

//监听error,设置validateMessage,设置验证状态
watch(
  () => props.error,
  (val) => {
    validateMessage.value = val || ''
    setValidationState(val ? 'error' : '')
  },
  { immediate: true }
)

//监听验证状态,设置验证状态
watch(
  () => props.validateStatus,
  (val) => setValidationState(val || '')
)

//formItemContext
const context: FormItemContext = reactive({
  ...toRefs(props),
  $el: formItemRef,
  size,
  validateState,
  labelId,
  inputIds,
  isGroup,
  hasLabel,
  addInputId,
  removeInputId,
  resetField,
  clearValidate,
  validate,
})

//监听prop,添加字段,设置初始值
onMounted(() => {
  if (props.prop) {
    formContext?.addField(context)
    initialValue = clone(fieldValue.value)
  }
})

//挂载前,移除removeField
onBeforeUnmount(() => {
  formContext?.removeField(context)
})

provide(formItemContextKey, context)

defineExpose({
  size,
  validateMessage,
  validateState,
  validate,
  clearValidate,
  resetField,
})
</script>
