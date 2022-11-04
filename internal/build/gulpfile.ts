import path from 'path'
import { copyFile, mkdir } from 'fs/promises'
import { copy } from 'fs-extra'
import { parallel, series } from 'gulp'
import {
  buildOutput,
  flOutput,
  flPackage,
  projRoot,
} from '@follow-ui/build-utils'
import { buildConfig, run, runTask, withTaskName } from './src'
import type { TaskFunction } from 'gulp'
import type { Module } from './src'

export const copyFiles = () =>
  Promise.all([
    copyFile(flPackage, path.join(flOutput, 'package.json')),
    copyFile(
      path.resolve(projRoot, 'README.md'),
      path.resolve(flOutput, 'README.md')
    ),
    copyFile(
      path.resolve(projRoot, 'global.d.ts'),
      path.resolve(flOutput, 'global.d.ts')
    ),
  ])

//复制dts文件
export const copyTypesDefinitions: TaskFunction = (done) => {
  //复制dist/types/packages下的声明文件
  const src = path.resolve(buildOutput, 'types', 'packages')

  //复制类型
  const copyTypes = (module: Module) =>
    withTaskName(`copyTypes:${module}`, () =>
      //复制src下的文件到buildConfig[module].output.path
      copy(src, buildConfig[module].output.path, { recursive: true })
    )

  //调用两次copyTypes,分别复制到esm和cjs双风格目录下
  return parallel(copyTypes('esm'), copyTypes('cjs'))(done)
}

//复制样式
export const copyFullStyle = async () => {
  //创建空文件夹
  await mkdir(path.resolve(flOutput, 'dist'), { recursive: true })
  //复制theme-chalk/index.css => dist/index.css
  await copyFile(
    path.resolve(flOutput, 'theme-chalk/index.css'),
    path.resolve(flOutput, 'dist/index.css')
  )
}

const taskFunction: TaskFunction = series(
  withTaskName('clean', () => run('pnpm run clean')),
  withTaskName('createOutput', () => mkdir(flOutput, { recursive: true })),
  parallel(
    runTask('buildModules'),
    runTask('buildFullBundle'),
    runTask('generateTypesDefinitions'),
    series(
      withTaskName('buildThemeChalk', () =>
        run('pnpm run -C packages/theme-chalk build')
      ),
      copyFullStyle
    )
  ),
  parallel(copyTypesDefinitions, copyFiles)
)

export default taskFunction

export * from './src'
