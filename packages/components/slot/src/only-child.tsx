import {
  Comment,
  Fragment,
  Text,
  cloneVNode,
  defineComponent,
  inject,
  withDirectives,
} from 'vue'

import { NOOP, isObject } from '@vue/shared'

import { debugWarn } from '@follow-ui/utils'
import {
  FORWARD_REF_INJECTION_KEY,
  useForwardRefDirective,
  useNamespace,
} from '@follow-ui/hooks'
import type { Ref, VNode } from 'vue'

const NAME = 'FlOnlyChild'

export const OnlyChild = defineComponent({
  name: NAME,
  setup(_, { slots, attrs }) {
    //来自forward hook
    const forwardRefInjection = inject(FORWARD_REF_INJECTION_KEY)

    //如果有setForwardRef，返回,否则返回NOOP空函数
    const forwardRefDirective = useForwardRefDirective(
      forwardRefInjection?.setForwardRef ?? NOOP
    )

    return () => {
      const defaultSlot = slots.default?.()

      if (!defaultSlot) return null

      //如果defaultSlot.length > 1,报错并return
      if (defaultSlot.length > 1) {
        debugWarn(NAME, 'requires exact only one valid child.')
        return null
      }

      //找到第一个真实的Node,如果时text用span包装
      const firstLegitNode = findFirstLegitChild(defaultSlot)

      if (!firstLegitNode) {
        debugWarn(NAME, 'no valid child node found')
        return null
      }

      //返回VNode,用VNode绑定directive
      return withDirectives(cloneVNode(firstLegitNode, attrs), [
        [forwardRefDirective],
      ])
    }
  },
})

function findFirstLegitChild(node: VNode[] | undefined): VNode | null {
  //如果没有node return;
  if (!node) return null

  const children = node as VNode[]

  for (const child of children) {
    if (isObject(child)) {
      switch (child.type) {
        case Comment: //注释
          continue
        case Text: //文本
        case 'svg': //svg
          return wrapTextContent(child)
        case Fragment: //片段
          return findFirstLegitChild(child.children as VNode[])
        default:
          return child
      }
    }
    return wrapTextContent(child)
  }

  return null
}

//用span包装文本内容
function wrapTextContent(s: string | VNode) {
  const ns = useNamespace('only-child')
  return <span class={ns.e('content')}>{s}</span>
}

export type OnlyChildExpose = {
  forwardRef: Ref<HTMLElement>
}
