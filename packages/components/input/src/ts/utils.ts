import { isNumber } from '@follow-ui/utils'

//隐藏的Textarea,用于计算传入文本域的高度
let hiddenTextarea: HTMLTextAreaElement | undefined = undefined

//hiddenTextarea样式
const HIDDEN_STYLE = `
  height:0 !important;
  visibility:hidden !important;
  overflow:hidden !important;
  position:absolute !important;
  z-index:-1000 !important;
  top:0 !important;
  right:0 !important;
`

//样式上下文, 从target上获取, 放入hiddenTextarea
const CONTEXT_STYLE = [
  'letter-spacing',
  'line-height',
  'padding-top',
  'padding-bottom',
  'font-family',
  'font-weight',
  'font-size',
  'text-rendering',
  'text-transform',
  'width',
  'text-indent',
  'padding-left',
  'padding-right',
  'border-width',
  'box-sizing',
]

type NodeStyle = {
  contextStyle: string
  boxSizing: string
  paddingSize: number
  borderSize: number
}

type TextAreaHeight = {
  height: string
  minHeight?: string
}

/**
 * 计算节点样式
 * @param targetElement 目标元素
 * parseFloat() 解析一个字符串，并返回一个浮点数。
 * 该函数指定字符串中的首个字符是否是数字。
 * 如果是，则对字符串进行解析，直到到达数字的末端为止，然后以数字返回该数字，而不是作为字符串。
 */
function calculateNodeStyling(targetElement: Element): NodeStyle {
  //获取目标元素CSSStyleDeclaration
  const style = window.getComputedStyle(targetElement)

  const boxSizing = style.getPropertyValue('box-sizing')

  //底部padding加顶部padding高度
  const paddingSize =
    Number.parseFloat(style.getPropertyValue('padding-bottom')) +
    Number.parseFloat(style.getPropertyValue('padding-top'))

  //底部边框加顶部边框高度
  const borderSize =
    Number.parseFloat(style.getPropertyValue('border-bottom-width')) +
    Number.parseFloat(style.getPropertyValue('border-top-width'))

  const contextStyle = CONTEXT_STYLE.map(
    (name) => `${name}:${style.getPropertyValue(name)}`
  ).join(';')

  return { contextStyle, paddingSize, borderSize, boxSizing }
}

/**
 * 计算文本域高度
 * @param targetElement 目标元素
 * @param minRows 最小行数
 * @param maxRows 最大行数
 * @return TextAreaHeight
 */
export function calcTextareaHeight(
  targetElement: HTMLTextAreaElement,
  minRows = 1,
  maxRows?: number
): TextAreaHeight {
  //如果不是隐藏的文本域, 在body下创建一个文本域
  if (!hiddenTextarea) {
    hiddenTextarea = document.createElement('textarea')
    document.body.appendChild(hiddenTextarea)
  }

  const { paddingSize, borderSize, boxSizing, contextStyle } =
    calculateNodeStyling(targetElement)

  //设置样式
  hiddenTextarea.setAttribute('style', `${contextStyle};${HIDDEN_STYLE}`)

  hiddenTextarea.value = targetElement.value || targetElement.placeholder || ''

  //包含内边距,不包含边框和外边距
  let height = hiddenTextarea.scrollHeight

  const result = {} as TextAreaHeight

  /**
   * 如果是border-box模型,实际高度为scrollHeight + borderSize
   * 如果是content-box模型,实际高度为scrollHeight - paddingSize
   */
  if (boxSizing === 'border-box') {
    height = height + borderSize
  } else if (boxSizing === 'content-box') {
    height = height - paddingSize
  }

  hiddenTextarea.value = ''

  //单排高度
  const singleRowHeight = hiddenTextarea.scrollHeight - paddingSize

  if (isNumber(minRows)) {
    let minHeight = singleRowHeight * minRows
    if (boxSizing === 'border-box') {
      minHeight = minHeight + paddingSize + borderSize
    }

    //如果minHeight > height, height = minHeight, 保证文本框的初始高度大于minHeight
    height = Math.max(minHeight, height)

    //设置最小高度
    result.minHeight = `${minHeight}px`
  }

  if (isNumber(maxRows)) {
    let maxHeight = singleRowHeight * maxRows
    if (boxSizing === 'border-box') {
      maxHeight = maxHeight + paddingSize + borderSize
    }

    //如果maxHeight < height, height = maxHeight,保证初始文本框的最大高度小于maxHeight
    height = Math.min(maxHeight, height)
  }

  result.height = `${height}px`
  hiddenTextarea.parentNode?.removeChild(hiddenTextarea)
  hiddenTextarea = undefined

  return result
}
