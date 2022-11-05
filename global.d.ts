declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    FlButton: typeof import('follow-ui')['FlButton']
    FlButtonGroup: typeof import('follow-ui')['FlButtonGroup']
    FlInput: typeof import('follow-ui')['FlInput']
    FlTooltip: typeof import('follow-ui')['FlTooltip']
    FlIcon: typeof import('follow-ui')['FlIcon']
    FlTag: typeof import('follow-ui')['FlTag']
    FlSwitch: typeof import('follow-ui')['FlSwitch']
    FlSelect: typeof import('follow-ui')['FlSelect']
    FlOption: typeof import('follow-ui')['FlOption']
    FlScrollbar: typeof import('follow-ui')['FlScrollbar']
    FlOptionGroup: typeof import('follow-ui')['FlOptionGroup']
    FlCollapseTransition: typeof import('follow-ui')['FlCollapseTransition']
    FlTimePicker: typeof import('follow-ui')['FlTimePicker']
    FlDatePicker: typeof import('follow-ui')['FlDatePicker']
    FlForm: typeof import('follow-ui')['FlForm']
    FlFormItem: typeof import('follow-ui')['FlFormItem']
    FlRadioGroup: typeof import('follow-ui')['FlRadioGroup']
    FlRadio: typeof import('follow-ui')['FlRadio']
    FlRadioButton: typeof import('follow-ui')['FlRadioButton']
    FlCheckboxGroup: typeof import('follow-ui')['FlCheckboxGroup']
    FlCheckbox: typeof import('follow-ui')['FlCheckbox']
    FlCheckboxButton: typeof import('follow-ui')['FlCheckboxButton']
    FlColorPicker: typeof import('follow-ui')['FlColorPicker']
  }
  interface ComponentCustomProperties {
    $message: typeof import('follow-ui')['FlMessage']
  }
}

export {}
