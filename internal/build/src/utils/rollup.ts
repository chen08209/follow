import { flPackage, getPackageDependencies } from '@follow-ui/build-utils'

import type { OutputOptions, RollupBuild } from 'rollup'

//生成外部
export const generateExternal = async (options: { full: boolean }) => {
  const { dependencies, peerDependencies } = getPackageDependencies(flPackage)

  return (id: string) => {
    const packages: string[] = peerDependencies
    //如果full为false,使package = dependencies + peerDependencies + @vue
    if (!options.full) {
      packages.push('@vue', ...dependencies)
    }

    //如果当前id是package或者前缀是package return true
    return [...new Set(packages)].some(
      (pkg) => id === pkg || id.startsWith(`${pkg}/`)
    )
  }
}

export function writeBundles(bundle: RollupBuild, options: OutputOptions[]) {
  return Promise.all(options.map((option) => bundle.write(option)))
}

export function formatBundleFilename(
  name: string,
  minify: boolean,
  ext: string
) {
  return `${name}${minify ? '.min' : ''}.${ext}`
}
