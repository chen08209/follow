import {
  computed,
  nextTick,
  reactive,
  ref,
  shallowRef,
  toRaw,
  triggerRef,
  watch,
} from 'vue'
import { isObject, toRawType } from '@vue/shared'
import {
  CHANGE_EVENT,
  EVENT_CODE,
  UPDATE_MODEL_EVENT,
} from '@follow-ui/constants'
import { useFormItem, useLocale, useNamespace, useSize } from '@follow-ui/hooks'
import {
  debugWarn,
  getComponentSize,
  isVal,
  scrollIntoView,
} from '@follow-ui/utils'
import { isClient } from '@vueuse/core'
import { get, isEqual, debounce as lodashDebounce } from 'lodash-unified'

import type { QueryChangeCtx, UseOptionContext } from '@follow-ui/tokens'
import type { FlTooltip } from '../../../tooltip'
import type { ComponentPublicInstance, ComponentInternalInstance } from 'vue'
import type { SelectProps } from './select'

// const prefixWidthMap = {
//   small: 7,
//   default: 11,
//   large: 15,
// }

//根据props生成状态
export function useSelectStates(props) {
  const { t } = useLocale()
  return reactive({
    //选项Map
    options: new Map(),
    //缓存选项Map
    cachedOptions: new Map(),
    createdLabel: null,
    createdSelected: false,
    selected: props.multiple ? [] : ({} as any),
    //搜索框长度,15*n + 20
    inputLength: 20,
    inputWidth: 0,
    //选项数
    optionsCount: 0,
    //过滤至后的选项数
    filteredOptionsCount: 0,
    //下拉框是否可见
    visible: false,
    //软聚焦,详见handleFocus事件
    softFocus: false,
    //单选时输入框显示的标签
    selectedLabel: '',
    hoverIndex: -1,
    //当前查询条件
    query: '',
    //上一个查询条件
    previousQuery: null,
    //是否处于hover
    inputHovering: false,
    //缓存占位符
    cachedPlaceHolder: '',
    //事实占位符
    currentPlaceholder: t('fl.select.placeholder'),
    //聚焦时是否不显示下拉框,详见toggleMenu(目测名字取反)
    menuVisibleOnFocus: false,
    //是否处于输入合成
    isOnComposition: false,
    //查询输入框前缀宽度,默认11 = 8(tags-wrapper外边距)+2(tag外边距)+1(tag)
    prefixWidth: 11,
    //静默blur,类似softFocus,详见handleBlur
    isSilentBlur: false,
    tagInMultiLine: false,
  })
}

type States = ReturnType<typeof useSelectStates>

