import { defineComponent, renderSlot, watch } from 'vue'
import { useSizeProp } from '@follow-ui/hooks'
import { provideGlobalConfig } from '@follow-ui/hooks/use-global-config'
import { buildProps, definePropType } from '@follow-ui/utils'

import type { Language } from '@follow-ui/locale'
import type { ExtractPropTypes } from 'vue'
import type { ButtonConfigContext } from '../../button'
import type { MessageConfigContext } from '../../message'

export const messageConfig: MessageConfigContext = {}

export const configProviderProps = buildProps({
  a11y: {
    type: Boolean,
    default: true,
  },
  locale: {
    type: definePropType<Language>(Object),
  },

  size: useSizeProp,

  button: {
    type: definePropType<ButtonConfigContext>(Object),
  },
  //
  // experimentalFeatures: {
  //   type: definePropType<ExperimentalFeatures>(Object),
  // },
  //
  // keyboardNavigation: {
  //   type: Boolean,
  //   default: true,
  // },
  //
  message: {
    type: definePropType<MessageConfigContext>(Object),
  },

  zIndex: Number,

  namespace: {
    type: String,
    default: 'fl',
  },
} as const)

export type ConfigProviderProps = ExtractPropTypes<typeof configProviderProps>

const ConfigProvider = defineComponent({
  name: 'FlConfigProvider',
  props: configProviderProps,
  setup(props, { slots }) {
    watch(
      () => props.message,
      (val) => {
        Object.assign(messageConfig, val ?? {})
      },
      { immediate: true, deep: true }
    )
    const config = provideGlobalConfig(props)
    return () => renderSlot(slots, 'default', { config: config?.value })
  },
})

export type ConfigProviderInstance = InstanceType<typeof ConfigProvider>

export default ConfigProvider
