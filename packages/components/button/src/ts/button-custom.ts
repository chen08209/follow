import { computed } from 'vue'
import { useDisabled, useNamespace } from '@follow-ui/hooks'
import { TinyColor } from '@ctrl/tinycolor'
import type { ButtonProps } from './button'

/**
 * 使传入颜色变暗
 * @param color 被变暗的颜色
 * @param amount 混合度
 *
 * @description
 * color.mix(color,amount),第一个参数为需要color,第二个参数是混合度
 */
export function darken(color: TinyColor, amount = 20) {
  return color.mix('#141414', amount).toString()
}

export function useButtonCustomStyle(props: ButtonProps) {
  const disabled = useDisabled()
  const ns = useNamespace('button')

  // calculate hover & active color by custom color
  // only work when custom color
  return computed(() => {
    let styles: Record<string, string> = {}

    const buttonColor = props.color

    if (buttonColor) {
      //创建TinyColor
      const color = new TinyColor(buttonColor)
      /**
       * 激活背景色
       * color.tint(),使当前颜色变亮
       * darken(),使当前颜色变暗
       */
      const activeBgColor = props.dark
        ? color.tint(20).toString()
        : darken(color, 20)

      //如果是plain
      if (props.plain) {
        const bgColor = props.dark
          ? darken(color, 90)
          : color.tint(90).toString()
        const borderColor = props.dark
          ? darken(color, 50)
          : color.tint(50).toString()
        styles = ns.cssVarBlock({
          'bg-color': bgColor,
          'text-color': buttonColor,
          'border-color': borderColor,
          'hover-text-color': buttonColor,
          'hover-bg-color': bgColor,
          'hover-border-color': buttonColor,
          'active-bg-color': bgColor,
          'active-text-color': buttonColor,
          'active-border-color': activeBgColor,
          'ripple-bg-color': borderColor,
        })
        if (disabled.value) {
          styles[ns.cssVarBlockName('disabled-bg-color')] = props.dark
            ? darken(color, 90)
            : color.tint(90).toString()
          styles[ns.cssVarBlockName('disabled-text-color')] = props.dark
            ? darken(color, 50)
            : color.tint(50).toString()
          styles[ns.cssVarBlockName('disabled-border-color')] = props.dark
            ? darken(color, 80)
            : color.tint(80).toString()
        }
      } else {
        const hoverBgColor = props.dark
          ? darken(color, 30)
          : color.tint(30).toString()
        const rippleBgColor = props.dark
          ? darken(color, 50)
          : color.tint(50).toString()
        const textColor = color.isDark()
          ? `var(${ns.cssVarName('color-white')})`
          : `var(${ns.cssVarName('color-black')})`
        styles = ns.cssVarBlock({
          'bg-color': buttonColor,
          'text-color': textColor,
          'border-color': buttonColor,
          'hover-bg-color': hoverBgColor,
          'hover-text-color': textColor,
          'hover-border-color': hoverBgColor,
          'active-bg-color': activeBgColor,
          'active-border-color': activeBgColor,
          'ripple-bg-color': rippleBgColor,
        })
        if (disabled.value) {
          const disabledButtonColor = props.dark
            ? darken(color, 50)
            : color.tint(50).toString()
          styles[ns.cssVarBlockName('disabled-bg-color')] = disabledButtonColor
          styles[ns.cssVarBlockName('disabled-text-color')] = props.dark
            ? 'rgba(255, 255, 255, 0.5)'
            : `var(${ns.cssVarName('color-white')})`
          styles[ns.cssVarBlockName('disabled-border-color')] =
            disabledButtonColor
        }
      }
    }

    return styles
  })
}