export const useSelect = (
  props: SelectProps,
  states: States,
  ctx: ComponentInternalInstance | null
): any => {
  const { t } = useLocale()
  const ns = useNamespace('select')
  //tags和reference 都是select-trigger下的子节点
  const reference = ref<ComponentPublicInstance<{
    focus: () => void
    blur: () => void
    input: HTMLInputElement
  }> | null>(null)
  const tags = ref<HTMLElement | null>(null)

  const input = ref<HTMLInputElement | null>(null)
  const tooltipRef = ref<InstanceType<typeof FlTooltip> | null>(null)
  const selectWrapper = ref<HTMLElement | null>(null)
  const scrollbar = ref<{
    handleScroll: () => void
  } | null>(null)
  const hoverOption = ref(-1)
  const queryChange = shallowRef<QueryChangeCtx>({ query: '' })
  const groupQueryChange = shallowRef('')

  const { form, formItem } = useFormItem()

  //只有当select可过滤而且不是多选以及处于打开状态时input框不是只读
  const readonly = computed(() => {
    return !props.filterable || props.multiple || !states.visible
  })

  //只有当select以及form都不是disabled,select才不是disabled
  const selectDisabled = computed(() => props.disabled || form?.disabled)

  //显示clear
  const showClose = computed(() => {
    /* 判断是否有值
     如果是多选,判断props.modelValue数组长度是否大于一
     如果是单选,判断props.modelValue是否有值 */
    const hasValue = props.multiple
      ? Array.isArray(props.modelValue) && props.modelValue.length > 0
      : isVal(props.modelValue)
    // : props.modelValue !== undefined &&
    //   props.modelValue !== null &&
    //   props.modelValue !== ''

    /* 当select可以clear且select不是disabled时,
    如果select处于hover状态,且有值,显示clear */
    const criteria =
      props.clearable &&
      !selectDisabled.value &&
      states.inputHovering &&
      hasValue
    return criteria
  })

  /**
   * 后缀图标
   * 如果props.remote和props.filterable都为true,返回''
   * 否则返回props.suffixIcon
   */
  const iconComponent = computed(() =>
    props.remote && props.filterable ? '' : props.suffixIcon
  )

  /**
   * 如果iconComponent存在且下拉框是可见的,旋转图标
   */
  const iconReverse = computed(() =>
    ns.is('reverse', (iconComponent.value && states.visible) as boolean)
  )

  const debounce = computed(() => (props.remote ? 300 : 0))

  /**
   * 空文本
   *
   * 当select处于加载中,返回传入的加载文本 或 默认加载文本 t('fl.select.loading')
   *
   * 否则, 如果启用远程搜索,当查询条件为'',且选项数为0时, 返回 false
   *
   * 当select是可过滤时,当查询条件和选项都存在,
   * 如果当前过滤选项数为0,返回传入的未匹配文本 或者 默认未匹配空文本
   *
   * 如过选项数为0,返回传入的空数据文本,或者默认空数据文本
   *
   * 当以上都不成立,返回null
   *
   * @return 当return false时表明处于远程搜索模式
   */
  const emptyText = computed(() => {
    if (props.loading) {
      return props.loadingText || t('fl.select.loading')
    } else {
      if (props.remote && states.query === '' && states.options.size === 0)
        return false
      if (
        props.filterable &&
        states.query &&
        states.options.size > 0 &&
        states.filteredOptionsCount === 0
      ) {
        return props.noMatchText || t('fl.select.noMatch')
      }
      if (states.options.size === 0) {
        return props.noDataText || t('fl.select.noData')
      }
    }
    return null
  })

  //选项数组
  const optionsArray = computed(() => Array.from(states.options.values()))

  //缓存选项数组
  const cachedOptionsArray = computed(() =>
    Array.from(states.cachedOptions.values())
  )

  //是否展示新创建的选项
  const showNewOption = computed(() => {
    //过滤新创建的选项,判断是否存在label === query的选项
    const hasExistingOption = optionsArray.value
      .filter((option) => {
        return !option.created
      })
      .some((option) => {
        return option.currentLabel === states.query
      })
    return (
      props.filterable &&
      props.allowCreate &&
      states.query !== '' &&
      !hasExistingOption
    )
  })

  //获得当前size
  const selectSize = useSize()

  /**
   * 折叠标签尺寸
   * 判断当前size是否是small,如果是返回small,否则返回default
   */
  const collapseTagSize = computed(() =>
    ['small'].includes(selectSize.value) ? 'small' : 'default'
  )

  //修改关于padding的计算,暂时搁置
  // const prefixWidth = computed(() => prefixWidthMap[selectSize.value])

  /**
   * 下拉菜单可见性
   * 如果states.visible == true, 空文本不等于false(), 返回true
   */
  const dropMenuVisible = computed({
    get() {
      return states.visible && emptyText.value !== false
    },
    set(val: boolean) {
      states.visible = val
    },
  })

  //监听selectDisabled.value, selectSize.value, form?.size
  watch(
    [() => selectDisabled.value, () => selectSize.value, () => form?.size],
    () => {
      nextTick(() => {
        resetInputHeight()
      })
    }
  )

  //监听placeholder,修改cachedPlaceHolder,currentPlaceholder
  watch(
    () => props.placeholder,
    (val) => {
      states.cachedPlaceHolder = states.currentPlaceholder = val as string
    }
  )

  //监听modelValue
  watch(
    () => props.modelValue,
    (val, oldVal) => {
      if (props.multiple) {
        //重置input高度
        resetInputHeight()
        //如果value存在,修改currentPlaceholder = '',否则设置为cachedPlaceHolder(目测多余)
        if (
          (val && (val as unknown[]).length > 0) ||
          (input.value && states.query !== '')
        ) {
          states.currentPlaceholder = ''
        } else {
          states.currentPlaceholder = states.cachedPlaceHolder
        }

        //如果select可以过滤,而且搜索后不保留关键字,则清除query进行搜搜
        if (props.filterable && !props.reserveKeyword) {
          states.query = ''
          handleQueryChange(states.query)
        }
      }

      //设置选中
      setSelected()

      //如果使可搜索非多选,设置inputLength = 20
      if (props.filterable && !props.multiple) {
        states.inputLength = 20
      }

      //如果新val和oldVal不是相同的而且存在校验事件
      if (!isEqual(val, oldVal) && props.validateEvent) {
        formItem?.validate('change').catch((err) => debugWarn(err))
      }
    },
    {
      //flush: 'post' => dom更新后后执行, deep => 深度
      flush: 'post',
      deep: true,
    }
  )

  //监听visible
  watch(
    () => states.visible,
    (val) => {
      if (!val) {
        //注释(代码不会生效)
        // input.value && input.value.blur()
        //清空查询条件
        states.query = ''
        //清空以往的查询条件
        states.previousQuery = null
        //清空选中的label
        states.selectedLabel = ''
        states.inputLength = 20
        states.menuVisibleOnFocus = false
        //重置hoverIndex
        resetHoverIndex()
        //等待更新完成
        nextTick(() => {
          //如果input和states.selected都没有值
          if (
            input.value &&
            input.value.value === '' &&
            states.selected.length === 0
          ) {
            //设置currentPlaceholder为cachedPlaceHolder
            states.currentPlaceholder = states.cachedPlaceHolder
          }
        })

        //多选以及可过滤模式下,下拉框关闭时,使input失焦,reference聚焦
        if (props.multiple && props.filterable) {
          nextTick(() => {
            input.value && input.value.blur()
            setSoftFocus()
            reference.value && reference.value.focus()
          })
        }

        //如果不是多选
        if (!props.multiple) {
          //如果selected有值
          if (states.selected) {
            //且select可以过滤,允许创建tag,states.createdSelected && states.createdLabel 都为true
            if (
              props.filterable &&
              props.allowCreate &&
              states.createdSelected &&
              states.createdLabel
            ) {
              //设置选中选项的label为createdLabel
              states.selectedLabel = states.createdLabel
            } else {
              //否则设置选中选项的label为states.selected.currentLabel
              states.selectedLabel = states.selected.currentLabel
            }
            //如果使可以过滤的,设置query为selectedLabel
            if (props.filterable) states.query = states.selectedLabel
          }

          //如果可以过滤设置currentPlaceholder为cachedPlaceHolder
          if (props.filterable) {
            states.currentPlaceholder = states.cachedPlaceHolder
          }
        }
      } else {
        //更新popper
        tooltipRef.value?.updatePopper?.()
        if (props.filterable) {
          //设置过滤选项数为选项数
          states.filteredOptionsCount = states.optionsCount
          //如果远程搜索开启,设置query为'',否则设置query为selectedLabel
          states.query = props.remote ? '' : states.selectedLabel
          if (props.multiple) {
            //聚焦
            input.value?.focus()
          } else {
            //如果selectedLabel存在
            if (states.selectedLabel) {
              //设置currentPlaceholder为selectedLabel
              states.currentPlaceholder = `${states.selectedLabel}`
              //设置selectedLabel为''
              states.selectedLabel = ''
            }
          }
          //使用query过滤option
          handleQueryChange(states.query)
          if (!props.multiple && !props.remote) {
            //清空queryChange.value.query
            queryChange.value.query = ''
            //触发queryChange的update
            triggerRef(queryChange)
            //触发groupQueryChange的update
            triggerRef(groupQueryChange)
          }
        }
      }
      //触发visible-change回调
      ctx?.emit('visible-change', val)
    }
  )

  //监听states.options,发生改变时更新
  watch(
    () => states.options.entries(),
    () => {
      //如果不是浏览器环境,返回
      if (!isClient) return
      tooltipRef.value?.updatePopper?.()
      if (props.multiple) {
        resetInputHeight()
      }
      //获取selectWrapper下所有input标签
      const inputs = selectWrapper.value?.querySelectorAll('input') || []
      //如果这些inut中不存在被激活的元素,调用setSelected()
      if (
        !Array.from(inputs).includes(document.activeElement as HTMLInputElement)
      ) {
        setSelected()
      }

      if (
        props.defaultFirstOption &&
        (props.filterable || props.remote) &&
        states.filteredOptionsCount
      ) {
        checkDefaultFirstOption()
      }
    },
    {
      flush: 'post',
    }
  )

  /**
   * 监听hoverIndex
   * 根据hoverIndex修改hoverOption,用来设置option.hover
   */
  watch(
    () => states.hoverIndex,
    (val) => {
      //如果val使number且值大于-1
      if (typeof val === 'number' && val > -1) {
        hoverOption.value = optionsArray.value[val] || {}
      }
      optionsArray.value.forEach((option) => {
        //设置option.hover
        option.hover = hoverOption.value === option
      })
    }
  )

  //重置input高度
  const resetInputHeight = () => {
    //如果select有折叠标签且无法过滤,返回
    if (props.collapseTags && !props.filterable) return
    nextTick(() => {
      //如果reference不存在, 返回
      if (!reference.value) return
      //获取reference下的input节点
      const input = reference.value.$el.querySelector(
        'input'
      ) as HTMLInputElement
      //获取tags
      const _tags = tags.value
      //获取size对应实际大小
      const sizeInMap = getComponentSize(selectSize.value || form?.size)
      /**通过tags高度计算input高度
       * 如果没有选中选项,返回sizeInMap
       * 否则判断是否存在标签, 如果存在,计算tags的高度
       * 如果它的高度 > sizeInMap,返回_tags.clientHeight + 6 (select的高度)
       * 否则返回sizeInMap
       * 后续需要用flInput的高度-2得到input框的高度
       */
      input.style.height = `${
        (states.selected.length === 0
          ? sizeInMap
          : Math.max(
              _tags
                ? _tags.clientHeight + (_tags.clientHeight > sizeInMap ? 6 : 0)
                : 0,
              sizeInMap
            )) - 2
      }px`

      //tag是否需要多行
      states.tagInMultiLine = Number.parseFloat(input.style.height) >= sizeInMap

      //如果下拉菜单是可见的而且处于远程搜索初始状态时,更新popper
      if (states.visible && emptyText.value !== false) {
        tooltipRef.value?.updatePopper?.()
      }
    })
  }

  //查询处理
  const handleQueryChange = (val) => {
    //如果上一个查询等于val或者处于输入合成期间,返回
    if (states.previousQuery === val || states.isOnComposition) return
    //如果上一个查询为null,且filterMethod和remoteMethod中有一个是函数,使previousQuery = val,并返回
    if (
      states.previousQuery === null &&
      (typeof props.filterMethod === 'function' ||
        typeof props.remoteMethod === 'function')
    ) {
      states.previousQuery = val
      return
    }
    //设置上一个查询条件为val
    states.previousQuery = val
    nextTick(() => {
      //如果visible为true,更新popper
      if (states.visible) tooltipRef.value?.updatePopper?.()
    })
    //取消悬停
    states.hoverIndex = -1
    //如果是多选且可以过滤
    if (props.multiple && props.filterable) {
      nextTick(() => {
        //获得value的长度
        const length = input.value!.value.length * 15 + 20
        //设置inputLength
        states.inputLength = props.collapseTags ? Math.min(50, length) : length
        //处理占位符
        managePlaceholder()
        //重置input高度
        resetInputHeight()
      })
    }
    if (props.remote && typeof props.remoteMethod === 'function') {
      states.hoverIndex = -1
      //调用remoteMethod
      props.remoteMethod(val)
    } else if (typeof props.filterMethod === 'function') {
      //调用过滤方法
      props.filterMethod(val)
      //更新
      triggerRef(groupQueryChange)
    } else {
      //设置filteredOptionsCount为optionsCount
      states.filteredOptionsCount = states.optionsCount
      //设置queryChange.value.query 为 val
      queryChange.value.query = val
      //触发queryChange
      triggerRef(queryChange)
      //触发groupQueryChange
      triggerRef(groupQueryChange)
    }
    //如过defaultFirstOption为true第一个选项以及开启了过滤或远程搜索,当过滤选项数存在时,调用checkDefaultFirstOption()
    if (
      props.defaultFirstOption &&
      (props.filterable || props.remote) &&
      states.filteredOptionsCount
    ) {
      checkDefaultFirstOption()
    }
  }

  //处理占位符
  const managePlaceholder = () => {
    //如果当前展位符不等于''
    if (states.currentPlaceholder !== '') {
      //当input.value!.value存在时设置当前占位符为空,否则设置为缓存的展位符
      states.currentPlaceholder = input.value!.value
        ? ''
        : states.cachedPlaceHolder
    }
  }

  //设置默认悬停第一个选项
  const checkDefaultFirstOption = () => {
    //获取可见未失效的选项
    const optionsInDropdown = optionsArray.value.filter(
      (n) => n.visible && !n.disabled && !n.states.groupDisabled
    )

    //获取第一个创建的选项
    const userCreatedOption = optionsInDropdown.find((n) => n.created)

    //获取第一个原始选项
    const firstOriginOption = optionsInDropdown[0]

    //设置hoverIndex为userCreatedOption 或者 firstOriginOption
    states.hoverIndex = getValueIndex(
      optionsArray.value,
      userCreatedOption || firstOriginOption
    )
  }

  //设置选中
  const setSelected = () => {
    //如果不是多选 => 单选
    if (!props.multiple) {
      //获取option
      const option = getOption(props.modelValue)

      //如果option有props,且created时true(暂定为不可能打到的代码)
      // if (option.props?.created) {
      //   states.createdLabel = option.props.value
      //   states.createdSelected = true
      // } else {
      //   states.createdSelected = false
      // }

      states.createdSelected = false

      //设置selectedLabel,selected
      states.selectedLabel = option.currentLabel
      states.selected = option

      //如果option可过滤,设置query为selectedLabel
      if (props.filterable) states.query = states.selectedLabel
      return
    } else {
      //设置选中的label = ''
      states.selectedLabel = ''
    }
    const result: string | number[] = []
    //如果modelValue是数组,遍历modelValue,将option加入到result数组
    if (Array.isArray(props.modelValue)) {
      props.modelValue.forEach((value) => {
        result.push(getOption(value))
      })
    }
    //设置选中的数组为result
    states.selected = result

    //更新input高度
    nextTick(() => {
      resetInputHeight()
    })
  }

  //获取option,如果不存在返回新的option
  const getOption = (value) => {
    let option
    const isObjectValue = toRawType(value).toLowerCase() === 'object'
    const isNull = toRawType(value).toLowerCase() === 'null'
    const isUndefined = toRawType(value).toLowerCase() === 'undefined'

    //遍历cachedOptions
    for (let i = states.cachedOptions.size - 1; i >= 0; i--) {
      //缓存选项
      const cachedOption = cachedOptionsArray.value[i]
      /**
       * 判断是否是同一个value
       * 如果value是对象,通过get方法获得cachedOption和value里的props.valueKey,并判断值是否相等
       * 否则判断cachedOption.value和value是否相等
       */
      const isEqualValue = isObjectValue
        ? get(cachedOption.value, props.valueKey) === get(value, props.valueKey)
        : cachedOption.value === value
      //如果存在相同的value的option,给option赋值
      if (isEqualValue) {
        option = {
          value,
          currentLabel: cachedOption.currentLabel,
          isDisabled: cachedOption.isDisabled,
        }
        break
      }
    }

    //如果存在option,返回option,否则创建新的option
    if (option) return option

    //--当不存在时--

    const label = isObjectValue
      ? value.label
      : !isNull && !isUndefined
      ? value
      : ''

    //创建新的选项
    const newOption = {
      value,
      currentLabel: label,
    }

    //如果是多选,设置newOption.hitState = false
    if (props.multiple) {
      ;(newOption as any).hitState = false
    }
    return newOption
  }

  //重置悬停索引
  const resetHoverIndex = () => {
    //延迟执行
    setTimeout(() => {
      const valueKey = props.valueKey
      //如果不是多选
      if (!props.multiple) {
        //设置hoverIndex为selected的index
        states.hoverIndex = optionsArray.value.findIndex((item) => {
          return getValueKey(item) === getValueKey(states.selected)
        })
      } else {
        //多选,如果没有selected数组长度不大于0, 设置hoverIndex = -1
        if (states.selected.length > 0) {
          //Math.min,返回传入的最小参数,接收参数列表,可以通过apply使其接收数组
          states.hoverIndex = Math.min.apply(
            null,
            //返回所有selected在option中的index数组
            states.selected.map((selected) => {
              //找到对应selected的option index
              return optionsArray.value.findIndex((item) => {
                return get(item, valueKey) === get(selected, valueKey)
              })
            })
          )
        } else {
          //取消悬停
          states.hoverIndex = -1
        }
      }
    }, 300)
  }

  //处理调整大小事件
  const handleResize = () => {
    //重置input宽度
    resetInputWidth()
    //更新popper
    tooltipRef.value?.updatePopper?.()
    //如果是多选且不可过滤,重置input高度
    if (props.multiple && !props.filterable) resetInputHeight()
  }

  //重置输入框宽度
  const resetInputWidth = () => {
    states.inputWidth = reference.value?.$el.getBoundingClientRect().width
  }

  const onInputChange = () => {
    if (props.filterable && states.query !== states.selectedLabel) {
      states.query = states.selectedLabel
      handleQueryChange(states.query)
    }
  }

  const debouncedOnInputChange = lodashDebounce(() => {
    onInputChange()
  }, debounce.value)

  const debouncedQueryChange = lodashDebounce((e) => {
    handleQueryChange(e.target.value)
  }, debounce.value)

  //如果传入值与旧值不相同,触发change事件
  const emitChange = (val) => {
    if (!isEqual(props.modelValue, val)) {
      ctx?.emit(CHANGE_EVENT, val)
    }
  }

  const deletePrevTag = (e) => {
    if (e.target.value.length <= 0 && !toggleLastOptionHitState()) {
      const value = (props.modelValue as unknown[]).slice()
      value.pop()
      ctx?.emit(UPDATE_MODEL_EVENT, value)
      emitChange(value)
    }

    if (
      e.target.value.length === 1 &&
      (props.modelValue as unknown[]).length === 0
    ) {
      states.currentPlaceholder = states.cachedPlaceHolder
    }
  }

  const deleteTag = (event, tag) => {
    const index = states.selected.indexOf(tag)
    if (index > -1 && !selectDisabled.value) {
      const value = (props.modelValue as unknown[]).slice()
      value.splice(index, 1)
      ctx?.emit(UPDATE_MODEL_EVENT, value)
      emitChange(value)
      ctx?.emit('remove-tag', tag.value)
    }
    event.stopPropagation()
  }

  const deleteSelected = (event: Event) => {
    event.stopPropagation()
    const value: string | any[] = props.multiple ? [] : ''
    if (typeof value !== 'string') {
      for (const item of states.selected) {
        if (item.isDisabled) value.push(item.value)
      }
    }
    ctx?.emit(UPDATE_MODEL_EVENT, value)
    emitChange(value)
    states.visible = false
    ctx?.emit('clear')
  }

  //option选中事件
  const handleOptionSelect = (option, byClick) => {
    if (props.multiple) {
      //浅拷贝modelValue
      const value = ((props.modelValue as unknown[]) || []).slice()
      //获取option对应valud数组的index
      const optionIndex = getValueIndex(value, option.value)
      //如果存在,移除当前option,否则判断是否可以继续选择,是push当前option
      if (optionIndex > -1) {
        value.splice(optionIndex, 1)
      } else if (
        props.multipleLimit <= 0 ||
        value.length < props.multipleLimit
      ) {
        value.push(option.value)
      }
      //更新v-model
      ctx?.emit(UPDATE_MODEL_EVENT, value)
      //判断是否触发change回调
      emitChange(value)
      //如果option是新创建的选项,重置inputLength,清空query
      if (option.created) {
        states.query = ''
        handleQueryChange(states.query)
        states.inputLength = 20
      }
      //注释(用处未知)
      // if (props.filterable) input.value?.focus()
    } else {
      //更新,并关闭下拉菜单
      ctx?.emit(UPDATE_MODEL_EVENT, option.value)
      emitChange(option.value)
      states.visible = false
    }
    //使下一次失焦不回调emit
    states.isSilentBlur = byClick
    //软聚焦,使丢失光标
    setSoftFocus()
    if (states.visible) return
    nextTick(() => {
      scrollToOption(option)
    })
  }

  //获取传入的数组和value,获取对应value的index
  const getValueIndex = (arr, value) => {
    //入股value不是对象,直接返回arr.indexOf(value)
    if (!isObject(value)) return arr.indexOf(value)

    //获取valueKey
    const valueKey = props.valueKey
    let index = -1
    arr.some((item, i) => {
      //如果找到对应item,使index = i 返回true 终止some
      if (toRaw(get(item, valueKey)) === get(value, valueKey)) {
        index = i
        return true
      }
      return false
    })
    //返回index
    return index
  }

  //软聚焦,只focus不其他
  const setSoftFocus = () => {
    states.softFocus = true
    //注释(用处未知)
    // const _input = input.value || reference.value
    // if (_input) {
    //   _input?.focus()
    // }
  }

  //滚动到当前option
  const scrollToOption = (option: number | any[]) => {
    const targetOption = Array.isArray(option) ? option[0] : option
    let target = null

    //设置target为对应option的node
    if (targetOption?.value) {
      const options = optionsArray.value.filter(
        (item) => item.value === targetOption.value
      )
      //如果在options中存在对应option,获取option节点
      if (options.length > 0) {
        target = options[0].$el
      }
    }

    if (tooltipRef.value && target) {
      const menu = tooltipRef.value?.popperRef?.contentRef?.querySelector?.(
        `.${ns.be('dropdown', 'wrap')}`
      )
      if (menu) {
        scrollIntoView(menu as HTMLElement, target)
      }
    }
    scrollbar.value?.handleScroll()
  }

  //创建option,每当option的创建时都会调用
  const onOptionCreate = (optionContext: UseOptionContext) => {
    states.optionsCount++
    states.filteredOptionsCount++
    states.options.set(optionContext.value, optionContext)
    states.cachedOptions.set(optionContext.value, optionContext)
  }

  //销毁option事件
  const onOptionDestroy = (optionContext: UseOptionContext) => {
    //如果options中存在
    if (states.options.get(optionContext.value) === optionContext) {
      states.optionsCount--
      states.filteredOptionsCount--
      states.options.delete(optionContext.value)
    }
  }

  const resetInputState = (e: KeyboardEvent) => {
    if (e.code !== EVENT_CODE.backspace) toggleLastOptionHitState(false)
    states.inputLength = input.value!.value.length * 15 + 20
    resetInputHeight()
  }

  const toggleLastOptionHitState = (hit?: boolean) => {
    if (!Array.isArray(states.selected)) return
    const option = states.selected[states.selected.length - 1]
    if (!option) return

    if (hit === true || hit === false) {
      option.hitState = hit
      return hit
    }

    option.hitState = !option.hitState
    return option.hitState
  }

  //输入合成事件
  const handleComposition = (e) => {
    const text = e.target.value
    //如果合成结束,设置isOnComposition = false,启用开始搜索,否则设置为true
    if (e.type === 'compositionend') {
      states.isOnComposition = false
      nextTick(() => handleQueryChange(text))
    } else {
      // const lastCharacter = text[text.length - 1] || ''
      // states.isOnComposition = !isKorean(lastCharacter)
      states.isOnComposition = true
    }
  }

  //滚动到已经选中的option
  const handleMenuEnter = () => {
    nextTick(() => scrollToOption(states.selected))
  }

  //聚焦事件
  const handleFocus = (event) => {
    //如果不是软聚焦
    if (!states.softFocus) {
      //如果未开启可过滤和自动显示下拉框
      if (props.automaticDropdown || props.filterable) {
        //如果可过滤以及下拉框处于隐藏状态,设置menuVisibleOnFocus = true
        if (props.filterable && !states.visible) {
          states.menuVisibleOnFocus = true
        }
        //显示下拉框
        states.visible = true
      }
      //触发聚焦事件
      ctx?.emit('focus', event)
    } else {
      states.softFocus = false
    }
  }

  const blur = () => {
    states.visible = false
    reference.value?.blur()
  }

  const handleBlur = (event: Event) => {
    nextTick(() => {
      if (states.isSilentBlur) {
        states.isSilentBlur = false
      } else {
        ctx?.emit('blur', event)
      }
    })
    states.softFocus = false
  }

  const handleClearClick = (event: Event) => {
    deleteSelected(event)
  }

  //关闭
  const handleClose = () => {
    states.visible = false
  }

  const handleKeydownEscape = (event) => {
    if (states.visible) {
      event.preventDefault()
      event.stopPropagation()
      states.visible = false
    }
  }

  //切换菜单
  const toggleMenu = () => {
    if (!selectDisabled.value) {
      if (states.menuVisibleOnFocus) {
        states.menuVisibleOnFocus = false
      } else {
        states.visible = !states.visible
      }
      if (states.visible) {
        ;(input.value || reference.value)?.focus()
      }
    }
  }

  const selectOption = () => {
    //如果下拉框未显示,调用toggleMenu()
    if (!states.visible) {
      toggleMenu()
    } else {
      //选中hoverIndex对应的option
      if (optionsArray.value[states.hoverIndex]) {
        handleOptionSelect(optionsArray.value[states.hoverIndex], undefined)
      }
    }
  }

  //如果是对象get(item.value, props.valueKey),否则item.value
  const getValueKey = (item) => {
    return isObject(item.value) ? get(item.value, props.valueKey) : item.value
  }

  const optionsAllDisabled = computed(() =>
    optionsArray.value
      .filter((option) => option.visible)
      .every((option) => option.disabled)
  )

  const navigateOptions = (direction) => {
    if (!states.visible) {
      states.visible = true
      return
    }
    if (states.options.size === 0 || states.filteredOptionsCount === 0) return
    if (states.isOnComposition) return

    if (!optionsAllDisabled.value) {
      if (direction === 'next') {
        states.hoverIndex++
        if (states.hoverIndex === states.options.size) {
          states.hoverIndex = 0
        }
      } else if (direction === 'prev') {
        states.hoverIndex--
        if (states.hoverIndex < 0) {
          states.hoverIndex = states.options.size - 1
        }
      }
      const option = optionsArray.value[states.hoverIndex]
      if (
        option.disabled === true ||
        option.states.groupDisabled === true ||
        !option.visible
      ) {
        navigateOptions(direction)
      }
      nextTick(() => scrollToOption(hoverOption.value))
    }
  }

  return {
    optionsArray,
    selectSize,
    handleResize,
    debouncedOnInputChange,
    debouncedQueryChange,
    deletePrevTag,
    deleteTag,
    deleteSelected,
    handleOptionSelect,
    scrollToOption,
    readonly,
    resetInputHeight,
    showClose,
    iconComponent,
    iconReverse,
    showNewOption,
    collapseTagSize,
    setSelected,
    managePlaceholder,
    selectDisabled,
    emptyText,
    toggleLastOptionHitState,
    resetInputState,
    handleComposition,
    onOptionCreate,
    onOptionDestroy,
    handleMenuEnter,
    handleFocus,
    blur,
    handleBlur,
    handleClearClick,
    handleClose,
    handleKeydownEscape,
    toggleMenu,
    selectOption,
    getValueKey,
    navigateOptions,
    dropMenuVisible,
    queryChange,
    groupQueryChange,
    reference,
    input,
    tooltipRef,
    tags,
    selectWrapper,
    scrollbar,
  }
}
