import { FlOption, FlOptionGroup, FlSelect } from '@follow-ui/components/select'
import {
  FlRadio,
  FlRadioButton,
  FlRadioGroup,
} from '@follow-ui/components/radio'
import {
  FlCheckbox,
  FlCheckboxButton,
  FlCheckboxGroup,
} from '@follow-ui/components/checkbox'
import { FlButton, FlButtonGroup } from '@follow-ui/components/button'
import { FlCollapseTransition } from '@follow-ui/components/collapse-transition'
import { FlConfigProvider } from '@follow-ui/components/config-provider'
import { FlIcon } from '@follow-ui/components/icon'
import { FlInput } from '@follow-ui/components/input'
import { FlTag } from '@follow-ui/components/tag'
import { FlTooltip } from '@follow-ui/components/tooltip'
import { FlDatePicker } from '@follow-ui/components/date-picker'
import { FlTimePicker } from '@follow-ui/components/time-picker'
import { FlTimePicker2 } from '@follow-ui/components/time-picker-v2'
import { FlSwitch } from '@follow-ui/components/switch'
import { FlForm, FlFormItem } from '@follow-ui/components/form'
import { FlScrollbar } from '@follow-ui/components/scrollbar'
import { FlColorPicker } from '@follow-ui/components/color-picker'

import type { Plugin } from 'vue'

export default [
  FlTag,
  FlIcon,
  FlInput,
  FlButton,
  FlButtonGroup,
  FlConfigProvider,
  FlColorPicker,
  FlCollapseTransition,
  FlRadio,
  FlRadioButton,
  FlRadioGroup,
  FlCheckbox,
  FlCheckboxButton,
  FlCheckboxGroup,
  FlTooltip,
  FlOption,
  FlForm,
  FlFormItem,
  FlOptionGroup,
  FlScrollbar,
  FlSelect,
  FlSwitch,
  FlTimePicker,
  FlTimePicker2,
  FlDatePicker,
] as unknown as Plugin[]
