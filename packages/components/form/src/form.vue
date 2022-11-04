<template>
  <form :class="formClasses">
    <slot />
  </form>
</template>

<script lang="ts" setup>
import { computed, provide, reactive, toRefs, watch } from 'vue'
import { debugWarn, isFunction } from '@follow-ui/utils'
import { formContextKey } from '@follow-ui/tokens'
import { useNamespace, useSize } from '@follow-ui/hooks'

import { filterFields, formEmits, formProps, useFormLabelWidth } from './ts'
import type { FormItemProp } from './ts'
import type { ValidateFieldsError } from 'async-validator'
import type { Arrayable } from '@follow-ui/utils'
import type {
  FormContext,
  FormItemContext,
  FormValidateCallback,
  FormValidationResult,
} from '@follow-ui/tokens'

defineOptions({
  name: 'FlForm',
})
const props = defineProps(formProps)
const emit = defineEmits(formEmits)
//字段数组
const fields: FormItemContext[] = []

const formSize = useSize()
const ns = useNamespace('form')

//类
const formClasses = computed(() => {
  const { labelPosition, inline } = props
  return [
    ns.b(),
    ns.m(formSize.value || 'default'),
    {
      [ns.m(`label-${labelPosition}`)]: labelPosition,
      [ns.m('inline')]: inline,
    },
  ]
})

//添加字段
const addField: FormContext['addField'] = (field) => {
  fields.push(field)
}

//移除字段
const removeField: FormContext['removeField'] = (field) => {
  if (field.prop) {
    fields.splice(fields.indexOf(field), 1)
  }
}

//刷新验证字段
const resetFields: FormContext['resetFields'] = (properties = []) => {
  if (!props.model) {
    debugWarn('FlForm', 'model is required for resetFields to work.')
    return
  }
  //获取有效字段,遍历调用resetField()
  filterFields(fields, properties).forEach((field) => field.resetField())
}

//清除验证
const clearValidate: FormContext['clearValidate'] = (props = []) => {
  //获取有效字段,遍历调用对应clearValidate()
  filterFields(fields, props).forEach((field) => field.clearValidate())
}

//是否可验证
const isValidatable = computed(() => {
  //判断是否有model
  const hasModel = !!props.model
  if (!hasModel) {
    debugWarn('FlForm', 'model is required for validate to work.')
  }
  return hasModel
})

//获得验证字段
const obtainValidateFields = (props: Arrayable<FormItemProp>) => {
  if (fields.length === 0) return []
  //获取验证字段
  const filteredFields = filterFields(fields, props)
  if (!filteredFields.length) {
    debugWarn('FlForm', 'please pass correct props!')
    return []
  }
  return filteredFields
}

//校验
const validate = async (
  callback?: FormValidateCallback
): FormValidationResult => validateField(undefined, callback)

//校验处理
const doValidateField = async (
  props: Arrayable<FormItemProp> = []
): Promise<boolean> => {
  //如果不能验证,return false
  if (!isValidatable.value) return false
  //获取字段
  const fields = obtainValidateFields(props)
  //如果不存在 retuen true
  if (fields.length === 0) return true
  //验证错误对象
  let validationErrors: ValidateFieldsError = {}
  //遍历fields
  for (const field of fields) {
    try {
      //调用validate方法
      await field.validate('')
    } catch (fields) {
      //设置errors
      validationErrors = {
        ...validationErrors,
        ...(fields as ValidateFieldsError),
      }
    }
  }

  //如果没有验证错误,返回true
  if (Object.keys(validationErrors).length === 0) return true

  //否则reject validationErrors
  return Promise.reject(validationErrors)
}

//校验字段
const validateField: FormContext['validateField'] = async (
  modelProps = [],
  callback
) => {
  //判断callback是否不是函数
  const shouldThrow = !isFunction(callback)
  try {
    //验证字段
    const result = await doValidateField(modelProps)

    //如果是true,触发回调,返回result
    if (result === true) {
      callback?.(result)
    }
    return result
  } catch (e) {
    //获取无效的字段
    const invalidFields = e as ValidateFieldsError
    if (props.scrollToError) {
      scrollToField(Object.keys(invalidFields)[0])
    }
    //触发回调,返回false, invalidFields
    callback?.(false, invalidFields)

    //如果callback不是函数,reject invalidFields
    return shouldThrow && Promise.reject(invalidFields)
  }
}

//滚动搭配对应字段
const scrollToField = (prop: FormItemProp) => {
  //获取第一个有效字段
  const field = filterFields(fields, prop)[0]
  //如果字段存在,调用scrollIntoView()
  if (field) {
    //滚动父容器,显示调用元素
    field.$el?.scrollIntoView()
  }
}

//监听rules,如果props.validateOnRuleChange为true,调用rule
watch(
  () => props.rules,
  () => {
    if (props.validateOnRuleChange) {
      validate().catch((err) => debugWarn(err))
    }
  },
  { deep: true }
)

provide(
  formContextKey,
  reactive({
    ...toRefs(props),
    emit,
    resetFields,
    clearValidate,
    validateField,
    addField,
    removeField,
    ...useFormLabelWidth(),
  })
)

defineExpose({
  validate,
  validateField,
  resetFields,
  clearValidate,
  scrollToField,
})
</script>
