import { computed, ref } from 'vue'
import { debugWarn, castArray } from '@follow-ui/utils'
import type { Arrayable } from '@follow-ui/utils'
import type { FormItemContext } from '@follow-ui/tokens'
import type { FormItemProp } from './form-item'

const SCOPE = 'FlForm'

//label宽度钩子
export function useFormLabelWidth() {
  //潜在的label宽度数组
  const potentialLabelWidthArr = ref<number[]>([])

  //自动宽度
  const autoLabelWidth = computed(() => {
    //如果没有潜在的宽度数组,返回0
    if (!potentialLabelWidthArr.value.length) return '0'
    //取最大值
    const max = Math.max(...potentialLabelWidthArr.value)
    return max ? `${max}px` : ''
  })

  //通过宽度获取对应index
  function getLabelWidthIndex(width: number) {
    //获取对应宽度的index
    const index = potentialLabelWidthArr.value.indexOf(width)
    //如果没有报错
    if (index === -1) {
      debugWarn(SCOPE, `unexpected width ${width}`)
    }
    return index
  }

  //注册label宽度
  function registerLabelWidth(val: number, oldVal: number) {
    //如果新值和旧值都存在
    if (val && oldVal) {
      //获取旧值的index
      const index = getLabelWidthIndex(oldVal)
      //取消旧值换成新值
      potentialLabelWidthArr.value.splice(index, 1, val)
    } else if (val) {
      //否者添加新值
      potentialLabelWidthArr.value.push(val)
    }
  }

  //取消label宽度
  function deregisterLabelWidth(val: number) {
    //获取index
    const index = getLabelWidthIndex(val)
    //如果index存在
    if (index > -1) {
      //删除对应index数据
      potentialLabelWidthArr.value.splice(index, 1)
    }
  }

  return {
    autoLabelWidth,
    registerLabelWidth,
    deregisterLabelWidth,
  }
}

//获取有效字段
export const filterFields = (
  fields: FormItemContext[],
  props: Arrayable<FormItemProp>
) => {
  //获取props数组
  const normalized = castArray(props)
  //如果大于0,获取normalized中存在对应field.prop的字段
  return normalized.length > 0
    ? fields.filter((field) => field.prop && normalized.includes(field.prop))
    : fields
}
