import { isClient } from '@vueuse/core'
import { isElement } from '@follow-ui/utils'
import type {
  ComponentPublicInstance,
  DirectiveBinding,
  ObjectDirective,
} from 'vue'

type DocumentHandler = <T extends MouseEvent>(mouseup: T, mousedown: T) => void
type FlushList = Map<
  HTMLElement,
  {
    documentHandler: DocumentHandler
    bindingFn: (...args: unknown[]) => unknown
  }[]
>

const nodeList: FlushList = new Map()

let startClick: MouseEvent

//如果是浏览器环境,监听mousedown,mouseup,遍历nodeList执行documentHandler
if (isClient) {
  document.addEventListener('mousedown', (e: MouseEvent) => (startClick = e))
  document.addEventListener('mouseup', (e: MouseEvent) => {
    for (const handlers of nodeList.values()) {
      for (const { documentHandler } of handlers) {
        documentHandler(e as MouseEvent, startClick)
      }
    }
  })
}

//创建dom处理程序
function createDocumentHandler(
  el: HTMLElement,
  binding: DirectiveBinding
): DocumentHandler {
  //不包括
  let excludes: HTMLElement[] = []
  if (Array.isArray(binding.arg)) {
    excludes = binding.arg
  } else if (isElement(binding.arg)) {
    excludes.push(binding.arg as unknown as HTMLElement)
  }
  //返回函数
  return function (mouseup, mousedown) {
    //popper
    const popperRef = (
      binding.instance as ComponentPublicInstance<{
        popperRef: HTMLElement
      }>
    ).popperRef
    //弹起目标
    const mouseUpTarget = mouseup.target as Node
    //按下目标
    const mouseDownTarget = mousedown?.target as Node
    //是否形成边界
    const isBound = !binding || !binding.instance
    //目标是否存在
    const isTargetExists = !mouseUpTarget || !mouseDownTarget
    //目标是否在容器内
    const isContainedByEl =
      el.contains(mouseUpTarget) || el.contains(mouseDownTarget)
    //目标是否是容器本身
    const isSelf = el === mouseUpTarget
    //目标是否在排除的容器中
    const isTargetExcluded =
      (excludes.length &&
        excludes.some((item) => item?.contains(mouseUpTarget))) ||
      (excludes.length && excludes.includes(mouseDownTarget as HTMLElement))

    //目标是否在Popper中
    const isContainedByPopper =
      popperRef &&
      (popperRef.contains(mouseUpTarget) || popperRef.contains(mouseDownTarget))
    if (
      isBound ||
      isTargetExists ||
      isContainedByEl ||
      isSelf ||
      isTargetExcluded ||
      isContainedByPopper
    ) {
      return
    }
    binding.value(mouseup, mousedown)
  }
}

//点击外部
export const ClickOutside: ObjectDirective = {
  beforeMount(el: HTMLElement, binding: DirectiveBinding) {
    //如果nodeList中不存在当前el
    if (!nodeList.has(el)) {
      nodeList.set(el, [])
    }
    nodeList.get(el)!.push({
      documentHandler: createDocumentHandler(el, binding),
      bindingFn: binding.value,
    })
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    if (!nodeList.has(el)) {
      nodeList.set(el, [])
    }

    const handlers = nodeList.get(el)!

    //旧处理程序索引
    const oldHandlerIndex = handlers.findIndex(
      (item) => item.bindingFn === binding.oldValue
    )
    //新处理程序
    const newHandler = {
      documentHandler: createDocumentHandler(el, binding),
      bindingFn: binding.value,
    }

    //如果存在旧的处理程序,替换,否则添加
    if (oldHandlerIndex >= 0) {
      // replace the old handler to the new handler
      handlers.splice(oldHandlerIndex, 1, newHandler)
    } else {
      handlers.push(newHandler)
    }
  },
  unmounted(el: HTMLElement) {
    // remove all listeners when a component unmounted
    nodeList.delete(el)
  },
}
