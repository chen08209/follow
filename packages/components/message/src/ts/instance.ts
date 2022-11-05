import { shallowReactive } from 'vue'
import type { ComponentInternalInstance, VNode } from 'vue'
import type { Mutable } from '@follow-ui/utils'
import type { MessageHandler, MessageProps } from './message'

export type MessageContext = {
  id: string
  vnode: VNode
  handler: MessageHandler
  vm: ComponentInternalInstance
  props: Mutable<MessageProps>
}

//消息数组
export const instances: MessageContext[] = shallowReactive([])

export const getInstance = (id: string) => {
  //获取当前元素的index
  const idx = instances.findIndex((instance) => instance.id === id)
  //找到但当前元素
  const current = instances[idx]
  let prev: MessageContext | undefined
  //当idx大于0s时获取上一个元素
  if (idx > 0) {
    prev = instances[idx - 1]
  }
  return { current, prev }
}

//获取最后一个偏移量
export const getLastOffset = (id: string): number => {
  const { prev } = getInstance(id)
  if (!prev) return 0
  return prev.vm.exposed!.bottom.value
}
