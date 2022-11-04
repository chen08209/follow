import { definePropType } from '@follow-ui/utils'
import type { Measurable } from '@follow-ui/tokens/popper'

export const popperTriggerProps = {
  virtualRef: {
    type: definePropType<Measurable>(Object),
  },
  virtualTriggering: Boolean,
  onMouseenter: Function,
  onMouseleave: Function,
  onClick: Function,
  onKeydown: Function,
  onFocus: Function,
  onBlur: Function,
  onContextmenu: Function,
  id: String,
  open: Boolean,
}

export type PopperTriggerProps = typeof popperTriggerProps
