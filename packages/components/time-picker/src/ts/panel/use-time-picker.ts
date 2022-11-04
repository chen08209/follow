import { ref, watch } from 'vue'
import { makeList } from '../utils'

import type {
  GetDisabledHours,
  GetDisabledMinutes,
  GetDisabledSeconds,
} from '../picker'
import type { Dayjs } from 'dayjs'
import type {
  GetDisabledHoursState,
  GetDisabledMinutesState,
  GetDisabledSecondsState,
} from '../types'

/**
 * 过滤disabled项,返回有效数组
 * @param disabledList boolean数组
 * @returns number[]
 */
const makeAvailableArr = (disabledList: boolean[]): number[] => {
  //判断传入数组对应项是否为true,是返回true,否返回对应index
  const toIndex = (isDisabled: boolean, index: number) => isDisabled || index

  //判断是否不等于true
  const getNumber = (predicate: number | true): predicate is number =>
    predicate !== true

  return disabledList.map(toIndex).filter(getNumber)
}

export const getTimeLists = (
  disabledHours?: GetDisabledHours,
  disabledMinutes?: GetDisabledMinutes,
  disabledSeconds?: GetDisabledSeconds
) => {
  //获取小时数组
  const getHoursList = (role: string, compare?: Dayjs) => {
    return makeList(24, disabledHours && (() => disabledHours?.(role, compare)))
  }
  //获取分钟数组
  const getMinutesList = (hour: number, role: string, compare?: Dayjs) => {
    return makeList(
      60,
      disabledMinutes && (() => disabledMinutes?.(hour, role, compare))
    )
  }
  //获取秒数组
  const getSecondsList = (
    hour: number,
    minute: number,
    role: string,
    compare?: Dayjs
  ) => {
    return makeList(
      60,
      disabledSeconds && (() => disabledSeconds?.(hour, minute, role, compare))
    )
  }

  return {
    getHoursList,
    getMinutesList,
    getSecondsList,
  }
}

export const buildAvailableTimeSlotGetter = (
  disabledHours: GetDisabledHours,
  disabledMinutes: GetDisabledMinutes,
  disabledSeconds: GetDisabledSeconds
) => {
  //获取对应时间数组
  const { getHoursList, getMinutesList, getSecondsList } = getTimeLists(
    disabledHours,
    disabledMinutes,
    disabledSeconds
  )

  //获取有效的小时数组
  const getAvailableHours: GetDisabledHoursState = (role, compare?) => {
    return makeAvailableArr(getHoursList(role, compare))
  }

  //获取有效的分钟数组
  const getAvailableMinutes: GetDisabledMinutesState = (
    hour,
    role,
    compare?
  ) => {
    return makeAvailableArr(getMinutesList(hour, role, compare))
  }

  //获取有效的小时数组
  const getAvailableSeconds: GetDisabledSecondsState = (
    hour,
    minute,
    role,
    compare?
  ) => {
    return makeAvailableArr(getSecondsList(hour, minute, role, compare))
  }

  return {
    getAvailableHours,
    getAvailableMinutes,
    getAvailableSeconds,
  }
}

//获取picker关闭前的props.parsedValue
export const useOldValue = (props: {
  parsedValue?: string | Dayjs | Dayjs[]
  visible: boolean
}) => {
  const oldValue = ref(props.parsedValue)

  watch(
    () => props.visible,
    (val) => {
      if (!val) {
        oldValue.value = props.parsedValue
      }
    }
  )

  return oldValue
}
