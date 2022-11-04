import { TooltipInstance } from '@follow-ui/components/tooltip'
import { UPDATE_MODEL_EVENT } from '@follow-ui/constants'
import {
  useDisabled,
  useFormItem,
  useFormItemInputId,
  useLocale,
  useSize,
} from '@follow-ui/hooks'
import { debugWarn } from '@follow-ui/utils'
import { computed, nextTick, reactive, ref, SetupContext, watch } from 'vue'
import { debounce } from 'lodash-unified'
import { Color } from './color'
import { ColorPickerEmits, ColorPickerProps } from './color-picker'
import HueSlider from '../components/hue-slider.vue'
import SvPanel from '../components/sv-panel.vue'
import AlphaSlider from '../components/alpha-slider.vue'

export const useColorPicker: any = (
  props: ColorPickerProps,
  emit: SetupContext<ColorPickerEmits>['emit']
) => {
  let shouldActiveChange = true
  const { t } = useLocale()
  const { formItem } = useFormItem()
  const colorSize = useSize()
  const colorDisabled = useDisabled()

  const hue = ref<InstanceType<typeof HueSlider>>()
  const sv = ref<InstanceType<typeof SvPanel>>()
  const alpha = ref<InstanceType<typeof AlphaSlider>>()

  const { inputId: buttonId, isLabeledByFormItem } = useFormItemInputId(props, {
    formItemContext: formItem,
  })
  const popper = ref<TooltipInstance>()

  const color = reactive(
    new Color({
      enableAlpha: props.showAlpha,
      format: props.colorFormat || '',
      value: props.modelValue,
    })
  ) as Color

  const showPicker = ref<boolean>(false)
  const showPanelColor = ref<boolean>(false)
  const customInput = ref<string>('')

  //显示的颜色
  const displayedColor = computed(() => {
    if (!props.modelValue && !showPanelColor.value) {
      return 'transparent'
    }
    return displayedRgb(color, props.showAlpha)
  })

  //当前颜色
  const currentColor = computed(() => {
    return !props.modelValue && !showPanelColor.value ? '' : color.value
  })

  const buttonAriaLabel = computed<string | undefined>(() => {
    return !isLabeledByFormItem.value
      ? props.label || t('fl.colorpicker.defaultLabel')
      : undefined
  })

  const buttonAriaLabelledby = computed<string | undefined>(() => {
    return isLabeledByFormItem.value ? formItem?.labelId : undefined
  })

  const displayedRgb = (color: Color, showAlpha: boolean) => {
    if (!(color instanceof Color)) {
      throw new TypeError('color should be instance of _color Class')
    }

    const { r, g, b } = color.toRgb()
    return showAlpha
      ? `rgba(${r}, ${g}, ${b}, ${color.get('alpha') / 100})`
      : `rgb(${r}, ${g}, ${b})`
  }

  const setShowPicker = (value: boolean) => {
    showPicker.value = value
  }

  const debounceSetShowPicker = debounce(setShowPicker, 100)

  const hide = () => {
    debounceSetShowPicker(false)
    resetColor()
  }

  const resetColor = () => {
    nextTick(() => {
      if (props.modelValue) {
        color.fromString(props.modelValue)
      } else {
        color.value = ''
        nextTick(() => {
          showPanelColor.value = false
        })
      }
    })
  }

  const handleTrigger = () => {
    if (colorDisabled.value) return
    console.log('handleTrigger')
    console.log(showPicker.value)
    debounceSetShowPicker(!showPicker.value)
  }

  const handleConfirm = () => {
    color.fromString(customInput.value)
  }

  const confirmValue = () => {
    const value = color.value
    emit(UPDATE_MODEL_EVENT, value)
    emit('change', value)
    if (props.validateEvent) {
      formItem?.validate('change').catch((err) => debugWarn(err))
    }
    debounceSetShowPicker(false)
    nextTick(() => {
      const newColor = new Color({
        enableAlpha: props.showAlpha,
        format: props.colorFormat || '',
        value: props.modelValue,
      })
      if (!color.compare(newColor)) {
        resetColor()
      }
    })
  }

  const clear = () => {
    debounceSetShowPicker(false)
    emit(UPDATE_MODEL_EVENT, null)
    emit('change', null)
    if (props.modelValue !== null && props.validateEvent) {
      formItem?.validate('change').catch((err) => debugWarn(err))
    }
    resetColor()
  }

  watch(
    () => props.modelValue,
    (newVal) => {
      if (!newVal) {
        showPanelColor.value = false
      } else if (newVal && newVal !== color.value) {
        shouldActiveChange = false
        color.fromString(newVal)
      }
    }
  )

  watch(
    () => currentColor.value,
    (val) => {
      customInput.value = val
      shouldActiveChange && emit('activeChange', val)
      shouldActiveChange = true
    }
  )

  watch(
    () => color.value,
    () => {
      if (!props.modelValue && !showPanelColor.value) {
        showPanelColor.value = true
      }
    }
  )

  watch(
    () => showPicker.value,
    () => {
      nextTick(() => {
        hue.value?.update()
        sv.value?.update()
        alpha.value?.update()
      })
    }
  )

  return {
    t,
    hue,
    sv,
    alpha,
    color,
    showPicker,
    showPanelColor,
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
  }
}
