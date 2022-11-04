import { withInstall, withNoopInstall } from '@follow-ui/utils'

import Checkbox from './src/checkbox.vue'
import CheckboxButton from './src/checkbox-button.vue'
import CheckboxGroup from './src/checkbox-group.vue'

export const FlCheckbox = withInstall(Checkbox, {
  CheckboxButton,
  CheckboxGroup,
})

export const FlCheckboxButton = withNoopInstall(CheckboxButton)
export const FlCheckboxGroup = withNoopInstall(CheckboxGroup)

export * from './src/ts'
