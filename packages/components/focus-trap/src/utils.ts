import { FOCUSOUT_PREVENTED, FOCUSOUT_PREVENTED_OPTS } from '@follow-ui/tokens'
import { onBeforeUnmount, onMounted, ref } from 'vue'

//事件类型
const focusReason = ref<'pointer' | 'keyboard'>()
//用户最后聚焦时间戳
const lastUserFocusTimestamp = ref<number>(0)
//自动聚焦聚焦时间戳
const lastAutomatedFocusTimestamp = ref<number>(0)
let focusReasonUserCount = 0

export type FocusLayer = {
  paused: boolean
  pause: () => void
  resume: () => void
}

export type FocusStack = FocusLayer[]

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
      if (node.disabled || node.hidden || isHiddenInput)
        return NodeFilter.FILTER_SKIP
      //如果元素可通过tab键导航或者node === document.activeElement,则通过,否则跳过
      return node.tabIndex >= 0 || node === document.activeElement
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_SKIP
    },
  })
  while (walker.nextNode()) nodes.push(walker.currentNode as HTMLElement)

  return nodes
}

export const getVisibleElement = (
  elements: HTMLElement[],
  container: HTMLElement
) => {
  for (const element of elements) {
    if (!isHidden(element, container)) return element
  }
}

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

export const getEdges = (container: HTMLElement) => {
  const focusable = obtainAllFocusableElements(container)
  const first = getVisibleElement(focusable, container)
  const last = getVisibleElement(focusable.reverse(), container)
  return [first, last]
}

//判断是否可选
const isSelectable = (
  element: any
): element is HTMLInputElement & { select: () => void } => {
  return element instanceof HTMLInputElement && 'select' in element
}

//尝试focus
export const tryFocus = (
  element?: HTMLElement | { focus: () => void } | null,
  shouldSelect?: boolean
) => {
  if (element && element.focus) {
    const prevFocusedElement = document.activeElement
    element.focus({ preventScroll: true })
    lastAutomatedFocusTimestamp.value = window.performance.now()

    //如果目标可选中,选中
    if (
      element !== prevFocusedElement &&
      isSelectable(element) &&
      shouldSelect
    ) {
      element.select()
    }
  }
}

function removeFromStack<T>(list: T[], item: T) {
  const copy = [...list]

  const idx = list.indexOf(item)

  if (idx !== -1) {
    copy.splice(idx, 1)
  }
  return copy
}

//创建可聚焦栈
const createFocusableStack = () => {
  let stack = [] as FocusStack

  const push = (layer: FocusLayer) => {
    const currentLayer = stack[0]

    //如果当前layer不等于传入的layer，当前的栈暂停
    if (currentLayer && layer !== currentLayer) {
      currentLayer.pause()
    }

    //如果栈中有当前layer则移除
    stack = removeFromStack(stack, layer)

    //添加到数组开头(栈顶)
    stack.unshift(layer)
  }

  //移除栈顶元素
  const remove = (layer: FocusLayer) => {
    stack = removeFromStack(stack, layer)
    stack[0]?.resume?.()
  }

  return {
    push,
    remove,
  }
}

//聚焦第一个可聚焦的子元素
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

export const focusableStack = createFocusableStack()

//判断是否由用户引起
export const isFocusCausedByUserEvent = (): boolean => {
  return lastUserFocusTimestamp.value > lastAutomatedFocusTimestamp.value
}

const notifyFocusReasonPointer = () => {
  focusReason.value = 'pointer'
  lastUserFocusTimestamp.value = window.performance.now()
}

const notifyFocusReasonKeydown = () => {
  focusReason.value = 'keyboard'
  lastUserFocusTimestamp.value = window.performance.now()
}

export const useFocusReason = (): {
  focusReason: typeof focusReason
  lastUserFocusTimestamp: typeof lastUserFocusTimestamp
  lastAutomatedFocusTimestamp: typeof lastAutomatedFocusTimestamp
} => {
  onMounted(() => {
    if (focusReasonUserCount === 0) {
      document.addEventListener('mousedown', notifyFocusReasonPointer)
      document.addEventListener('touchstart', notifyFocusReasonPointer)
      document.addEventListener('keydown', notifyFocusReasonKeydown)
    }
    focusReasonUserCount++
  })

  onBeforeUnmount(() => {
    focusReasonUserCount--
    if (focusReasonUserCount <= 0) {
      document.removeEventListener('mousedown', notifyFocusReasonPointer)
      document.removeEventListener('touchstart', notifyFocusReasonPointer)
      document.removeEventListener('keydown', notifyFocusReasonKeydown)
    }
  })

  return {
    focusReason,
    lastUserFocusTimestamp,
    lastAutomatedFocusTimestamp,
  }
}

//创建FocusOut注释事件
export const createFocusOutPreventedEvent = (
  detail: CustomEventInit['detail']
) => {
  return new CustomEvent(FOCUSOUT_PREVENTED, {
    ...FOCUSOUT_PREVENTED_OPTS,
    detail,
  })
}
