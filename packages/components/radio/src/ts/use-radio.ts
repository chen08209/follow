import { computed, inject, ref } from 'vue'
import { UPDATE_MODEL_EVENT } from '@follow-ui/constants'
import { radioGroupKey } from '@follow-ui/tokens'
import {
  useColor,
  useDisabled,
  UseNamespaceReturn,
  useSize,
} from '@follow-ui/hooks'
import type { SetupContext } from 'vue'
import type { RadioEmits, RadioProps } from './radio'
import { TinyColor } from '@ctrl/tinycolor'

export const useRadio = (
  props: {
    label: RadioProps['label']
    modelValue?: RadioProps['modelValue']
    color?: RadioProps['color']
  },
  emit?: SetupContext<RadioEmits>['emit'],
  ns?: UseNamespaceReturn
) => {
  const radioRef = ref<HTMLInputElement>()
  const focus = ref(false)
  const radioGroup = inject(radioGroupKey, undefined)
  const isGroup = computed(() => !!radioGroup)
  const modelValue = computed<RadioProps['modelValue']>({
    get() {
      return isGroup.value ? radioGroup!.modelValue : props.modelValue!
    },
    set(val) {
      if (isGroup.value) {
        radioGroup!.changeEvent(val)
      } else {
        emit && emit(UPDATE_MODEL_EVENT, val)
      }
      radioRef.value!.checked = props.modelValue === props.label
    },
  })
  const size = useSize(computed(() => radioGroup?.size))
  const disabled = useDisabled(computed(() => radioGroup?.disabled))
  const color = useColor(computed(() => radioGroup?.color))
  const tabIndex = computed(() => {
    return disabled.value || (isGroup.value && modelValue.value !== props.label)
      ? -1
      : 0
  })

  const styles = computed(() => {
    let styles: Record<string, string> | undefined = {}
    if (color.value && !disabled.value) {
      const tinyColor = new TinyColor(color?.value)
      const color1 = tinyColor.toString()
      const color5 = tinyColor.tint(50).toString()
      const color9 = tinyColor.tint(90).toString()
      styles = ns?.cssVarBlock({
        'ripple-bg-color-5': color5,
        'ripple-bg-color-9': color9,
        'hover-border-color': color1,
        'hover-text-color': color1,
        'checked-text-color': color1,
        'checked-border-color': color5,
        'checked-bg-color': color9,
      })
    }
    return styles
  })

  return {
    radioRef,
    isGroup,
    radioGroup,
    focus,
    size,
    disabled,
    tabIndex,
    modelValue,
    styles,
  }
}
