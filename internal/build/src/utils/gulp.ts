import { buildRoot } from '@follow-ui/build-utils'
import { run } from './process'
import type { TaskFunction } from 'gulp'

//在task上添加displayName属性
export const withTaskName = <T extends TaskFunction>(
  name: string,
  fn: T
): TaskFunction => Object.assign(fn, { displayName: name })

//运行指定函数
export const runTask = (name: string) =>
  withTaskName(`shellTask:${name}`, () =>
    run(`pnpm run start ${name}`, buildRoot)
  )
