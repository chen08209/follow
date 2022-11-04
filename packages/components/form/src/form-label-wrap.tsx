import {
  Fragment,
  computed,
  defineComponent,
  inject,
  nextTick,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  ref,
  watch,
} from 'vue'
import { useResizeObserver } from '@vueuse/core'
import { throwError } from '@follow-ui/utils'
import { formContextKey, formItemContextKey } from '@follow-ui/tokens'
import { useNamespace } from '@follow-ui/hooks'

import type { CSSProperties } from 'vue'

const COMPONENT_NAME = 'FlLabelWrap'
export default defineComponent({
  name: COMPONENT_NAME,
  props: {
    //自动设置宽度
    isAutoWidth: Boolean,
    //是否更新所有
    updateAll: Boolean,
  },

  setup(props, { slots }) {
    const formContext = inject(formContextKey, undefined)
    const formItemContext = inject(formItemContextKey)
    //如果没有formItemContext,报错
    if (!formItemContext)
      throwError(
        COMPONENT_NAME,
        'usage: <fl-form-item><label-wrap /></fl-form-item>'
      )

    const ns = useNamespace('form')

    const el = ref<HTMLElement>()

    //计算宽度
    const computedWidth = ref(0)

    //获取label宽度
    const getLabelWidth = () => {
      //判断是否有第一个子元素
      if (el.value?.firstElementChild) {
        //获取第一个子元素的宽度
        const width = window.getComputedStyle(el.value.firstElementChild).width
        //获取大于等于width的最小整数
        return Math.ceil(Number.parseFloat(width))
      } else {
        return 0
      }
    }

    //更新lable宽度
    const updateLabelWidth = (action: 'update' | 'remove' = 'update') => {
      nextTick(() => {
        //如果有默认插槽,且自动设置宽度
        if (slots.default && props.isAutoWidth) {
          /* 当action 为 update时,设置computedWidth为getLabelWidth(),
          否则调用deregisterLabelWidth()computedWidth.value */
          if (action === 'update') {
            computedWidth.value = getLabelWidth()
          } else if (action === 'remove') {
            //移除宽度
            formContext?.deregisterLabelWidth(computedWidth.value)
          }
        }
      })
    }
    //调用updateLabelWidth
    const updateLabelWidthFn = () => updateLabelWidth('update')

    //挂载阶段,调用updateLabelWidth('update')
    onMounted(() => {
      updateLabelWidthFn()
    })

    //卸载时执行updateLabelWidth('remove')
    onBeforeUnmount(() => {
      updateLabelWidth('remove')
    })

    //更新时执行updateLabelWidth('update')
    onUpdated(() => updateLabelWidthFn())

    //监听computedWidth,如果要更新所有,调用registerLabelWidth()
    watch(computedWidth, (val, oldVal) => {
      if (props.updateAll) {
        //注册宽度
        formContext?.registerLabelWidth(val, oldVal)
      }
    })

    //监听registerLabelWidth,调用updateLabelWidth('update')
    useResizeObserver(
      computed(
        () => (el.value?.firstElementChild ?? null) as HTMLElement | null
      ),
      updateLabelWidthFn
    )

    //返回template
    return () => {
      if (!slots) return null

      const { isAutoWidth } = props

      //如果自动宽度
      if (isAutoWidth) {
        //获取autoLabelWidth
        const autoLabelWidth = formContext?.autoLabelWidth
        //获取hasLabel,判断是否有label
        const hasLabel = formItemContext?.hasLabel
        //定义初始化样式对象
        const style: CSSProperties = {}

        //设置label的margin
        if (hasLabel && autoLabelWidth && autoLabelWidth !== 'auto') {
          /* 设置marginWideth为 0 
          与 Number.parseInt(autoLabelWidth, 10) - computedWidth.value间最大值 */
          const marginWidth = Math.max(
            0,
            Number.parseInt(autoLabelWidth, 10) - computedWidth.value
          )
          //如果label在左设置为右,否则在左
          const marginPosition =
            formContext.labelPosition === 'left' ? 'marginRight' : 'marginLeft'
          //设置css中指定margin  
          if (marginWidth) {
            style[marginPosition] = `${marginWidth}px`
          }
        }
        //返回编译后的html
        return (
          <div ref={el} class={[ns.be('item', 'label-wrap')]} style={style}>
            {slots.default?.()}
          </div>
        )
      } else {
        return <Fragment ref={el}>{slots.default?.()}</Fragment>
      }
    }
  },
})
