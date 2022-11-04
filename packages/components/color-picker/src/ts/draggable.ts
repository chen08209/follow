import { isClient } from '@vueuse/core'

//拖动flag, 防止重复
let isDragging = false

export interface DraggableOptions {
  //拖动事件
  drag?: (event: MouseEvent | TouchEvent) => void
  start?: (event: MouseEvent | TouchEvent) => void
  end?: (event: MouseEvent | TouchEvent) => void
}

//可拖动的
export const draggable = (element: HTMLElement, options: DraggableOptions) => {
  if (!isClient) return

  const moveFn = (event: MouseEvent | TouchEvent) => {
    options.drag?.(event)
  }

  //抬起事件
  const upFn = (event: MouseEvent | TouchEvent) => {
    document.removeEventListener('mousemove', moveFn)
    document.removeEventListener('mouseup', upFn)
    document.removeEventListener('touchmove', moveFn)
    document.removeEventListener('touchend', upFn)
    document.onselectstart = null
    document.ondragstart = null

    isDragging = false

    //触发结束事件
    options.end?.(event)
  }

  //按下事件
  const downFn = (event: MouseEvent | TouchEvent) => {
    //如果已在拖动中，返回
    if (isDragging) return
    event.preventDefault()
    // //取消默认选中事件
    document.onselectstart = () => false
    // //取消默认选中事件
    document.ondragstart = () => false
    //监听相关操作
    document.addEventListener('mousemove', moveFn)
    document.addEventListener('mouseup', upFn)
    document.addEventListener('touchmove', moveFn)
    document.addEventListener('touchend', upFn)

    isDragging = true

    //触发开始事件
    options.start?.(event)
  }

  //监听mousedown事件
  element.addEventListener('mousedown', downFn)
  //监听touchstart事件
  element.addEventListener('touchstart', downFn)
}
