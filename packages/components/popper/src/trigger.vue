<template>
  <fl-only-child
    v-if="!virtualTriggering"
    v-bind="$attrs"
    :aria-controls="ariaControls"
    :aria-describedby="ariaDescribedby"
    :aria-expanded="ariaExpanded"
    :aria-haspopup="ariaHaspopup"
  >
    <slot />
  </fl-only-child>
</template>

<script setup lang="ts">
// @ts-nocheck
import { computed, inject, onBeforeUnmount, onMounted, watch } from 'vue'
import { isNil } from 'lodash-unified'
import { POPPER_INJECTION_KEY } from '@follow-ui/tokens/popper'
import { useForwardRef } from '@follow-ui/hooks'
import { unrefElement } from '@vueuse/core'
import { isElement } from '@follow-ui/utils'
import { FlOnlyChild } from '../../slot'
import { popperTriggerProps } from './ts'

import type { WatchStopHandle } from 'vue'

defineOptions({
  name: 'FlPopperTrigger',
  inheritAttrs: false,
})

const props = defineProps(popperTriggerProps)

const { role, triggerRef } = inject(POPPER_INJECTION_KEY)

//发送ref到OnlyChild中使用,用于triggerRef赋值
useForwardRef(triggerRef)

/**
 * ariaControls, ariaDescribedby, ariaHaspopup, ariaExpanded
 * 无障碍相关功能
 */
const ariaControls = computed<string | undefined>(() => {
  return ariaHaspopup.value ? props.id : undefined
})

const ariaDescribedby = computed<string | undefined>(() => {
  if (role && role.value === 'tooltip') {
    return props.open && props.id ? props.id : undefined
  }
  return undefined
})

const ariaHaspopup = computed<string | undefined>(() => {
  if (role && role.value !== 'tooltip') {
    return role.value
  }
  return undefined
})

const ariaExpanded = computed<string | undefined>(() => {
  return ariaHaspopup.value ? `${props.open}` : undefined
})

let virtualTriggerAriaStopWatch: WatchStopHandle | undefined = undefined

//挂载阶段, 监听virtualRef,triggerRef
onMounted(() => {
  //监听props.virtualRef
  watch(
    () => props.virtualRef,
    (virtualEl) => {
      if (virtualEl) {
        triggerRef.value = unrefElement(virtualEl as HTMLElement)
      }
    },
    {
      immediate: true,
    }
  )

  //监听triggerRef.value
  watch(
    () => triggerRef.value,
    (el, prevEl) => {
      virtualTriggerAriaStopWatch?.()
      virtualTriggerAriaStopWatch = undefined

      if (isElement(el)) {
        ;[
          'onMouseenter',
          'onMouseleave',
          'onClick',
          'onKeydown',
          'onFocus',
          'onBlur',
          'onContextmenu',
        ].forEach((eventName) => {
          const handler = props[eventName]

          if (handler) {
            //添加新的监听器
            ;(el as HTMLElement).addEventListener(
              eventName.slice(2).toLowerCase(),
              handler
            )

            //移除旧的监听器
            ;(prevEl as HTMLElement)?.removeEventListener?.(
              eventName.slice(2).toLowerCase(),
              handler
            )
          }
        })

        //以下是无障碍相关功能
        virtualTriggerAriaStopWatch = watch(
          [ariaControls, ariaDescribedby, ariaHaspopup, ariaExpanded],
          (watches) => {
            ;[
              'aria-controls',
              'aria-describedby',
              'aria-haspopup',
              'aria-expanded',
            ].forEach((key, idx) => {
              isNil(watches[idx])
                ? el.removeAttribute(key)
                : el.setAttribute(key, watches[idx]!)
            })
          },
          { immediate: true }
        )
      }

      if (isElement(prevEl)) {
        ;[
          'aria-controls',
          'aria-describedby',
          'aria-haspopup',
          'aria-expanded',
        ].forEach((key) => prevEl.removeAttribute(key))
      }
    },
    {
      immediate: true,
    }
  )
})

//卸载阶段, 停用无障碍的监听
onBeforeUnmount(() => {
  virtualTriggerAriaStopWatch?.()
  virtualTriggerAriaStopWatch = undefined
})

defineExpose({
  /**
   * @description trigger element
   */
  triggerRef,
})
</script>
