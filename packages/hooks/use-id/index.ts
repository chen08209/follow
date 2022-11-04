import { computed, inject, unref } from 'vue'
import { isClient } from '@vueuse/core'
import { debugWarn } from '@follow-ui/utils'
import { useGlobalConfig } from '../use-global-config'
import { defaultNamespace } from '../use-namespace'
import type { MaybeRef } from '@vueuse/core'
import type { InjectionKey, Ref } from 'vue'

export type ElIdInjectionContext = {
  prefix: number
  current: number
}

const defaultIdInjection = {
  prefix: Math.floor(Math.random() * 10000),
  current: 0,
}

export const ID_INJECTION_KEY: InjectionKey<ElIdInjectionContext> =
  Symbol('flIdInjection')

//给定确定的id
export const useId = (deterministicId?: MaybeRef<string>): Ref<string> => {
  const idInjection = inject(ID_INJECTION_KEY, defaultIdInjection)

  //如果是服务端
  if (!isClient && idInjection === defaultIdInjection) {
    debugWarn(
      'IdInjection',
      `Looks like you are using server rendering, you must provide a id provider to ensure the hydration process to be succeed
usage: app.provide(ID_INJECTION_KEY, {
  prefix: number,
  current: number,
})`
    )
  }

  const namespace = useGlobalConfig('namespace', defaultNamespace)

  return computed(
    () =>
      unref(deterministicId) ||
      `${namespace.value}-id-${idInjection.prefix}-${idInjection.current++}`
  )
}
