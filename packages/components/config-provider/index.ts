import { withInstall } from '@follow-ui/utils'
import ConfigProvider from './src/ts/config-provider'

export const FlConfigProvider = withInstall(ConfigProvider)
export default FlConfigProvider

export * from './src/ts'
