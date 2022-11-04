import { PKG_NAME, PKG_PREFIX } from '@follow-ui/build-constants'
import { buildConfig } from '../build-info'

import type { Module } from '../build-info'

//路径重写
export const pathRewriter = (module: Module) => {
  const config = buildConfig[module]

  //返回函数
  return (id: string) => {
    //@follow-ui/theme-chalk => follow-ui/theme-chalk
    id = id.replaceAll(`${PKG_PREFIX}/theme-chalk`, `${PKG_NAME}/theme-chalk`)
    //@follow-ui => follow-ui/[esm, cjs]
    id = id.replaceAll(`${PKG_PREFIX}/`, `${config.bundle.path}/`)
    return id
  }
}
