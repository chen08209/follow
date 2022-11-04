import { withInstall, withNoopInstall } from '@follow-ui/utils'
import Select from './src/select.vue'
import Option from './src/option.vue'
import OptionGroup from './src/option-group.vue'

export const FlSelect = withInstall(Select, {
  Option,
  OptionGroup,
})

export const FlOption = withNoopInstall(Option)
export const FlOptionGroup = withNoopInstall(OptionGroup)

export default FlSelect
