import DatePickPanel from './panel/panel-date-pick.vue'
import DateRangePickPanel from './panel/panel-date-range.vue'
import MonthRangePickPanel from './panel/panel-month-range.vue'
import type { IDatePickerType } from './ts/date-picker'

export const getPanel = function (type: IDatePickerType) {
  switch (type) {
    case 'daterange':
    case 'datetimerange': {
      return DateRangePickPanel
    }
    case 'monthrange': {
      return MonthRangePickPanel
    }
    default: {
      return DatePickPanel
    }
  }
}
