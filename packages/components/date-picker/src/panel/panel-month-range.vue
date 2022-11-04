<template>
  <div
    :class="[
      ppNs.b(),
      drpNs.b(),
      {
        'has-sidebar': Boolean($slots.sidebar) || hasShortcuts,
      },
    ]"
  >
    <div :class="ppNs.e('body-wrapper')">
      <slot name="sidebar" :class="ppNs.e('sidebar')" />
      <div v-if="hasShortcuts" :class="ppNs.e('sidebar')">
        <button
          v-for="(shortcut, key) in shortcuts"
          :key="key"
          type="button"
          :class="ppNs.e('shortcut')"
          @click="handleShortcutClick(shortcut)"
        >
          {{ shortcut.text }}
        </button>
      </div>
      <div :class="ppNs.e('body')">
        <div :class="[ppNs.e('content'), drpNs.e('content')]" class="is-left">
          <div :class="drpNs.e('header')">
            <fl-button
              text
              circle
              :icon="ArrowLeft"
              :class="ppNs.e('icon-btn')"
              @click="leftPrevYear"
            />
            <div>{{ leftLabel }}</div>
          </div>
          <month-table
            selection-mode="range"
            :date="leftDate"
            :min-date="minDate"
            :max-date="maxDate"
            :range-state="rangeState"
            :disabled-date="disabledDate"
            @changerange="handleChangeRange"
            @pick="handleRangePick"
            @select="onSelect"
          />
        </div>
        <div :class="[ppNs.e('content'), drpNs.e('content')]" class="is-right">
          <div :class="drpNs.e('header')">
            <div>{{ rightLabel }}</div>
            <fl-button
              text
              circle
              :icon="ArrowRight"
              :class="ppNs.e('icon-btn')"
              @click="rightNextYear"
            />
          </div>
          <month-table
            selection-mode="range"
            :date="rightDate"
            :min-date="minDate"
            :max-date="maxDate"
            :range-state="rangeState"
            :disabled-date="disabledDate"
            @changerange="handleChangeRange"
            @pick="handleRangePick"
            @select="onSelect"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject, ref, toRef } from 'vue'
import dayjs from 'dayjs'
import { useLocale } from '@follow-ui/hooks'
import { PICKER_BASE } from '@follow-ui/tokens'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import {
  panelMonthRangeEmits,
  panelMonthRangeProps,
  useMonthRangeHeader,
  useRangePicker,
} from '../ts'
import MonthTable from '../basic/basic-month-table.vue'

import type { Dayjs } from 'dayjs'

defineOptions({
  name: 'DatePickerMonthRange',
})

const props = defineProps(panelMonthRangeProps)
const emit = defineEmits(panelMonthRangeEmits)
const unit = 'year'

const { lang } = useLocale()
const pickerBase = inject(PICKER_BASE) as any
const { shortcuts, disabledDate, format } = pickerBase.props
const defaultValue = toRef(pickerBase.props, 'defaultValue')
const leftDate = ref(dayjs().locale(lang.value))
const rightDate = ref(dayjs().locale(lang.value).add(1, unit))

const {
  minDate,
  maxDate,
  rangeState,
  ppNs,
  drpNs,
  handleChangeRange,
  handleRangeConfirm,
  handleShortcutClick,
  onSelect,
} = useRangePicker(props, {
  defaultValue,
  leftDate,
  rightDate,
  unit,
  onParsedValueChanged,
})

const hasShortcuts = computed(() => !!shortcuts.length)

const { leftPrevYear, rightNextYear, leftLabel, rightLabel } =
  useMonthRangeHeader({
    unlinkPanels: toRef(props, 'unlinkPanels'),
    leftDate,
    rightDate,
  })

type RangePickValue = {
  minDate: Dayjs
  maxDate: Dayjs
}

//单击事件
const handleRangePick = (val: RangePickValue, close = true) => {
  const minDateTemp = val.minDate
  const maxDateTemp = val.maxDate
  if (maxDate.value === maxDateTemp && minDate.value === minDateTemp) {
    return
  }
  maxDate.value = maxDateTemp
  minDate.value = minDateTemp

  if (!close) return
  handleRangeConfirm()
}

const formatToString = (days: Dayjs[]) => {
  return days.map((day) => day.format(format))
}

//传入值change事件
function onParsedValueChanged(
  minDate: Dayjs | undefined,
  maxDate: Dayjs | undefined
) {
  if (props.unlinkPanels && maxDate) {
    const minDateYear = minDate?.year() || 0
    const maxDateYear = maxDate.year()
    rightDate.value =
      minDateYear === maxDateYear ? maxDate.add(1, unit) : maxDate
  } else {
    rightDate.value = leftDate.value.add(1, unit)
  }
}

emit('set-picker-option', ['formatToString', formatToString])
</script>
