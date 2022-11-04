export type FocusLayer = {
  paused: boolean

  //暂停
  pause: () => void

  //开始
  resume: () => void
}

export type FocusStack = FocusLayer[]

//获取当前节点可tabbable的元素数组边界
export const getEdges = (container: HTMLElement) => {
  const focusable = obtainAllFocusableElements(container)
  const first = getVisibleElement(focusable, container)
  const last = getVisibleElement(focusable.reverse(), container)
  return [first, last]
}

//获取当前节点下可tabbable的元素数组
export const obtainAllFocusableElements = (
  element: HTMLElement
): HTMLElement[] => {
  const nodes: HTMLElement[] = []
  /**
   * 遍历一下所有元素节点,用acceptNode函数缩小范围
   * NodeFilter.FILTER_ACCEPT,通过
   * NodeFilter.FILTER_SKIP,跳过当前节点,继续查找子节点
   * NodeFilter.FILTER_REJECT,跳过当前节点及其子节点
   */
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (
      node: Element & {
        disabled: boolean
        hidden: boolean
        type: string
        tabIndex: number
      }
    ) => {
      const isHiddenInput = node.tagName === 'INPUT' && node.type === 'hidden'
      //如果node时disabled或者hidden或者是isHiddenInput,则跳过
      if (node.disabled || node.hidden || isHiddenInput) {
        return NodeFilter.FILTER_SKIP
      } else {
        //如果元素可通过tab键导航或者node === document.activeElement,则通过,否则跳过
        return node.tabIndex >= 0 || node === document.activeElement
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_SKIP
      }
    },
  })
  while (walker.nextNode()) {
    nodes.push(walker.currentNode as HTMLElement)
  }

  return nodes
}

//获取第一个可见的元素
export const getVisibleElement = (
  elements: HTMLElement[],
  container: HTMLElement
) => {
  for (const element of elements) {
    if (!isHidden(element, container)) return element
  }
}

//判断是否隐藏
export const isHidden = (element: HTMLElement, container: HTMLElement) => {
  if (process.env.NODE_ENV === 'test') return false

  if (getComputedStyle(element).visibility === 'hidden') return true

  while (element) {
    if (container && element === container) return false
    if (getComputedStyle(element).display === 'none') return true
    element = element.parentElement as HTMLElement
  }

  return false
}

//判断是否可选中
const isSelectable = (
  element: any
): element is HTMLInputElement & { select: () => void } => {
  return element instanceof HTMLInputElement && 'select' in element
}

//focus并阻止发生滚动，当shouldSelect= true时, 如果目标可以被select，则select
export const tryFocus = (
  element?: HTMLElement | { focus: () => void } | null,
  shouldSelect?: boolean
) => {
  //如果元素存在而且元素已经focus
  if (element && element.focus) {
    const prevFocusedElement = document.activeElement
    //阻止元素聚焦时发生滚动，默认{ preventScroll: false }
    element.focus({ preventScroll: true })

    //如果shouldSelect == true，element不是当前activeElement,element可选中,则调用select()
    if (
      element !== prevFocusedElement &&
      isSelectable(element) &&
      shouldSelect
    ) {
      element.select()
    }
  }
}

//聚焦后裔
export const focusFirstDescendant = (
  elements: HTMLElement[],
  shouldSelect = false
) => {
  const prevFocusedElement = document.activeElement

  for (const element of elements) {
    tryFocus(element, shouldSelect)

    //如果聚焦成功,终止
    if (document.activeElement !== prevFocusedElement) return
  }
}

//移除指定数据
function removeFromStack<T>(list: T[], item: T) {
  //赋值list数组
  const copy = [...list]

  //找到item位置
  const idx = list.indexOf(item)

  //如果找到，移除当前item
  if (idx !== -1) {
    copy.splice(idx, 1)
  }

  return copy
}

const createFocusableStack = () => {
  let stack = [] as FocusStack

  //推送
  const push = (layer: FocusLayer) => {
    const currentLayer = stack[0]

    //如果当前layer不等于传入的layer，当前的栈暂停
    if (currentLayer && layer !== currentLayer) {
      currentLayer.pause()
    }

    //如果栈中有当前layer则移除
    stack = removeFromStack(stack, layer)

    //添加到数组开头
    stack.unshift(layer)
  }

  //移除
  const remove = (layer: FocusLayer) => {
    stack = removeFromStack(stack, layer)
    stack[0]?.resume?.()
  }

  return {
    push,
    remove,
  }
}

//可focus的栈
export const focusableStack = createFocusableStack()
