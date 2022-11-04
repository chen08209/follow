import { FlTooltip } from '@follow-ui/components'
import { DebouncedFunc } from 'lodash-unified'
import type {
  Component,
  ComponentPublicInstance,
  ComputedRef,
  InjectionKey,
  Ref,
  ShallowRef,
  WritableComputedRef,
} from 'vue'

interface SelectGroupContext {
  disabled: boolean
}

export interface QueryChangeCtx {
  query: string
}

export const selectKey = 'FlSelect' as unknown as InjectionKey<SelectContext>

export const selectGroupKey =
  'FlSelectGroup' as unknown as InjectionKey<SelectGroupContext>

export interface SelectContext {
  props: {
    multiple?: boolean
    multipleLimit?: number
    valueKey?: string
    modelValue?: string | number | unknown | unknown[]
    popperClass?: string
    remote?: boolean
    fitInputWidth?: boolean
  }
  queryChange: Ref<QueryChangeCtx>
  groupQueryChange: Ref<string>
  selectWrapper: HTMLElement
  cachedOptions: Map<any, any>
  hoverIndex: number
  optionsCount: number
  filteredOptionsCount: number
  options: Map<any, any>
  optionsArray: any[]
  selected: any | any[]

  setSelected(): void

  onOptionCreate(ex: UseOptionContext): void

  onOptionDestroy(context: UseOptionContext): void

  handleOptionSelect(vm: unknown, byClick: boolean): void
}

export interface UseSelectContext {
  optionsArray: ComputedRef<any[]>
  selectSize: ComputedRef<'' | 'default' | 'small' | 'large'>
  handleResize: () => void
  debouncedOnInputChange: DebouncedFunc<() => void>
  debouncedQueryChange: DebouncedFunc<(e: any) => void>
  deletePrevTag: (e: any) => void
  deleteTag: (event: any, tag: any) => void
  deleteSelected: (event: Event) => void
  handleOptionSelect: (option: any, byClick: any) => void
  scrollToOption: (option: number | any[]) => void
  readonly: ComputedRef<boolean>
  resetInputHeight: () => void
  showClose: ComputedRef<boolean>
  iconComponent: ComputedRef<string | Component>
  iconReverse: ComputedRef<string>
  showNewOption: ComputedRef<boolean>
  collapseTagSize: ComputedRef<'default' | 'small'>
  setSelected: () => void
  managePlaceholder: () => void
  selectDisabled: ComputedRef<boolean | undefined>
  emptyText: ComputedRef<string | false | null>
  toggleLastOptionHitState: (hit?: boolean) => any
  resetInputState: (e: KeyboardEvent) => void
  handleComposition: (event: any) => void
  onOptionCreate: (context: UseOptionContext) => void
  onOptionDestroy: (context: UseOptionContext) => void
  handleMenuEnter: () => void
  handleFocus: (event: any) => void
  blur: () => void
  handleBlur: (event: Event) => void
  handleClearClick: (event: Event) => void
  handleClose: () => void
  handleKeydownEscape: (event: any) => void
  toggleMenu: () => void
  selectOption: () => void
  getValueKey: (item: any) => any
  navigateOptions: (direction: any) => void
  dropMenuVisible: WritableComputedRef<boolean>
  queryChange: ShallowRef<QueryChangeCtx>
  groupQueryChange: ShallowRef<string>
  reference: Ref<ComponentPublicInstance<{
    focus: () => void
    blur: () => void
    input: HTMLInputElement
  }> | null>
  input: Ref<HTMLInputElement | null>
  tooltipRef: Ref<InstanceType<typeof FlTooltip> | null>
  tags: Ref<HTMLElement | null>
  selectWrapper: Ref<HTMLElement | null>
  scrollbar: Ref<{
    handleScroll: () => void
  } | null>
}

export interface UseOptionContext {
  value: string | boolean | number | Record<string, string>
  label: string | number
  created: boolean
  disabled: boolean
  select: SelectContext
  currentLabel: ComputedRef<any>
  currentValue: ComputedRef<any>
  itemSelected: ComputedRef<boolean>
  isDisabled: ComputedRef<any>
  hoverItem: () => void
}
