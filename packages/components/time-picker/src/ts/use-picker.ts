import { Clock, Calendar } from '@element-plus/icons-vue'
import { TooltipInstance } from '@follow-ui/components/tooltip'
import { EVENT_CODE } from '@follow-ui/constants'
import { useLocale, useNamespace, useFormItem, useSize } from '@follow-ui/hooks'
import { PICKER_POPPER_OPTIONS, PICKER_BASE } from '@follow-ui/tokens'
import { debugWarn, isArray } from '@follow-ui/utils'
import {
  inject,
  ref,
  ComponentPublicInstance,
  computed,
  unref,
  nextTick,
  watch,
  provide,
  SetupContext,
} from 'vue'
import { onClickOutside } from '@vueuse/core'
import { Dayjs } from 'dayjs'
import { isEqual } from 'lodash-unified'
import { Options } from 'unplugin-vue-macros'
import {
  DateModelType,
  DateOrDates,
  DayOrDays,
  Input,
  PickerEmits,
  PickerOptions,
  PickerProps,
  SingleOrRange,
} from './picker'
import { parseDate, valueEquals, formatter } from './utils'

export const usePicker: any = (
  props: PickerProps,
  emit: SetupContext<PickerEmits>['emit']
) => {
  const { lang } = useLocale()
  const nsDate = useNamespace('date')
  const nsInput = useNamespace('input')
  const nsRange = useNamespace('range')
  const { form, formItem } = useFormItem()
  const pickerSize = useSize()
  const flPopperOptions = inject(PICKER_POPPER_OPTIONS, {} as Options)
  //判断是否是使用tab退出的input,用于触发失焦事件
  let hasJustTabExitedInput = false
  //是否忽略聚焦事件
  let ignoreFocusEvent = false
  //popper的ref
  const popperRef = ref<TooltipInstance>()
  //input的ref
  const inputRef = ref<HTMLElement | ComponentPublicInstance>()
  //详见handleInput
  const input = ref<Input>(null)
  //picker配置,详见onSetPickerOption
  const pickerOptions = ref<Partial<PickerOptions>>({})
  //picker是否显示显示
  const pickerVisible = ref(false)
  //picker是否真实的显示
  const pickerActualVisible = ref(false)
  //打开时的值
  const valueOnOpen = ref<PickerProps['modelValue'] | null>(null)
  //当前失焦事件的延迟回调
  // let currentHandleBlurDeferCallback:
  //   | (() => Promise<void> | undefined)
  //   | undefined = undefined

  //手动控制是否显示清除图标
  const showClear = ref(false)
  //是否是包括time的选择器
  const isTimeLikePicker = computed(() => props.type.includes('time'))
  //是否是time选择器
  const isTimePicker = computed(() => props.type.startsWith('time'))
  //是否是多选择器
  const isDatesPicker = computed(() => props.type === 'dates')
  //选择器是否失效
  const pickerDisabled = computed(() => {
    return props.disabled || form?.disabled
  })
  //判断modelValue是否是空值
  const valueIsEmpty = computed(() => {
    const { modelValue } = props
    /** 判断modelValue是否为空
     * isArray(modelValue),判断modelValue是否是数组
     * modelValue.filter(Boolean),过滤Boolean(item)为false的值
     * 只有当modelValue为null或者modelValue.filter(Boolean).length为0时,返回true
     */
    return (
      !modelValue || (isArray(modelValue) && !modelValue.filter(Boolean).length)
    )
  })
  //解析modelValue
  const parsedValue = computed(() => {
    let dayOrDays: DayOrDays
    //如果modelValue是空值
    if (valueIsEmpty.value) {
      //如果pickerOptions.value.getDefaultValue存在
      if (pickerOptions.value.getDefaultValue) {
        dayOrDays = pickerOptions.value.getDefaultValue()
      }
    } else {
      //如果modelValue是数组
      if (isArray(props.modelValue)) {
        //遍历获得dayjs类型数组
        dayOrDays = props.modelValue.map((d) =>
          parseDate(d, props.valueFormat, lang.value)
        ) as [Dayjs, Dayjs]
      } else {
        dayOrDays = parseDate(props.modelValue, props.valueFormat, lang.value)!
      }
    }

    //如果getRangeAvailableTime存在
    if (pickerOptions.value.getRangeAvailableTime) {
      const availableResult = pickerOptions.value.getRangeAvailableTime(
        dayOrDays!
      )
      //当dayOrDays无效时
      if (!isEqual(availableResult, dayOrDays!)) {
        //设置dayOrDays为有效值
        dayOrDays = availableResult
        //调用emitInput
        emitInput(
          (isArray(dayOrDays)
            ? dayOrDays.map((item) => item.toDate())
            : dayOrDays.toDate()) as SingleOrRange<Date>
        )
      }
    }
    //如果是数组且数组为空
    if (isArray(dayOrDays!) && dayOrDays.some((day) => !day)) {
      dayOrDays = [] as unknown as DayOrDays
    }
    return dayOrDays!
  })
  //显示的value,优先返回input.value,然后才是formattedValue => 即格式化后的parsedValue
  const displayValue = computed<Input>(() => {
    //如果面板没有初始化,返回''
    if (!pickerOptions.value.panelReady) return ''
    //获得格式化的parsedValue
    const formattedValue = formatDayjsToString(parsedValue.value)
    //如果input是数组,根据优先级返回数组对应项input => formattedValue => ''
    if (isArray(input.value)) {
      return [
        input.value[0] || (formattedValue && formattedValue[0]) || '',
        input.value[1] || (formattedValue && formattedValue[1]) || '',
      ]
    } else if (input.value !== null) {
      return input.value
    }
    //如果不是时间选择器且modelValue是空值,返回''
    if (!isTimePicker.value && valueIsEmpty.value) return ''
    //如果选择器未显示且modelValue是空值,返回''
    if (!pickerVisible.value && valueIsEmpty.value) return ''
    //当formattedValue存在,且是日期多选,用,分割formattedValue,否则返回formattedValue
    if (formattedValue) {
      return isDatesPicker.value
        ? (formattedValue as Array<string>).join(', ')
        : formattedValue
    }
    return ''
  })
  //触发器图标
  const triggerIcon = computed(
    () => props.prefixIcon || (isTimeLikePicker.value ? Clock : Calendar)
  )
  //是否是时间范围选择器
  const isRangeInput = computed(() => {
    return props.type.includes('range')
  })
  //popper实例
  const popperEl = computed(() => unref(popperRef)?.popperRef?.contentRef)
  //获取inputRef下的输入框实例
  const inputEl = computed<HTMLInputElement[]>(() => {
    if (inputRef.value) {
      const el = isRangeInput.value
        ? inputRef.value
        : (inputRef.value as any as ComponentPublicInstance).$el
      return Array.from<HTMLInputElement>(el.querySelectorAll('input'))
    }
    return []
  })
  //真实的input
  const actualInputRef = computed(() => {
    //如果不是时间范围选择器,返回unref(inputRef)
    if (unref(isRangeInput)) {
      return unref(inputRef)
    }
    //否则返回unref(inputRef).$el
    return (unref(inputRef) as ComponentPublicInstance)?.$el
  })
  //触发change事件
  const emitChange = (
    val: PickerProps['modelValue'] | null,
    isClear?: boolean
  ) => {
    //如果isClear为true或者val与valueOnOpen.value不相同,执行下列函数
    if (isClear || !valueEquals(val, valueOnOpen.value)) {
      emit('change', val)
      //如果validateEvent存在
      props.validateEvent &&
        formItem?.validate('change').catch((err) => debugWarn(err))
    }
  }
  //触发输入事件
  const emitInput = (input: SingleOrRange<DateModelType | Dayjs> | null) => {
    //如果新值和旧值不相同
    if (!valueEquals(props.modelValue, input)) {
      let formatted
      if (isArray(input)) {
        formatted = input.map((item) =>
          //格式化
          formatter(item, props.valueFormat, lang.value)
        )
      } else if (input) {
        formatted = formatter(input, props.valueFormat, lang.value)
      }
      //更新modelValue
      emit('update:modelValue', input ? formatted : input, lang.value)
    }
  }
  //触发keydown事件
  const emitKeydown = (e: KeyboardEvent) => {
    emit('keydown', e)
  }
  //设置input光标高亮范围
  const setSelectionRange = (
    start: number,
    end: number,
    pos?: 'min' | 'max'
  ) => {
    const inputs = inputEl.value
    if (!inputs.length) return
    if (!pos || pos === 'min') {
      inputs[0].setSelectionRange(start, end)
      inputs[0].focus()
    } else if (pos === 'max') {
      inputs[1].setSelectionRange(start, end)
      inputs[1].focus()
    }
  }
  //设置false
  const focusOnInputBox = () => {
    focus(true, true)
    nextTick(() => {
      ignoreFocusEvent = false
    })
  }
  //点击事件
  const onPick = (date: any = '', visible = false) => {
    //如果不可见,聚焦inputBox
    if (!visible) {
      focusOnInputBox()
    }
    pickerVisible.value = visible
    let result
    if (isArray(date)) {
      result = date.map((item) => item.toDate())
    } else {
      result = date ? date.toDate() : date
    }
    input.value = null
    emitInput(result)
  }
  //显示输入框之前
  const onBeforeShow = () => {
    pickerActualVisible.value = true
  }
  //触发visible-change
  const onShow = () => {
    emit('visible-change', true)
  }
  const onKeydownPopperContent = (e: KeyboardEvent) => {
    if ((e as KeyboardEvent)?.key === EVENT_CODE.esc) {
      focus(true, true)
    }
  }
  const onHide = () => {
    pickerActualVisible.value = false
    ignoreFocusEvent = false
    emit('visible-change', false)
  }
  const handleOpen = () => {
    pickerVisible.value = true
  }
  const handleClose = () => {
    pickerVisible.value = false
  }
  /**
   *
   * @param focusStartInput 是否聚焦开始的输入框
   * @param isIgnoreFocusEvent 是否忽略聚焦事件
   */
  const focus = (focusStartInput = true, isIgnoreFocusEvent = false) => {
    //设置是否聚焦事件
    ignoreFocusEvent = isIgnoreFocusEvent
    const [leftInput, rightInput] = unref(inputEl)
    let input = leftInput
    //如果不聚焦开始输入框,且时范围输入框,设置input为rightInput
    if (!focusStartInput && isRangeInput.value) {
      input = rightInput
    }
    //如果input存在,设置聚焦
    if (input) {
      input.focus()
    }
  }
  //处理聚焦输入框
  const handleFocusInput = (e?: FocusEvent) => {
    if (
      props.readonly ||
      pickerDisabled.value ||
      pickerVisible.value ||
      ignoreFocusEvent
    ) {
      return
    }
    //如果没有相关元素,显示picker
    pickerVisible.value = true
    emit('focus', e)
  }
  //input失焦事件
  const handleBlurInput = (e?: FocusEvent) => {
    /**
       * popperRef.value?.isFocusInsideContent(),判断是否聚焦在popper内
       * hasJustTabExitedInput,判断是否是使用tab退出input
       * inputEl.value.filter((input) => {
            return input.contains(document.activeElement)
          }).length === 0,判断是否没有聚焦在input上
       * 当聚焦popper上时,只有hasJustTabExitedInput为true且同时没有聚焦input时,执行后续语句
       * 当没有聚焦popper上时,且没有聚焦input时,执行后续语句
       */
    setTimeout(() => {
      if (
        !(popperRef.value?.isFocusInsideContent() && !hasJustTabExitedInput) &&
        inputEl.value.filter((input) => {
          return input.contains(document.activeElement)
        }).length === 0
      ) {
        handleChange()
        pickerVisible.value = false
        //触发失焦事件
        emit('blur', e)
        //如果props.validateEvent存在
        props.validateEvent &&
          formItem?.validate('blur').catch((err) => debugWarn(err))
      }
      hasJustTabExitedInput = false
    }, 0)
  }
  //清除事件
  const handleClear = (e: MouseEvent) => {
    if (props.readonly || pickerDisabled.value) return
    //是否显示clear按钮
    if (showClear.value) {
      //停止传播
      e.stopPropagation()
      //聚焦
      focusOnInputBox()
      //清空input,change
      emitInput(null)
      emitChange(null, true)
      //关闭close按钮
      showClear.value = false
      //关闭picker弹窗
      pickerVisible.value = false
      //调用对应pickerclear事件
      pickerOptions.value.handleClear && pickerOptions.value.handleClear()
    }
  }
  //鼠标按下事件
  const onMouseDownInput = async (e: MouseEvent) => {
    if (props.readonly || pickerDisabled.value) return
    //如果target标签不是input或者在input内部,显示picker
    if (
      (e.target as HTMLElement)?.tagName !== 'INPUT' ||
      inputEl.value.includes(document.activeElement as HTMLInputElement)
    ) {
      pickerVisible.value = true
    }
  }
  //鼠标进入事件
  const onMouseEnter = () => {
    if (props.readonly || pickerDisabled.value) return
    //如果有值且可以清除,显示clear
    if (!valueIsEmpty.value && props.clearable) {
      showClear.value = true
    }
  }
  //鼠标离开事件
  const onMouseLeave = () => {
    showClear.value = false
  }
  //开始触摸事件
  const onTouchStartInput = (e: TouchEvent) => {
    //如果touches[0]在inputEl,显示picker
    if (
      (e.touches[0].target as HTMLElement)?.tagName !== 'INPUT' ||
      inputEl.value.includes(document.activeElement as HTMLInputElement)
    ) {
      pickerVisible.value = true
    }
  }
  //change事件
  const handleChange = () => {
    if (input.value) {
      //解析input
      const value = parseInputToDayjs(displayValue.value)
      if (value) {
        //如果验证通过,执行emitInput
        if (isValidValue(value)) {
          emitInput(
            (isArray(value)
              ? value.map((item) => item.toDate())
              : value.toDate()) as DateOrDates
          )
          //清空input
          input.value = null
        }
      }
    }
    //如果input.value是'',初始化
    if (input.value === '') {
      emitInput(null)
      emitChange(null)
      input.value = null
    }
  }
  //解析输入,返回待验证的dayjs数据
  const parseInputToDayjs = (value: Input) => {
    if (!value) return null
    return pickerOptions.value.parseInput!(value)
  }
  //通过pickerOptions.formatToString格式化
  const formatDayjsToString = (value: DayOrDays) => {
    if (!value) return null
    return pickerOptions.value.formatToString!(value)
  }
  //通过pickerOptions.value.isValidValue验证value
  const isValidValue = (value: DayOrDays) => {
    return pickerOptions.value.isValidValue!(value)
  }
  //键盘按下事件
  const handleKeydownInput = async (e: KeyboardEvent) => {
    if (props.readonly || pickerDisabled.value) return
    const { code } = e
    //发射keydown事件
    emitKeydown(e)
    //如果时esc,关闭picker,停止传播和阻止默认操作
    if (code === EVENT_CODE.esc) {
      if (pickerVisible.value === true) {
        pickerVisible.value = false
        e.preventDefault()
        e.stopPropagation()
      }
      return
    }
    //如果是donw,触发handleFocusPicker
    if (code === EVENT_CODE.down) {
      //阻止默认操作
      if (pickerOptions.value.handleFocusPicker) {
        e.preventDefault()
        e.stopPropagation()
      }
      //显示picker
      if (pickerVisible.value === false) {
        pickerVisible.value = true
        await nextTick()
      }
      //调用
      if (pickerOptions.value.handleFocusPicker) {
        pickerOptions.value.handleFocusPicker()
        return
      }
    }

    //如果是tab,设置hasJustTabExitedInput为true
    if (code === EVENT_CODE.tab) {
      hasJustTabExitedInput = true
      return
    }

    //如果是回车键,当input没有值或者显示值通过验证,调用handleChange(),关闭picker
    if (code === EVENT_CODE.enter || code === EVENT_CODE.numpadEnter) {
      if (
        input.value === null ||
        input.value === '' ||
        isValidValue(parseInputToDayjs(displayValue.value) as DayOrDays)
      ) {
        handleChange()
        pickerVisible.value = false
      }
      e.stopPropagation()
      return
    }

    //当用户输入时阻止传播
    if (input.value) {
      e.stopPropagation()
      return
    }
    //调用对应选择器的handleKeydownInput()
    if (pickerOptions.value.handleKeydownInput) {
      pickerOptions.value.handleKeydownInput(e)
    }
  }
  //处理input事件
  const handleInput = (e: string) => {
    //input赋值
    input.value = e
    //如果picker未显示,使其显示
    if (!pickerVisible.value) {
      pickerVisible.value = true
    }
  }
  //开始日期输入框,设置input[0]
  const handleStartInput = (e: Event) => {
    const target = e.target as HTMLInputElement
    if (input.value) {
      input.value = [target.value, input.value[1]]
    } else {
      input.value = [target.value, null]
    }
  }
  //结束日期输入框,设置input[1]
  const handleEndInput = (e: Event) => {
    const target = e.target as HTMLInputElement
    if (input.value) {
      input.value = [input.value[0], target.value]
    } else {
      input.value = [null, target.value]
    }
  }
  //开始日期改变事件
  const handleStartChange = () => {
    const values = input.value as string[]
    const value = parseInputToDayjs(values && values[0]) as Dayjs
    const parsedVal = unref(parsedValue) as [Dayjs, Dayjs]
    //如果输入值通过验证,修改
    if (value && value.isValid()) {
      input.value = [
        formatDayjsToString(value) as string,
        displayValue.value?.[1] || null,
      ]
      const newValue = [value, parsedVal && (parsedVal[1] || null)] as DayOrDays
      if (isValidValue(newValue)) {
        emitInput(newValue)
        input.value = null
      }
    }
  }
  //结束日期改变事件
  const handleEndChange = () => {
    const values = unref(input) as string[]
    const value = parseInputToDayjs(values && values[1]) as Dayjs
    const parsedVal = unref(parsedValue) as [Dayjs, Dayjs]
    if (value && value.isValid()) {
      input.value = [
        unref(displayValue)?.[0] || null,
        formatDayjsToString(value) as string,
      ]
      const newValue = [parsedVal && parsedVal[0], value] as DayOrDays
      if (isValidValue(newValue)) {
        emitInput(newValue)
        input.value = null
      }
    }
  }
  //设置pickerOption
  const onSetPickerOption = <T extends keyof PickerOptions>(
    e: [T, PickerOptions[T]]
  ) => {
    pickerOptions.value[e[0]] = e[1]
    pickerOptions.value.panelReady = true
  }
  //日历改变事件
  const onCalendarChange = (e: [Date, false | Date]) => {
    emit('calendar-change', e)
  }

  //面板改变事件
  const onPanelChange = (
    value: [Dayjs, Dayjs],
    mode: 'month' | 'year',
    view: unknown
  ) => {
    emit('panel-change', value, mode, view)
  }

  //点击actualInputRef外部事件
  onClickOutside(actualInputRef, (e: PointerEvent) => {
    const unrefedPopperEl = unref(popperEl)
    const inputEl = unref(actualInputRef)
    //当目标不是popper,input,且不经过popper,input时关闭picker
    if (
      (unrefedPopperEl &&
        (e.target === unrefedPopperEl ||
          e.composedPath().includes(unrefedPopperEl))) ||
      e.target === inputEl ||
      e.composedPath().includes(inputEl)
    ) {
      return
    }

    pickerVisible.value = false
  })
  /**
   * 监听pickerVisible
   * 如果val为false,调用emitChange()
   * 如果val为true设置valueOnOpen
   */
  watch(pickerVisible, (val) => {
    if (!val) {
      input.value = null
      nextTick(() => {
        emitChange(props.modelValue)
      })
    } else {
      valueOnOpen.value = props.modelValue
    }
  })
  provide(PICKER_BASE, {
    props,
  })

  return {
    popperRef,
    inputRef,
    onPick,
    onHide,
    onShow,
    nsDate,
    nsInput,
    nsRange,
    showClear,
    displayValue,
    parsedValue,
    pickerSize,
    pickerDisabled,
    pickerActualVisible,
    pickerVisible,
    flPopperOptions,
    isRangeInput,
    isDatesPicker,
    handleOpen,
    handleClose,
    handleChange,
    handleFocusInput,
    triggerIcon,
    handleClear,
    setSelectionRange,
    onBeforeShow,
    onMouseDownInput,
    onMouseEnter,
    onKeydownPopperContent,
    onMouseLeave,
    handleKeydownInput,
    onTouchStartInput,
    handleBlurInput,
    handleInput,
    handleStartInput,
    handleEndInput,
    handleStartChange,
    handleEndChange,
    onSetPickerOption,
    onCalendarChange,
    onPanelChange,
  }
}
