import process from 'process'
import path from 'path'
import { mkdir, readFile, writeFile } from 'fs/promises'
import consola from 'consola'
import * as vueCompiler from 'vue/compiler-sfc'
import glob from 'fast-glob'
import chalk from 'chalk'
import { Project } from 'ts-morph'
import {
  buildOutput,
  excludeFiles,
  flRoot,
  pkgRoot,
  projRoot,
} from '@follow-ui/build-utils'
import { pathRewriter } from '../utils'
import type { CompilerOptions, SourceFile } from 'ts-morph'

//获取tsconfig
const TSCONFIG_PATH = path.resolve(projRoot, 'tsconfig.web.json')
//输出目录
const outDir = path.resolve(buildOutput, 'types')

export const generateTypesDefinitions = async () => {
  //ts编译配置
  const compilerOptions: CompilerOptions = {
    emitDeclarationOnly: true,
    outDir,
    baseUrl: projRoot,
    preserveSymlinks: true,
    skipLibCheck: true,
    noImplicitAny: false,
  }

  //指定option配置,tsconfig路径,跳过关联文件
  const project = new Project({
    compilerOptions,
    tsConfigFilePath: TSCONFIG_PATH,
    skipAddingFilesFromTsConfig: true,
  })

  const sourceFiles = await addSourceFiles(project)

  //类型检查
  consola.success('Added source files')
  typeCheck(project)
  consola.success('Type check passed!')

  //仅仅输出dts文件
  await project.emit({
    emitOnlyDtsFiles: true,
  })

  const tasks = sourceFiles.map(async (sourceFile) => {
    const relativePath = path.relative(pkgRoot, sourceFile.getFilePath())
    consola.trace(
      chalk.red(`Generating definition for file: ${chalk.bold(relativePath)}`)
    )
    //获取源文件的输出
    const emitOutput = sourceFile.getEmitOutput()

    //获取输出中的文件
    const emitFiles = emitOutput.getOutputFiles()

    if (emitFiles.length === 0) {
      throw new Error(`Emit no file: ${chalk.bold(relativePath)}`)
    }

    //重写emitFiles文件中的路径
    const subTasks = emitFiles.map(async (outputFile) => {
      //获取输出文件的路径
      const filepath = outputFile.getFilePath()
      /**
       * 在path.dirname(filepath)下创建空文件夹
       * mkdir创建空目录
       * path.dirname(filepath)获取文件路径
       */
      await mkdir(path.dirname(filepath), {
        recursive: true,
      })

      /**
       * writeFile重写文件
       * pathRewriter 路径重写
       */
      await writeFile(
        filepath,
        pathRewriter('esm')(outputFile.getText()),
        'utf8'
      )
      consola.success(
        chalk.green(
          `Definition for file: ${chalk.bold(relativePath)} generated`
        )
      )
    })

    await Promise.all(subTasks)
  })

  await Promise.all(tasks)
}

//添加源文件
async function addSourceFiles(project: Project) {
  project.addSourceFileAtPath(path.resolve(projRoot, 'typings/env.d.ts'))

  //全局资源文件
  const globSourceFile = '**/*.{js?(x),ts?(x),vue}'
  //'!follow-ui/**/*' => 排除packages/follow下的文件
  const filePaths = excludeFiles(
    await glob([globSourceFile, '!follow-ui/**/*'], {
      cwd: pkgRoot,
      absolute: true,
      onlyFiles: true,
    })
  )
  //follow文件下的文件
  const flPaths = excludeFiles(
    await glob(globSourceFile, {
      cwd: flRoot,
      onlyFiles: true,
    })
  )
  //源文件数组
  const sourceFiles: SourceFile[] = []
  await Promise.all([
    ...filePaths.map(async (file) => {
      //如果是vue文件
      if (file.endsWith('.vue')) {
        //用utf-8读取内容
        const content = await readFile(file, 'utf-8')

        //是否不进行类型检查
        const hasTsNoCheck = content.includes('@ts-nocheck')
        //解析单文件,生成sfc
        const sfc = vueCompiler.parse(content)
        //获取script, scriptSetup
        const { script, scriptSetup } = sfc.descriptor
        //处理脚本
        if (script || scriptSetup) {
          let content =
            (hasTsNoCheck ? '// @ts-nocheck\n' : '') + (script?.content ?? '')

          //如果有scriptSetup,处理scriptSetup,生成content
          if (scriptSetup) {
            //compileScript(descriptor, { id: scopeId })
            const compiled = vueCompiler.compileScript(sfc.descriptor, {
              id: 'xxx',
            })
            content += compiled.content
          }

          //语言
          const lang = scriptSetup?.lang || script?.lang || 'js'
          /**
           * path.relative(path1, path2),找到从path1到path2的相对路径
           */
          const sourceFile = project.createSourceFile(
            `${path.relative(process.cwd(), file)}.${lang}`,
            content
          )
          sourceFiles.push(sourceFile)
        }
      } else {
        const sourceFile = project.addSourceFileAtPath(file)
        sourceFiles.push(sourceFile)
      }
    }),
    ...flPaths.map(async (file) => {
      const content = await readFile(path.resolve(flRoot, file), 'utf-8')
      sourceFiles.push(
        project.createSourceFile(path.resolve(pkgRoot, file), content)
      )
    }),
  ])

  return sourceFiles
}

//类型检测
function typeCheck(project: Project) {
  //类型检测
  const diagnostics = project.getPreEmitDiagnostics()
  if (diagnostics.length > 0) {
    consola.error(project.formatDiagnosticsWithColorAndContext(diagnostics))
    const err = new Error('Failed to generate dts.')
    consola.error(err)
    throw err
  }
}
