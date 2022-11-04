import { getCurrentInstance, inject, ref, unref, watch } from 'vue'
import { isArray } from '@follow-ui/utils'
import { ROOT_PICKER_INJECTION_KEY } from '@follow-ui/tokens'
import { useLocale, useNamespace } from '@follow-ui/hooks'
import { getDefaultValue, isValidRange } from '../utils'
import { useShortcut } from '../use-shortcut'

import type { Ref } from 'vue'
import type { Dayjs } from 'dayjs'
import type { PanelRangeSharedProps, RangeState } from '../shared'
import type { DefaultValue } from '../utils'

type UseRangePickerProps = {
  onParsedValueChanged: (
    minDate: Dayjs | undefined,
    maxDate: Dayjs | undefined
  ) => void
  defaultValue: Ref<DefaultValue>
  leftDate: Ref<Dayjs>
  rightDate: Ref<Dayjs>
  unit: 'month' | 'year'
}

//rangePicker钩子
export const useRangePicker = (
  props: PanelRangeSharedProps,
  {
    defaultValue,
    leftDate,
    rightDate,
    unit,
    onParsedValueChanged,
  }: UseRangePickerProps
) => {
  //获取emit
  const { emit } = getCurrentInstance()!

  //获取根命名空间
  const { pickerNs } = inject(ROOT_PICKER_INJECTION_KEY)!
  //date-range-picker命名空间
  const drpNs = useNamespace('date-range-picker')
  //获取本地化配置
  const { t, lang } = useLocale()
  //shortcut单击事件
  const handleShortcutClick = useShortcut(lang)
  //最小日期
  const minDate = ref<Dayjs>()
  //最大日期
  const maxDate = ref<Dayjs>()
  //范围选择状态
  const rangeState = ref<RangeState>({
    //待选中的end日期
    endDate: null,
    //是否选中
    selecting: false,
  })

  //范围改变事件
  const handleChangeRange = (val: RangeState) => {
    rangeState.value = val
  }

  //范围确认事件
  const handleRangeConfirm = (visible = false) => {
    const minDateTemp = unref(minDate)
    const maxDateTemp = unref(maxDate)

    if (isValidRange([minDateTemp, maxDateTemp])) {
      emit('pick', [minDateTemp, maxDateTemp], visible)
    }
  }

  //选择事件,修改selecting
  const onSelect = (selecting: boolean) => {
    rangeState.value.selecting = selecting
    //如果selecting是false,设置endDate = null
    if (!selecting) {
      rangeState.value.endDate = null
    }
  }

  //恢复默认值
  const restoreDefault = () => {
    //返回开始和结束日期
    const [start, end] = getDefaultValue(unref(defaultValue), {
      lang: unref(lang),
      unit,
      unlinkPanels: props.unlinkPanels,
    })
    //设置最小和最大日期为undefined
    minDate.value = undefined
    maxDate.value = undefined
    //设置leftDate和rightDate为start end
    leftDate.value = start
    rightDate.value = end
  }

  //监听默认value,调用restoreDefault
  watch(
    defaultValue,
    (val) => {
      if (val) {
        restoreDefault()
      }
    },
    { immediate: true }
  )

  /**
   * 监听输入value,
   * 如果parsedValue.length === 2调用onParsedValueChanged事件,
   * 否则调用restoreDefault()恢复默认值
   */
  watch(
    () => props.parsedValue,
    (parsedValue) => {
      if (isArray(parsedValue) && parsedValue.length === 2) {
        const [start, end] = parsedValue
        minDate.value = start
        leftDate.value = start
        maxDate.value = end
        onParsedValueChanged(unref(minDate), unref(maxDate))
      } else {
        restoreDefault()
      }
    },
    { immediate: true }
  )

  return {
    minDate,
    maxDate,
    rangeState,
    lang,
    ppNs: pickerNs,
    drpNs,
    handleChangeRange,
    handleRangeConfirm,
    handleShortcutClick,
    onSelect,
    t,
  }
}
