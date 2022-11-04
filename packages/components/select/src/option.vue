<template>
  <li
    v-show="visible"
    :class="[
      ns.be('dropdown', 'item'),
      ns.is('disabled', isDisabled),
      {
        selected: itemSelected,
        hover,
      },
    ]"
    @mouseenter="hoverItem"
    @click.stop="selectOptionClick"
  >
    <ripple-wrapper :disabled="isDisabled" />
    <slot>
      <span>{{ currentLabel }}</span>
    </slot>
  </li>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, reactive, toRefs } from 'vue'
import { useNamespace } from '@follow-ui/hooks'
import { rippleWrapper } from '../../ripple'
import { optionProps, useOption } from './ts'
import type { UseOptionContext } from '@follow-ui/tokens'

defineOptions({
  name: 'FlOption',
})

const props = defineProps(optionProps)

const ns = useNamespace('select')
const key = props.value
const states = reactive({
  index: -1,
  groupDisabled: false,
  visible: true,
  hitState: false,
  hover: false,
})
const optionContext = useOption(props, states)

const { currentLabel, itemSelected, isDisabled, select, hoverItem } =
  optionContext

const { visible, hover } = toRefs(states)
//创建option
select.onOptionCreate(optionContext as unknown as UseOptionContext)

//卸载之前
onBeforeUnmount(() => {
  //选中的数据
  const { selected } = select
  //如果是多选,不改变,单选则用数组包装
  const selectedOptions = select.props.multiple ? selected : [selected]
  //判断当前option是否被选中
  const doesSelected = selectedOptions.some((item) => {
    return item.value === key
  })
  //如果没有被选中,在cachedOptions中删除当前option
  nextTick(() => {
    if (select.cachedOptions.get(key) === optionContext && !doesSelected) {
      select.cachedOptions.delete(key)
    }
  })
  //销毁option
  select.onOptionDestroy(optionContext)
})

//点击事件
function selectOptionClick() {
  //如果没有失效,调用选中事件
  if (props.disabled !== true && states.groupDisabled !== true) {
    select.handleOptionSelect(optionContext, true)
  }
}
</script>
