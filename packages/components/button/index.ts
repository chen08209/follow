import { withInstall, withNoopInstall } from '@follow-ui/utils/vue/install'

import Button from './src/button.vue'
import ButtonGroup from './src/button-group.vue'

export const FlButton = withInstall(Button, {
  ButtonGroup,
})
export default FlButton

export const FlButtonGroup = withNoopInstall(ButtonGroup)

export * from './src/ts'
