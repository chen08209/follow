import { computed, unref } from 'vue'
import { useGlobalConfig } from '../use-global-config'

export const defaultNamespace = 'fl'
const statePrefix = 'is-'

const mod = (
  namespace: string,
  block: string,
  blockSuffix: string,
  element: string,
  modifier: string
) => {
  let cls = `${namespace}-${block}`
  if (blockSuffix) {
    cls += `-${blockSuffix}`
  }
  if (element) {
    cls += `__${element}`
  }
  if (modifier) {
    cls += `--${modifier}`
  }
  return cls
}
/**
 * block 默认元素名称
 * blockSuffix 元素后缀 -
 * element 元素包装 __
 * modifier 元素修饰 --
 * is 判断元素状态
 */
export const useNamespace = (block: string) => {
  const globalConfig = useGlobalConfig('namespace')

  const namespace = computed(() => globalConfig.value || defaultNamespace)

  const b = (blockSuffix = '') =>
    mod(unref(namespace), block, blockSuffix, '', '')

  const e = (element?: string) =>
    element ? mod(unref(namespace), block, '', element, '') : ''

  const m = (modifier?: string) =>
    modifier ? mod(unref(namespace), block, '', '', modifier) : ''

  const be = (blockSuffix?: string, element?: string) =>
    blockSuffix && element
      ? mod(unref(namespace), block, blockSuffix, element, '')
      : ''
  const bm = (blockSuffix?: string, modifier?: string) =>
    blockSuffix && modifier
      ? mod(unref(namespace), block, blockSuffix, '', modifier)
      : ''
  const em = (element?: string, modifier?: string) =>
    element && modifier
      ? mod(unref(namespace), block, '', element, modifier)
      : ''

  const is: {
    (name: string, state: boolean | undefined): string
    (name: string): string
  } = (name: string, ...args: [boolean | undefined] | []) => {
    const state = args.length >= 1 ? args[0] : true
    return name && state ? `${statePrefix}${name}` : ''
  }

  // 获取css var
  const cssVar = (object: Record<string, string>) => {
    const styles: Record<string, string> = {}
    for (const key in object) {
      if (object[key]) {
        styles[`--${namespace.value}-${key}`] = object[key]
      }
    }
    return styles
  }

  // 根据block, 获取css var
  const cssVarBlock = (object: Record<string, string>) => {
    const styles: Record<string, string> = {}
    for (const key in object) {
      if (object[key]) {
        styles[`--${namespace.value}-${block}-${key}`] = object[key]
      }
    }
    return styles
  }

  //根据name,获取css var
  const cssVarName = (name: string) => `--${namespace.value}-${name}`

  //根据block + name,获取css var
  const cssVarBlockName = (name: string) =>
    `--${namespace.value}-${block}-${name}`

  return {
    namespace,
    b,
    e,
    m,
    be,
    bm,
    em,
    is,
    cssVar,
    cssVarBlock,
    cssVarName,
    cssVarBlockName,
  }
}

export type UseNamespaceReturn = ReturnType<typeof useNamespace>
