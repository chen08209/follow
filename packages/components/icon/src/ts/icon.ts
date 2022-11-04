import { definePropType } from '@follow-ui/utils'

import type { ExtractPropTypes } from 'vue'
import type Icon from '../icon.vue'

export const iconProps = {
  size: {
    type: definePropType<number | string>([Number, String]),
  },
  color: {
    type: String,
  },
}
export type IconProps = ExtractPropTypes<typeof iconProps>
export type IconInstance = InstanceType<typeof Icon>
