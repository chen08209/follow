<template>
  <i :class="ns.b()" :style="style" v-bind="$attrs">
    <slot />
  </i>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { addUnit, isUndefined } from '@follow-ui/utils'
import { useNamespace } from '@follow-ui/hooks'
import { iconProps } from './ts'
import type { CSSProperties } from 'vue'

export default defineComponent({
  name: 'FlIcon',
  props: iconProps,
  setup(props) {
    const ns = useNamespace('icon')

    const style = computed<CSSProperties>(() => {
      if (!props.size && !props.color) return {}

      return {
        fontSize: isUndefined(props.size) ? undefined : addUnit(props.size),
        '--color': props.color,
      }
    })

    return {
      ns,
      style,
    }
  },
})
</script>

<style scoped></style>
