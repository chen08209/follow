import { withInstall } from '@follow-ui/utils/vue/install'

import Popper from './src/poper.vue'

import PopperArrow from './src/arrow.vue'
import PopperTrigger from './src/trigger.vue'
import PopperContent from './src/content.vue'

export {
  PopperArrow as FlPopperArrow,
  PopperTrigger as FlPopperTrigger,
  PopperContent as FlPopperContent,
}

export const FlPopper = withInstall(Popper)

export default FlPopper

export type { Placement, Options } from '@popperjs/core'

export type FlPopperArrowInstance = InstanceType<typeof PopperArrow>
export type FlPopperArrowTrigger = InstanceType<typeof PopperTrigger>
export type FlPopperArrowContent = InstanceType<typeof PopperContent>

export * from './src/ts'
