import { rollup } from 'rollup'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import VueMacros from 'unplugin-vue-macros/rollup'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import esbuild from 'rollup-plugin-esbuild'
import glob from 'fast-glob'
import { excludeFiles, flRoot, pkgRoot } from '@follow-ui/build-utils'
import { generateExternal, writeBundles } from '../utils'
import { FollowAlias } from '../plugins/follow-alias'
import { buildConfigEntries, target } from '../build-info'

import type { OutputOptions } from 'rollup'

export const buildModules = async () => {
  //导入package下所有js,ts,vue文件
  const input = excludeFiles(
    await glob('**/*.{js,ts,vue}', {
      cwd: pkgRoot,
      absolute: true,
      onlyFiles: true,
    })
  )
  const bundle = await rollup({
    input,
    plugins: [
      FollowAlias(),
      VueMacros({
        setupComponent: false,
        setupSFC: false,
        plugins: {
          vue: vue({
            isProduction: false,
          }),
          vueJsx: vueJsx(),
        },
      }),
      nodeResolve({
        extensions: ['.mjs', '.js', '.json', '.ts'],
      }),
      commonjs(),
      esbuild({
        sourceMap: true,
        target,
        loaders: {
          '.vue': 'ts',
        },
      }),
    ],
    external: await generateExternal({ full: false }),
    treeshake: false,
  })
  await writeBundles(
    bundle,
    buildConfigEntries.map(([module, config]): OutputOptions => {
      return {
        //风格
        format: config.format,
        //输出路径
        dir: config.output.path,
        //导出模式
        exports: module === 'cjs' ? 'named' : undefined,
        //是否保留模块
        preserveModules: true,
        //根目录
        preserveModulesRoot: flRoot,
        //是否创建sourcemap
        sourcemap: true,
        //后缀
        entryFileNames: `[name].${config.ext}`,
      }
    })
  )
}
