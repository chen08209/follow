import { ComputedRef, InjectionKey } from '@vue/runtime-core'

export type ColorPickerContext = {
  currentColor: ComputedRef<string>
}

export const colorPickerContextKey: InjectionKey<ColorPickerContext> = Symbol(
  'colorPickerContextKey'
)
