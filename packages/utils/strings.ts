export {
  camelize,
  capitalize,
  hyphenate,
  hyphenate as kebabCase, // alias
} from '@vue/shared'

//转义字符正则表达式
export const escapeStringRegexp = (string = '') =>
  string.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d')
