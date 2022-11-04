import { onBeforeMount } from 'vue'
import { isClient } from '@vueuse/core'
import { generateId } from '@follow-ui/utils'

let cachedContainer: HTMLElement

//随机Popper容器id
export const POPPER_CONTAINER_ID = `fl-popper-container-${generateId()}`

export const POPPER_CONTAINER_SELECTOR = `#${POPPER_CONTAINER_ID}`

//在body下面创建一个id为POPPER_CONTAINER_ID的容器
const createContainer = () => {
  const container = document.createElement('div')
  container.id = POPPER_CONTAINER_ID
  document.body.appendChild(container)
  return container
}

export const usePopperContainer = () => {
  onBeforeMount(() => {
    if (!isClient) return

    if (
      process.env.NODE_ENV === 'test' ||
      !cachedContainer ||
      !document.body.querySelector(POPPER_CONTAINER_SELECTOR)
    ) {
      cachedContainer = createContainer()
    }
  })
}
