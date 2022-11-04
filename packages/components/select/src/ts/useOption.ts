import { computed, getCurrentInstance, inject, toRaw, unref, watch } from 'vue'
import { get } from 'lodash-unified'
import { escapeStringRegexp } from '@follow-ui/utils'

import { selectGroupKey, selectKey, UseOptionContext } from '@follow-ui/tokens'
import type { QueryChangeCtx, SelectContext } from '@follow-ui/tokens'
import type { Ref } from 'vue'

export function useOption(props, states): UseOptionContext {
  const select = inject(selectKey) as SelectContext
  const selectGroup = inject(selectGroupKey, { disabled: false })

  //实例
  const instance = getCurrentInstance()

  //判断value是否是对象
  const isObject = computed(() => {
    return (
      Object.prototype.toString.call(props.value).toLowerCase() ===
      '[object object]'
    )
  })

  //是否选中
  const itemSelected = computed(() => {
    //如果不是多徐
    if (!select.props.multiple) {
      //判断是否相同
      return isEqual(props.value, select.props.modelValue)
    } else {
      //判断是否包含
      return contains(select.props.modelValue as any[], props.value)
    }
  })

  //多选条件下,是否到达可选择的极限
  const limitReached = computed(() => {
    if (select.props.multiple) {
      const modelValue = (select.props.modelValue || []) as unknown[]
      //如果当前未选中,且选中数量大于传入的最大选中数量(0则不限制)
      return (
        !itemSelected.value &&
        modelValue.length >= select.props.multipleLimit! &&
        select.props.multipleLimit! > 0
      )
    } else {
      return false
    }
  })

  //label,label存在返回label,否则判断value是否为对象,不是返回value,是返回''
  const currentLabel = computed(() => {
    return props.label || (isObject.value ? '' : props.value)
  })

  //value,优先级value => label => ''
  const currentValue = computed(() => {
    return props.value || props.label || ''
  })

  //是否失效
  const isDisabled = computed(() => {
    return props.disabled || states.groupDisabled || limitReached.value
  })

  //是否包含
  const contains = (arr: any[] = [], target: any) => {
    if (!isObject.value) {
      return arr && arr.includes(target)
    } else {
      const valueKey = select.props.valueKey
      return (
        arr &&
        arr.some((item) => {
          return toRaw(get(item, valueKey!)) === get(target, valueKey!)
        })
      )
    }
  }

  //是否相同
  const isEqual = (a, b) => {
    if (!isObject.value) {
      return a === b
    } else {
      const { valueKey } = select.props
      return get(a, valueKey!) === get(b, valueKey!)
    }
  }

  //设置悬停
  const hoverItem = () => {
    //如果不是disable,设置hoverIndex为当前选项
    if (!props.disabled && !selectGroup.disabled) {
      select.hoverIndex = select.optionsArray.indexOf(instance?.proxy)
    }
  }

  //监听label
  watch(
    () => currentLabel.value,
    () => {
      if (!props.created && !select.props.remote) select.setSelected()
    }
  )

  //监听value
  watch(
    () => props.value,
    (val, oldVal) => {
      const { remote, valueKey } = select.props
      if (!props.created && !remote) {
        //如果是对象,且新旧值相等,return,否则调用setSelected()
        if (
          valueKey &&
          typeof val === 'object' &&
          typeof oldVal === 'object' &&
          val[valueKey] === oldVal[valueKey]
        ) {
          return
        }
        select.setSelected()
      }
    }
  )

  //监听selectGroup是否失效,设置groupDisabled
  watch(
    () => selectGroup.disabled,
    () => {
      states.groupDisabled = selectGroup.disabled
    },
    { immediate: true }
  )

  const { queryChange } = toRaw(select)

  //监听查询事件
  watch(queryChange, (changes: Ref<QueryChangeCtx>) => {
    //获取query
    const { query } = unref(changes)
    //生成正则,i模式匹配,escapeStringRegexp添加转义字符
    const regexp = new RegExp(escapeStringRegexp(query), 'i')
    //如果验证通过或者是新创建的时,设置visable为true
    states.visible = regexp.test(currentLabel.value) || props.created
    //如果不展示,过滤的选项数量--
    if (!states.visible) {
      select.filteredOptionsCount--
    }
  })

  return {
    ...props,
    select,
    currentLabel,
    currentValue,
    itemSelected,
    isDisabled,
    hoverItem,
  }
}
