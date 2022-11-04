<template>
  <table
    role="grid"
    :aria-label="t('fl.datepicker.yearTablePrompt')"
    :class="ns.b()"
    @click="handleYearTableClick"
  >
    <tbody ref="tbodyRef">
      <tr v-for="(_, i) in 3" :key="i">
        <template v-for="(__, j) in 4" :key="i + '_' + j">
          <td
            v-if="i * 4 + j < 10"
            :ref="
              (el) =>
                isSelectedCell(startYear + i * 4 + j) && (currentCellRef = el as HTMLElement)
            "
            class="available"
            :class="getCellKls(startYear + i * 4 + j)"
            :aria-selected="`${isSelectedCell(startYear + i * 4 + j)}`"
            :tabindex="isSelectedCell(startYear + i * 4 + j) ? 0 : -1"
            @keydown.space.prevent.stop="handleYearTableClick"
            @keydown.enter.prevent.stop="handleYearTableClick"
          >
            <span class="cell">{{ startYear + i * 4 + j }}</span>
          </td>
          <td v-else />
        </template>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref, watch } from 'vue'
import dayjs from 'dayjs'
import { useLocale, useNamespace } from '@follow-ui/hooks'
import { castArray, hasClass } from '@follow-ui/utils'
import { rangeArr } from '../../../time-picker'
import { basicYearTableProps } from '../ts'

const datesInYear = (year: number, lang: string) => {
  //获取本年第一天
  const firstDay = dayjs(String(year)).locale(lang).startOf('year')
  //获取本年最后一天
  const lastDay = firstDay.endOf('year')
  //获取本年总天数
  const numOfDays = lastDay.dayOfYear()

  /**
   * rangeArr(numOfDays) 生成一个从0-numOfDays的数组
   * 通过map修改为对应日期值
   */
  return rangeArr(numOfDays).map((n) => firstDay.add(n, 'day').toDate())
}

const props = defineProps(basicYearTableProps)
const emit = defineEmits(['pick'])

const ns = useNamespace('year-table')

const { t, lang } = useLocale()
const tbodyRef = ref<HTMLElement>()
const currentCellRef = ref<HTMLElement>()
const startYear = computed(() => {
  return Math.floor(props.date.year() / 10) * 10
})

//聚焦事件
const focus = () => {
  currentCellRef.value?.focus()
}

//设置class
const getCellKls = (year: number) => {
  //class
  const kls: Record<string, boolean> = {}
  //获取今天
  const today = dayjs().locale(lang.value)

  //判断数组中是否有disabledDate的元素,设置disabled
  kls.disabled = props.disabledDate
    ? datesInYear(year, lang.value).every(props.disabledDate)
    : false

  //设置current
  kls.current =
    castArray(props.parsedValue).findIndex((d) => d!.year() === year) >= 0

  //设置today
  kls.today = today.year() === year

  return kls
}

//判断是否选中
const isSelectedCell = (year: number) => {
  return (
    (year === startYear.value &&
      props.date.year() < startYear.value &&
      props.date.year() > startYear.value + 9) ||
    castArray(props.date).findIndex((date) => date.year() === year) >= 0
  )
}

//click事件
const handleYearTableClick = (event: MouseEvent | KeyboardEvent) => {
  const clickTarget = event.target as HTMLDivElement
  //找到td
  const target = clickTarget.closest('td')
  if (target && target.textContent) {
    //判断target是否废弃
    if (hasClass(target, 'disabled')) return

    //获取对应文本
    const year = target.textContent || target.innerText

    //触发pick
    emit('pick', Number(year))
  }
}

//监听date,如果激活在tbodyRef内,触发focus()
watch(
  () => props.date,
  async () => {
    if (tbodyRef.value?.contains(document.activeElement)) {
      await nextTick()
      currentCellRef.value?.focus()
    }
  }
)

defineExpose({
  focus,
})
</script>
