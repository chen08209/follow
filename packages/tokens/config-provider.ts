import type { InjectionKey, Ref } from 'vue'
import type { ConfigProviderProps } from '@follow-ui/components/config-provider'

export type ConfigProviderContext = Partial<ConfigProviderProps>

export const configProviderContextKey: InjectionKey<
  Ref<ConfigProviderContext>
> = Symbol()
