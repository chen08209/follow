import type { InjectionKey, SetupContext } from 'vue'
import type { UseNamespaceReturn } from '@follow-ui/hooks'

interface DatePickerContext {
  slots: SetupContext['slots']
  pickerNs: UseNamespaceReturn
}

export const ROOT_PICKER_INJECTION_KEY: InjectionKey<DatePickerContext> =
  Symbol()

export const PICKER_POPPER_OPTIONS = Symbol()

export const PICKER_BASE = Symbol()
