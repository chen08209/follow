import '@vue/runtime-core'
declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    FlButton: typeof import('../packages/follow-ui')['FlButton']
    FlButtonGroup: typeof import('../packages/follow-ui')['FlButtonGroup']
    FlInput: typeof import('../packages/follow-ui')['FlInput']
    FlTooltip: typeof import('../packages/follow-ui')['FlTooltip']
    FlOption: typeof import('../packages/follow-ui')['FlOption']
    FlOptionGroup: typeof import('../packages/follow-ui')['FlOptionGroup']
    FlIcon: typeof import('../packages/follow-ui')['FlIcon']
    FlTag: typeof import('../packages/follow-ui')['FlTag']
    FlSelect: typeof import('../packages/follow-ui')['FlSelect']
    FlSwitch: typeof import('../packages/follow-ui')['FlSwitch']
    FlScrollbar: typeof import('../packages/follow-ui')['FlScrollbar']
    FlForm: typeof import('../packages/follow-ui')['FlForm']
    FlFormItem: typeof import('../packages/follow-ui')['FlFormItem']
    FlTimePicker: typeof import('../packages/follow-ui')['FlTimePicker']
    FlDatePicker: typeof import('../packages/follow-ui')['FlDatePicker']
    FlCollapseTransition: typeof import('../packages/follow-ui')['FlCollapseTransition']
    FlRadioGroup: typeof import('../packages/follow-ui')['FlRadioGroup']
    FlRadio: typeof import('../packages/follow-ui')['FlRadio']
    FlRadioButton: typeof import('../packages/follow-ui')['FlRadioButton']
    FlCheckboxGroup: typeof import('../packages/follow-ui')['FlCheckboxGroup']
    FlCheckbox: typeof import('../packages/follow-ui')['FlCheckbox']
    FlCheckboxButton: typeof import('../packages/follow-ui')['FlCheckboxButton']
    FlColorPicker: typeof import('../packages/follow-ui')['FlColorPicker']
  }
}
