import {
  GetDisabledHoursState,
  GetDisabledMinutesState,
  GetDisabledSecondsState,
} from '@follow-ui/tokens'
import { Ref, ref } from 'vue'
import { Dayjs } from 'dayjs'
import { useResizeObserver } from '@vueuse/core'

type UseTimePanelProps = {
  getAvailableHours: GetDisabledHoursState
  getAvailableMinutes: GetDisabledMinutesState
  getAvailableSeconds: GetDisabledSecondsState
}

export const useTimePanel = ({
  getAvailableHours,
  getAvailableMinutes,
  getAvailableSeconds,
}: UseTimePanelProps) => {
  //获取有效时间
  const getAvailableTime = (
    date: Dayjs,
    role: string,
    first: boolean,
    compareDate?: Dayjs
  ) => {
    //有效时间getter
    const availableTimeGetters = {
      hour: getAvailableHours,
      minute: getAvailableMinutes,
      second: getAvailableSeconds,
    } as const
    let result = date
    //遍历houe,minute,second,如果不成功就修改result
    ;(['hour', 'minute', 'second'] as const).forEach((type) => {
      //如果存在对应getter
      if (availableTimeGetters[type]) {
        //对应时间类型有效数组
        let availableTimeSlots: number[]
        const method = availableTimeGetters[type]
        switch (type) {
          //获取对应分钟有效数组
          case 'minute': {
            availableTimeSlots = (method as typeof getAvailableMinutes)(
              result.hour(),
              role,
              compareDate
            )
            break
          }
          //获取对应秒有效数组
          case 'second': {
            availableTimeSlots = (method as typeof getAvailableSeconds)(
              result.hour(),
              result.minute(),
              role,
              compareDate
            )
            break
          }
          //获取对应小时有效数组
          default: {
            availableTimeSlots = (method as typeof getAvailableHours)(
              role,
              compareDate
            )
            break
          }
        }
        /**
         * 如果availableTimeSlots的长度大于0,且date对应type的数值不存在其中,执行后续语句
         */
        if (
          availableTimeSlots?.length &&
          !availableTimeSlots.includes(result[type]())
        ) {
          //获取需要插入位置的节点,设置result为result[type](availableTimeSlots[pos])
          const pos = first ? 0 : availableTimeSlots.length - 1
          result = result[type](availableTimeSlots[pos]) as unknown as Dayjs
        }
      }
    })
    return result
  }

  const timePickerOptions: Record<string, (...args: any[]) => void> = {}

  //设置timePickerOptions
  const onSetOption = ([key, val]: [string, (...args: any[]) => void]) => {
    timePickerOptions[key] = val
  }

  return {
    timePickerOptions,
    getAvailableTime,
    onSetOption,
  }
}

//获取picker关闭前的props.parsedValue
export const useOldValue = (
  refEL: Ref<HTMLElement>,
  innerValue?: Ref<string | Dayjs | Dayjs[]>
) => {
  const oldValue = ref(innerValue?.value)

  useResizeObserver(
    () => refEL.value,
    () => {
      oldValue.value = innerValue?.value
    }
  )

  return oldValue
}
