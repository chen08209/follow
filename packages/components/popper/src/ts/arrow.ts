import type { ExtractPropTypes } from 'vue'

export const popperArrowProps = {
  arrowOffset: {
    type: Number,
    default: 5,
  },
}

export type PopperArrowProps = ExtractPropTypes<typeof popperArrowProps>
