import { defineComponent, provide, ref } from 'vue'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
import Picker from './common/picker.vue'
import TimePickPanel from './panel/panel-time-pick.vue'
import TimeRangePanel from './panel/panel-time-range.vue'
import { DEFAULT_FORMATS_TIME, pickerProps } from './ts'
import { PICKER_POPPER_OPTIONS } from '@follow-ui/tokens'
dayjs.extend(customParseFormat)

export default defineComponent({
  name: 'FlTimePicker',
  install: null,
  props: {
    ...pickerProps,
    isRange: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue'],
  setup(props, ctx) {
    const commonPicker = ref()
    const [type, Panel] = props.isRange
      ? ['timerange', TimeRangePanel]
      : ['time', TimePickPanel]

    const modelUpdater = (value: any) => ctx.emit('update:modelValue', value)
    provide(PICKER_POPPER_OPTIONS, props.popperOptions)
    ctx.expose({
      focus: (e: FocusEvent | undefined) => {
        commonPicker.value?.handleFocusInput(e)
      },
      blur: (e: FocusEvent | undefined) => {
        commonPicker.value?.handleBlurInput(e)
      },
      handleOpen: () => {
        commonPicker.value?.handleOpen()
      },
      handleClose: () => {
        commonPicker.value?.handleClose()
      },
    })

    return () => {
      const format = props.format ?? DEFAULT_FORMATS_TIME

      return (
        <Picker
          {...props}
          ref={commonPicker}
          type={type}
          format={format}
          onUpdate:modelValue={modelUpdater}
        >
          {{
            default: (props: any) => <Panel {...props} />,
          }}
        </Picker>
      )
    }
  },
})
