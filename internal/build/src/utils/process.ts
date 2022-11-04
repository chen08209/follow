import { spawn } from 'child_process'
import chalk from 'chalk'
import consola from 'consola'
import { projRoot } from '@follow-ui/build-utils'

//运行
export const run = async (command: string, cwd: string = projRoot) =>
  new Promise<void>((resolve, reject) => {
    const [cmd, ...args] = command.split(' ')
    consola.info(`run: ${chalk.green(`${cmd} ${args.join(' ')}`)}`)
    /**
     * 执行命令行
     * cmd 命令
     * args 参数
     * cwd 执行路径
     * shell 是否运行在win平台上
     */
    const app = spawn(cmd, args, {
      cwd,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    })

    //退出时调用,杀死程序
    const onProcessExit = () => app.kill('SIGHUP')

    //进程关闭事件
    app.on('close', (code) => {
      //取消exit的监听
      process.removeListener('exit', onProcessExit)
      if (code === 0) resolve()
      else
        reject(
          new Error(`Command failed. \n Command: ${command} \n Code: ${code}`)
        )
    })

    //监听退出事件
    process.on('exit', onProcessExit)
  })
