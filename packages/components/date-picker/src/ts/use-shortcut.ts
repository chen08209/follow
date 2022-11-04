import { getCurrentInstance, useAttrs, useSlots } from 'vue'
import dayjs from 'dayjs'
import { isArray, isFunction } from '@follow-ui/utils'

import type { SetupContext } from 'vue'
import type { useLocale } from '@follow-ui/hooks'
import type { RangePickerSharedEmits } from './shared'
//shortcut类型
export type Shortcut = {
  text: string
  value: Date | (() => Date) | [Date, Date] | (() => [Date, Date])
  onClick?: (ctx: Omit<SetupContext<RangePickerSharedEmits>, 'expose'>) => void
}

//shortcut钩子
export const useShortcut = (lang: ReturnType<typeof useLocale>['lang']) => {
  const { emit } = getCurrentInstance()!
  const attrs = useAttrs()
  const slots = useSlots()

  const handleShortcutClick = (shortcut: Shortcut) => {
    const shortcutValue = isFunction(shortcut.value)
      ? shortcut.value()
      : shortcut.value

    if (shortcutValue) {
      if (isArray(shortcutValue)) {
        emit('pick', [
          dayjs(shortcutValue[0]).locale(lang.value),
          dayjs(shortcutValue[1]).locale(lang.value),
        ])
        return
      } else {
        emit('pick', dayjs(shortcutValue).locale(lang.value))
        return
      }
    }
    if (shortcut.onClick) {
      shortcut.onClick({
        attrs,
        slots,
        emit,
      })
    }
  }

  return handleShortcutClick
}
