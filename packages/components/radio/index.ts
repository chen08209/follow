import { withInstall, withNoopInstall } from '@follow-ui/utils'

import Radio from './src/radio.vue'
import RadioButton from './src/radio-button.vue'
import RadioGroup from './src/radio-group.vue'

export const FlRadio = withInstall(Radio, {
  RadioButton,
  RadioGroup,
})
export const FlRadioGroup = withNoopInstall(RadioGroup)
export const FlRadioButton = withNoopInstall(RadioButton)

export * from './src/ts'
