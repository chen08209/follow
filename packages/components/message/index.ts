import { withInstallFunction } from '@follow-ui/utils'

import Message from './src/message'

export const FlMessage = withInstallFunction(Message, '$message')

export * from './src/ts'
