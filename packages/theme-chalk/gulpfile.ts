import path from 'path'
import chalk from 'chalk'
import { dest, src } from 'gulp'
import gulpSass from 'gulp-sass'
import dartSass from 'sass'
import autoprefixer from 'gulp-autoprefixer'
import cleanCSS from 'gulp-clean-css'
import rename from 'gulp-rename'
import consola from 'consola'
import { flOutput } from '@follow-ui/build-utils'

// const distFolder = path.resolve(__dirname, 'dist')
const distBundle = path.resolve(flOutput, 'theme-chalk')

//build sass
function buildThemeChalk() {
  const sass = gulpSass(dartSass)
  const noPrefixFile = /(index|base|display)/
  return (
    src(path.resolve(__dirname, 'src/*.scss'))
      .pipe(sass.sync())
      .pipe(autoprefixer({ cascade: false }))
      .pipe(
        cleanCSS({}, (details) => {
          consola.success(
            `${chalk.cyan(details.name)}: ${chalk.yellow(
              details.stats.originalSize / 1000
            )} KB -> ${chalk.green(details.stats.minifiedSize / 1000)} KB`
          )
        })
      )
      //添加前缀
      .pipe(
        rename((path) => {
          if (!noPrefixFile.test(path.basename)) {
            path.basename = `fl-${path.basename}`
          }
        })
      )
      .pipe(dest(distBundle))
  )
}

export const build = buildThemeChalk

export default build
