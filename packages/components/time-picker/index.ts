import { withInstall } from '@follow-ui/utils/vue/install'
import TimePicker from './src/time-picker'
import CommonPicker from './src/common/picker.vue'
import TimePickPanel from './src/panel/panel-time-pick.vue'

export const FlTimePicker = withInstall(TimePicker)
export { CommonPicker, TimePickPanel }

export * from './src/ts'
