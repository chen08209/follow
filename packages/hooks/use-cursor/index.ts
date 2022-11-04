import { ref } from 'vue'

import type { ShallowRef } from 'vue'

//保证输入字符光标不错乱
export function useCursor(
  input: ShallowRef<HTMLInputElement | undefined>
): [() => void, () => void] {
  const selectionRef = ref<{
    selectionStart?: number
    selectionEnd?: number
    value?: string
    beforeTxt?: string
    afterTxt?: string
  }>()

  function recordCursor() {
    if (input.value == undefined) return

    const { selectionStart, selectionEnd, value } = input.value

    if (selectionStart == null || selectionEnd == null) return

    //截取光标前的Txt
    const beforeTxt = value.slice(0, Math.max(0, selectionStart))

    //截取光标后的Txt
    const afterTxt = value.slice(Math.max(0, selectionEnd))

    selectionRef.value = {
      selectionStart,
      selectionEnd,
      value,
      beforeTxt,
      afterTxt,
    }
  }

  function setCursor() {
    if (input.value == undefined || selectionRef.value == undefined) return

    const { value } = input.value

    const { beforeTxt, afterTxt, selectionStart } = selectionRef.value

    if (
      beforeTxt == undefined ||
      afterTxt == undefined ||
      selectionStart == undefined
    )
      return

    let startPos = value.length
    /**
     * 如果value的结尾是afterTxt,则光标指向value.length - afterTxt.length
     * 否则判断value的开始是否是beforeTxt,成立则光标指向beforeTxt.length
     * 不然则找到beforeTxt的最后一个字符,然后从光标前一个位置开始寻找字符第一次出现的位置(如果输入前后两次字符一样会出现bug)
     */
    if (value.endsWith(afterTxt)) {
      startPos = value.length - afterTxt.length
    } else if (value.startsWith(beforeTxt)) {
      startPos = beforeTxt.length
    } else {
      const beforeLastChar = beforeTxt[selectionStart - 1]
      const newIndex = value.indexOf(beforeLastChar, selectionStart - 1)

      if (newIndex !== -1) {
        startPos = newIndex + 1
      }
    }

    input.value.setSelectionRange(startPos, startPos)
  }

  return [recordCursor, setCursor]
}
