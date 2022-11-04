import {
  useColor,
  useDisabled,
  useFormItem,
  useFormItemInputId,
  UseNamespaceReturn,
  useSize,
} from '@follow-ui/hooks'
import { debugWarn, isArray, isBoolean, isUndefined } from '@follow-ui/utils'

import {
  ComponentInternalInstance,
  computed,
  getCurrentInstance,
  inject,
  nextTick,
  ref,
  toRaw,
  watch,
  WritableComputedRef,
} from 'vue'
import { CheckboxProps } from './checkbox'
import { checkboxGroupContextKey } from '@follow-ui/tokens'
import { UPDATE_MODEL_EVENT } from '@follow-ui/constants'
import { TinyColor } from '@ctrl/tinycolor'

const setStoreValue = (
  props: CheckboxProps,
  model: WritableComputedRef<any>
) => {
  function addToStore() {
    if (isArray(model.value) && !model.value.includes(props.label)) {
      model.value.push(props.label)
    } else {
      model.value = props.trueLabel || true
    }
  }
  props.checked && addToStore()
}

export const useCheckbox = (
  props: CheckboxProps,
  slots: ComponentInternalInstance['slots'],
  ns?: UseNamespaceReturn
) => {
  //默认value
  const selfModel = ref<unknown>(false)
  const isFocused = ref(false)
  //判断数量是否超过限制
  const isLimitExceeded = ref(false)
  const checkboxGroup = inject(checkboxGroupContextKey, undefined)
  const { emit } = getCurrentInstance()!
  const { formItem } = useFormItem()
  const isDisabled = useDisabled(
    computed(() => checkboxGroup?.disabled.value || isLimitDisabled.value)
  )
  const checkboxSize = useSize(computed(() => checkboxGroup?.size?.value))
  const checkboxButtonSize = useSize(
    computed(() => checkboxGroup?.size?.value),
    {
      prop: true,
    }
  )
  //是否是按钮组
  const isGroup = computed(() => isUndefined(checkboxGroup) === false)

  const color = useColor(computed(() => checkboxGroup?.color?.value))

  const model = computed({
    get() {
      return isGroup.value
        ? checkboxGroup?.modelValue?.value
        : props.modelValue ?? selfModel.value
    },
    set(val: unknown) {
      if (isGroup.value && isArray(val)) {
        isLimitExceeded.value =
          checkboxGroup?.max?.value !== undefined &&
          val.length > checkboxGroup?.max.value
        //如果没有超过限制,调用checkboxGroup上的group
        isLimitExceeded.value === false && checkboxGroup?.changeEvent?.(val)
      } else {
        emit(UPDATE_MODEL_EVENT, val)
        selfModel.value = val
      }
    },
  })

  const isChecked = computed<boolean>(() => {
    const value = model.value
    if (isBoolean(value)) {
      return value
    } else if (isArray(value)) {
      return value.map(toRaw).includes(props.label)
    } else if (value !== null && value !== undefined) {
      return value === props.trueLabel
    } else {
      return !!value
    }
  })

  //是否有标签
  const hasOwnLabel = computed<boolean>(() => {
    return !!(slots.default || props.label)
  })

  //超过限制后disabled
  const isLimitDisabled = computed(() => {
    const max = checkboxGroup?.max?.value
    const min = checkboxGroup?.min?.value
    return (
      (!isUndefined(max) && model.value.length >= max && !isChecked.value) ||
      (!isUndefined(min) && model.value.length <= min && isChecked.value)
    )
  })

  const validateEvent = computed(
    () => checkboxGroup?.validateEvent || props.validateEvent
  )

  const styles = computed(() => {
    let styles: Record<string, string> | undefined = {}
    if (color.value && !isDisabled.value) {
      const tinyColor = new TinyColor(color?.value)
      const color1 = tinyColor.toString()
      const color5 = tinyColor.tint(50).toString()
      const color9 = tinyColor.tint(90).toString()
      styles = ns?.cssVarBlock({
        'ripple-bg-color-5': color5,
        'ripple-bg-color-9': color9,
        'hover-border-color': color1,
        'active-text-color': color1,
        'checked-border-color': color5,
        'checked-bg-color': color9,
      })
    }
    return styles
  })

  const { inputId, isLabeledByFormItem } = useFormItemInputId(props, {
    formItemContext: formItem,
    disableIdGeneration: hasOwnLabel,
    disableIdManagement: isGroup,
  })

  const getLabeledValue = (value: string | number | boolean) =>
    value === props.trueLabel || value === true
      ? props.trueLabel ?? true
      : props.falseLabel ?? false

  const emitChangeEvent = (
    checked: string | number | boolean,
    e: InputEvent | MouseEvent
  ) => {
    emit('change', getLabeledValue(checked), e)
  }

  const handleChange = (e: Event) => {
    if (isLimitExceeded.value) return

    const target = e.target as HTMLInputElement
    emit('change', getLabeledValue(target.checked), e)
  }

  const onClickRoot = async (e: MouseEvent) => {
    if (isLimitExceeded.value) return
    if (!hasOwnLabel.value && !isDisabled.value && isLabeledByFormItem.value) {
      const eventTargets: EventTarget[] = e.composedPath()
      const hasLabel = eventTargets.some(
        (item) => (item as HTMLElement).tagName === 'LABEL'
      )
      if (!hasLabel) {
        model.value = getLabeledValue(
          [false, props.falseLabel].includes(model.value)
        )
        await nextTick()
        emitChangeEvent(model.value, e)
      }
    }
  }

  setStoreValue(props, model)

  watch(
    () => props.modelValue,
    () => {
      if (validateEvent.value) {
        formItem?.validate('change').catch((err) => debugWarn(err))
      }
    }
  )

  return {
    inputId,
    isLabeledByFormItem,
    isChecked,
    isDisabled,
    isFocused,
    checkboxButtonSize,
    checkboxSize,
    hasOwnLabel,
    model,
    handleChange,
    onClickRoot,
    styles,
  }
}
