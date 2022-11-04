import { componentSizeMap } from '@follow-ui/constants'

import type { ComponentSize } from '@follow-ui/constants'

/**
 * 获取组件尺寸
 * 如果size存在返回componentSizeMap中对应size,
 * 否则返回默认size
 */
export const getComponentSize = (size?: ComponentSize) => {
  return componentSizeMap[size || 'default']
}
