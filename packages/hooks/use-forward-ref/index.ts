import { provide } from 'vue'

import type { InjectionKey, ObjectDirective, Ref } from 'vue'

type ForwardRefSetter = <T>(el: T) => void

export type ForwardRefInjectionContext = {
  setForwardRef: ForwardRefSetter
}

//发送ref
export const FORWARD_REF_INJECTION_KEY: InjectionKey<ForwardRefInjectionContext> =
  Symbol('flForwardRef')

export const useForwardRef = <T>(forwardRef: Ref<T | null>) => {
  const setForwardRef = (el: T) => {
    forwardRef.value = el
  }

  provide(FORWARD_REF_INJECTION_KEY, {
    setForwardRef,
  })
}

export const useForwardRefDirective = (
  setForwardRef: ForwardRefSetter
): ObjectDirective => {
  return {
    //挂载阶段为传进来的ref复制
    mounted(el) {
      setForwardRef(el)
    },
    updated(el) {
      setForwardRef(el)
    },
    unmounted() {
      setForwardRef(null)
    },
  }
}
