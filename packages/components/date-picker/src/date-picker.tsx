import { defineComponent, provide, reactive, ref, toRef } from 'vue'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
import advancedFormat from 'dayjs/plugin/advancedFormat.js'
import localeData from 'dayjs/plugin/localeData.js'
import weekOfYear from 'dayjs/plugin/weekOfYear.js'
import weekYear from 'dayjs/plugin/weekYear.js'
import dayOfYear from 'dayjs/plugin/dayOfYear.js'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter.js'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js'
import { useNamespace } from '@follow-ui/hooks'
import { PICKER_POPPER_OPTIONS, ROOT_PICKER_INJECTION_KEY } from '@follow-ui/tokens'
import {
  CommonPicker,
  pickerProps,
} from '../../time-picker'
import { datePickerProps } from './ts'
import { getPanel } from './panel-utils'
import { DEFAULT_FORMATS_DATE, DEFAULT_FORMATS_DATEPICKER } from '@follow-ui/constants'

dayjs.extend(localeData)
dayjs.extend(advancedFormat)
dayjs.extend(customParseFormat)
dayjs.extend(weekOfYear)
dayjs.extend(weekYear)
dayjs.extend(dayOfYear)
dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

export default defineComponent({
  name: 'FlDatePicker',
  install: null,
  props: {
    ...pickerProps,
    ...datePickerProps,
  },
  emits: ['update:modelValue'],
  setup(props, { expose, emit, slots }) {
    const ns = useNamespace('picker-panel')

    provide(PICKER_POPPER_OPTIONS, reactive(toRef(props, 'popperOptions')))
    //provide插槽以及命名空间用于子孙组件
    provide(ROOT_PICKER_INJECTION_KEY, {
      slots,
      pickerNs: ns,
    })

    //picker
    const commonPicker = ref()

    const refProps = {
      focus: (focusStartInput = true) => {
        commonPicker.value?.focus(focusStartInput, false)
      },
      handleOpen: () => {
        commonPicker.value?.handleOpen()
      },
      handleClose: () => {
        commonPicker.value?.handleClose()
      },
    }

    //导出
    expose(refProps)

    //更新双向绑定
    const onModelValueUpdated = (val: any) => {
      emit('update:modelValue', val)
    }

    return () => {
      /**
       * 设置format
       * 如果props.format存在,设置为format
       * 否则根据type查找对应的format,如果没有返回默认format
       */
      const format =
        props.format ??
        (DEFAULT_FORMATS_DATEPICKER[props.type] || DEFAULT_FORMATS_DATE)

      //获取面板组件
      const Component = getPanel(props.type)

      return (
        <CommonPicker
          {...props}
          format={format}
          type={props.type}
          ref={commonPicker}
          onUpdate:modelValue={onModelValueUpdated}
        >
          {{
            default: (scopedProps: /**FIXME: remove any type */ any) => (
              <Component {...scopedProps} />
            ),
            'range-separator': slots['range-separator'],
          }}
        </CommonPicker>
      )
    }
  },
})
