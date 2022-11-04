import { computed, inject, ref, unref } from 'vue'
import { componentSizes } from '@follow-ui/constants'
import { formContextKey, formItemContextKey } from '@follow-ui/tokens'
import { buildProp } from '@follow-ui/utils'
import { useGlobalConfig } from '../use-global-config'
import { useProp } from '../use-prop'
import type { ComponentSize } from '@follow-ui/constants'
import type { MaybeRef } from '@vueuse/core'

export const useSizeProp = buildProp({
  type: String,
  values: componentSizes,
  required: false,
})

export const useSize = (
  fallback?: MaybeRef<ComponentSize | undefined>,
  ignore: Partial<Record<'prop' | 'form' | 'formItem' | 'global', boolean>> = {}
) => {
  const emptyRef = ref(undefined)

  /**
   * 获取当前组件size
   * 如果忽略prop,返回emptyRef,否则返回当前实例prop里的size
   */
  const size = ignore.prop ? emptyRef : useProp<ComponentSize>('size')

  /**
   * 获取全局配置的size
   * 如果忽略global,返回emptyRef,否则返回全局配置中的size
   */
  const globalConfig = ignore.global ? emptyRef : useGlobalConfig('size')

  /**
   * 获取表单的size
   * 如果忽略form,返回{ size: undefined },否则注入form上下文
   */
  const form = ignore.form
    ? { size: undefined }
    : inject(formContextKey, undefined)

  /**
   * 获取表单项的size
   * 如果忽略formItem,返回{ size: undefined },否则注入formItem上下文
   */
  const formItem = ignore.formItem
    ? { size: undefined }
    : inject(formItemContextKey, undefined)

  /**
   * 返回size,
   * 当前组件 > 回调 > 表单项 > 表单 > 全局配置
   * 默认为''
   */
  return computed(
    (): ComponentSize =>
      size.value ||
      unref(fallback) ||
      formItem?.size ||
      form?.size ||
      globalConfig.value ||
      ''
  )
}

export const useDisabled = (fallback?: MaybeRef<boolean | undefined>) => {
  //获取当前组件disabled
  const disabled = useProp<boolean>('disabled')
  //获取表单isabled
  const form = inject(formContextKey, undefined)
  //返回disabled 优先级: 当前组件 > 回调函数 > form,默认返回false
  return computed(
    () => disabled.value || unref(fallback) || form?.disabled || false
  )
}

export const useColor = (fallback?: MaybeRef<string | undefined>) => {
  const color = useProp<string>('color')
  return computed(() => color.value || unref(fallback) || undefined)
}
