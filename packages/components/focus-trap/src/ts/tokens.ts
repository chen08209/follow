import type { InjectionKey, Ref } from 'vue'

export const FOCUS_AFTER_TRAPPED = 'focus-trap.focus-after-trapped'
export const FOCUS_AFTER_RELEASED = 'focus-trap.focus-after-released'
export const FOCUS_AFTER_TRAPPED_OPTS: EventInit = {
  //是否可调用event.preventDefault()撤销
  cancelable: true,
  //是否冒泡到父节点
  bubbles: false,
}

export const ON_TRAP_FOCUS_EVT = 'focusAfterTrapped'
export const ON_RELEASE_FOCUS_EVT = 'focusAfterReleased'

export type FocusTrapInjectionContext = {
  focusTrapRef: Ref<HTMLElement | undefined>
  onKeydown: (e: KeyboardEvent) => void
}

export const FOCUS_TRAP_INJECTION_KEY: InjectionKey<FocusTrapInjectionContext> =
  Symbol('flFocusTrap')
