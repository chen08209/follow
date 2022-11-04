import type { InjectionKey, ToRefs, WritableComputedRef } from 'vue'
import type { CheckboxGroupProps } from '@follow-ui/components'

type CheckboxGroupContext = {
  modelValue?: WritableComputedRef<any>
  changeEvent?: (...args: any) => any
} & ToRefs<
  Pick<
    CheckboxGroupProps,
    | 'size'
    | 'min'
    | 'max'
    | 'disabled'
    | 'validateEvent'
    | 'fill'
    | 'textColor'
    | 'color'
  >
>

export const checkboxGroupContextKey: InjectionKey<CheckboxGroupContext> =
  Symbol('checkboxGroupContextKey')
