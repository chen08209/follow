import { createVNode, render } from 'vue'
import { isClient } from '@vueuse/core'
import {
  debugWarn,
  isElement,
  isFunction,
  isNumber,
  isString,
  isVNode,
} from '@follow-ui/utils'
import { useZIndex } from '@follow-ui/hooks'
import { messageConfig } from '../../config-provider'
import type { AppContext } from 'vue'
import MessageConstructor from './message.vue'
import {
  Message,
  MessageContext,
  instances,
  MessageParams,
  MessageOptions,
  messageDefaults,
  MessageParamsNormalized,
  MessageHandler,
  MessageFn,
  messageTypes,
  messageType,
} from './ts'

//起始id
let seed = 1

//标准化选项
const normalizeOptions = (params?: MessageParams) => {
  /**
   * 当params不存在,或者是string,vnode,function时,
   * 设置message为params,
   * 否则设置options为params
   */
  const options: MessageOptions =
    !params || isString(params) || isVNode(params) || isFunction(params)
      ? { message: params }
      : params

  //覆盖默认值
  const normalized = {
    ...messageDefaults,
    ...options,
  }

  /**
   * 如果没有appendTo,返回body
   * 如果传入appendTo是string,且能查询到元素,设置appendTo为传入appendTo否者为body
   */
  if (!normalized.appendTo) {
    normalized.appendTo = document.body
  } else if (isString(normalized.appendTo)) {
    let appendTo = document.querySelector<HTMLElement>(normalized.appendTo)

    if (!isElement(appendTo)) {
      debugWarn(
        'FlMessage',
        'the appendTo option is not an HTMLElement. Falling back to document.body.'
      )
      appendTo = document.body
    }

    normalized.appendTo = appendTo
  }

  return normalized as MessageParamsNormalized
}

/**
 * 关闭message
 * @param instance 传入实例
 * 如果消息实例数组中存在传入实例,在instances移除当前实例,调用其上close方法
 */
const closeMessage = (instance: MessageContext) => {
  const idx = instances.indexOf(instance)
  if (idx === -1) return

  instances.splice(idx, 1)
  const { handler } = instance
  handler.close()
}

//创建message
const createMessage = (
  { appendTo, ...options }: MessageParamsNormalized,
  context?: AppContext | null
): MessageContext => {
  //获取下一个 zIndex
  const { nextZIndex } = useZIndex()

  //id
  const id = `message_${seed++}`

  //用户关闭事件
  const userOnClose = options.onClose

  //容器
  const container = document.createElement('div')

  //属性
  const props = {
    ...options,
    zIndex: nextZIndex() + options.zIndex,
    id,
    //关闭事件
    onClose: () => {
      userOnClose?.()
      closeMessage(instance)
    },
    //销毁事件
    onDestroy: () => {
      render(null, container)
    },
  }
  /**
   * 创建虚拟节点
   * MessageConstructor message组件
   * props 属性
   */

  const vnode = createVNode(
    MessageConstructor,
    props,
    isFunction(props.message) || isVNode(props.message)
      ? {
          default: isFunction(props.message)
            ? props.message
            : () => props.message,
        }
      : null
  )

  vnode.appContext = context || message._context

  //渲染
  render(vnode, container)

  //向appendTo(默认为body)添加子节点
  appendTo.appendChild(container.firstElementChild!)

  //获取组件实例
  const vm = vnode.component!

  //设置处理程序
  const handler: MessageHandler = {
    close: () => {
      //调用暴露的close方法
      vm.exposed!.visible.value = false
    },
  }

  //设置实例
  const instance: MessageContext = {
    id,
    vnode,
    vm,
    handler,
    props: (vnode.component as any).props,
  }

  return instance
}

const message: MessageFn &
  Partial<Message> & { _context: AppContext | null } = (
  options = {},
  context
) => {
  if (!isClient) return { close: () => undefined }

  if (isNumber(messageConfig.max) && instances.length >= messageConfig.max) {
    return { close: () => undefined }
  }

  //标准化选项
  const normalized = normalizeOptions(options)

  //如果是组且存在instances数组
  if (normalized.grouping && instances.length) {
    //折叠消息
    const instance = instances.find(
      ({ vnode: vm }) => vm.props?.message === normalized.message
    )
    if (instance) {
      instance.props.repeatNum += 1
      instance.props.type = normalized.type
      return instance.handler
    }
  }

  //创建message
  const instance = createMessage(normalized, context)

  //推送到实例数组中
  instances.push(instance)

  //返回handler
  return instance.handler
}

//message[type]方法
messageTypes.forEach((type) => {
  message[type] = (options = {}, appContext) => {
    const normalized = normalizeOptions(options)
    return message({ ...normalized, type }, appContext)
  }
})

/**
 * 批量关闭message
 * @param type message的类型
 * 如果没有type,关闭所有message
 * 否则关闭指定type的message
 */
const closeAll = (type?: messageType): void => {
  for (const instance of instances) {
    if (!type || type === instance.props.type) {
      instance.handler.close()
    }
  }
}

message.closeAll = closeAll
message._context = null

export default message as Message
