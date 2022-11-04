<template>
  <div
    ref="selectWrapper"
    v-click-outside:[popperPaneRef]="handleClose"
    :class="wrapperKls"
    @click.stop="toggleMenu"
  >
    <!-- 触发器 -->
    <fl-tooltip
      ref="tooltipRef"
      pure
      trigger="click"
      :placement="placement"
      :visible="dropMenuVisible"
      :show-arrow="false"
      :teleported="teleported"
      :popper-class="[nsSelect.e('popper'), popperClass]"
      :fallback-placements="['bottom-start', 'top-start', 'right', 'left']"
      :effect="effect"
      :transition="`${nsSelect.namespace.value}-zoom-in-top`"
      :stop-popper-mouse-event="false"
      :gpu-acceleration="false"
      :persistent="persistent"
      @show="handleMenuEnter"
    >
      <template #default>
        <div
          class="select-trigger"
          @mouseenter="inputHovering = true"
          @mouseleave="inputHovering = false"
        >
          <!-- 多选 tags-->
          <div
            v-if="multiple"
            ref="tags"
            :class="nsSelect.e('tags')"
            :style="selectTagsStyle"
          >
            <!-- 折叠tags -->
            <span
              v-if="collapseTags && selected.length"
              :class="[
                nsSelect.b('tags-wrapper'),
                { 'has-prefix': prefixWidth && selected.length },
              ]"
            >
              <fl-tag
                :closable="!selectDisabled && !selected[0].isDisabled"
                :size="collapseTagSize"
                :hit="selected[0].hitState"
                :type="tagType"
                disable-transitions
                @close="deleteTag($event, selected[0])"
              >
                <span :class="nsSelect.e('tags-text')" :style="tagTextStyle">
                  {{ selected[0].currentLabel }}
                </span>
              </fl-tag>
              <fl-tag
                v-if="selected.length > 1"
                :closable="false"
                :size="collapseTagSize"
                :type="tagType"
                disable-transitions
              >
                <fl-tooltip
                  v-if="collapseTagsTooltip"
                  :disabled="dropMenuVisible"
                  :fallback-placements="['bottom', 'top', 'right', 'left']"
                  :effect="effect"
                  placement="bottom"
                  :teleported="teleported"
                >
                  <template #default>
                    <span :class="nsSelect.e('tags-text')"
                      >+ {{ selected.length - 1 }}</span
                    >
                  </template>
                  <template #content>
                    <div :class="nsSelect.e('collapse-tags')">
                      <div
                        v-for="(item, idx) in selected.slice(1)"
                        :key="idx"
                        :class="nsSelect.e('collapse-tag')"
                      >
                        <fl-tag
                          :key="getValueKey(item)"
                          class="in-tooltip"
                          :closable="!selectDisabled && !item.isDisabled"
                          :size="collapseTagSize"
                          :hit="item.hitState"
                          :type="tagType"
                          disable-transitions
                          :style="{ margin: '2px' }"
                          @close="deleteTag($event, item)"
                        >
                          <!-- 最大宽度为inputWidth - (tag内边距+边框) - (clear按钮) - (tags-wrapper左外边距)-->
                          <span
                            :class="nsSelect.e('tags-text')"
                            :style="{
                              maxWidth: inputWidth - 75 + 'px',
                            }"
                            >{{ item.currentLabel }}</span
                          >
                        </fl-tag>
                      </div>
                    </div>
                  </template>
                </fl-tooltip>
                <span v-else :class="nsSelect.e('tags-text')"
                  >+ {{ selected.length - 1 }}</span
                >
              </fl-tag>
            </span>
            <!-- 默认tags -->
            <transition v-if="!collapseTags" @after-leave="resetInputHeight">
              <span
                :class="[
                  nsSelect.b('tags-wrapper'),
                  { 'has-prefix': prefixWidth && selected.length },
                ]"
              >
                <fl-tag
                  v-for="item in selected"
                  :key="getValueKey(item)"
                  :closable="!selectDisabled && !item.isDisabled"
                  :size="collapseTagSize"
                  :hit="item.hitState"
                  :type="tagType"
                  disable-transitions
                  @close="deleteTag($event, item)"
                >
                  <span
                    :class="nsSelect.e('tags-text')"
                    :style="{ maxWidth: inputWidth - 75 + 'px' }"
                    >{{ item.currentLabel }}</span
                  >
                </fl-tag>
              </span>
            </transition>
            <!-- 过滤输入框 marginLeft只有在没有数据或者换行时存在-->
            <input
              v-if="filterable"
              ref="input"
              v-model="query"
              type="text"
              :class="[nsSelect.e('input'), nsSelect.is(selectSize)]"
              :disabled="selectDisabled"
              :autocomplete="autocomplete"
              :style="{
                marginLeft:
                  (prefixWidth && !selected.length) || tagInMultiLine
                    ? `${prefixWidth}px`
                    : '',
                flexGrow: 1,
                width: `${inputLength / (inputWidth - 32)}%`,
                maxWidth: `${inputWidth - 42}px`,
              }"
              @focus="handleFocus"
              @blur="handleBlur"
              @keyup="managePlaceholder"
              @keydown="resetInputState"
              @keydown.down.prevent="navigateOptions('next')"
              @keydown.up.prevent="navigateOptions('prev')"
              @keydown.esc="handleKeydownEscape"
              @keydown.enter.stop.prevent="selectOption"
              @keydown.delete="deletePrevTag"
              @keydown.tab="visible = false"
              @compositionstart="handleComposition"
              @compositionupdate="handleComposition"
              @compositionend="handleComposition"
              @input="debouncedQueryChange"
            />
          </div>
          <fl-input
            :id="id"
            ref="reference"
            v-model="selectedLabel"
            type="text"
            :placeholder="currentPlaceholder"
            :name="name"
            :autocomplete="autocomplete"
            :size="selectSize"
            :disabled="selectDisabled"
            :readonly="readonly"
            :validate-event="false"
            :class="[nsSelect.is('focus', visible)]"
            :tabindex="multiple && filterable ? -1 : undefined"
            @focus="handleFocus"
            @blur="handleBlur"
            @input="debouncedOnInputChange"
            @paste="debouncedOnInputChange"
            @compositionstart="handleComposition"
            @compositionupdate="handleComposition"
            @compositionend="handleComposition"
            @keydown.down.stop.prevent="navigateOptions('next')"
            @keydown.up.stop.prevent="navigateOptions('prev')"
            @keydown.enter.stop.prevent="selectOption"
            @keydown.esc="handleKeydownEscape"
            @keydown.tab="visible = false"
          >
            <template v-if="$slots.prefix" #prefix>
              <div
                style="
                  height: 100%;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                "
              >
                <slot name="prefix" />
              </div>
            </template>
            <template #suffix>
              <fl-icon
                v-if="iconComponent && !showClose"
                :class="[nsSelect.e('caret'), nsSelect.e('icon'), iconReverse]"
              >
                <component :is="iconComponent" />
              </fl-icon>
              <fl-icon
                v-if="showClose && clearIcon"
                :class="[nsSelect.e('caret'), nsSelect.e('icon')]"
                @click="handleClearClick"
              >
                <component :is="clearIcon" />
              </fl-icon>
            </template>
          </fl-input>
        </div>
      </template>
      <template #content>
        <fl-select-menu>
          <fl-scrollbar
            v-show="options.size > 0 && !loading"
            ref="scrollbar"
            tag="ul"
            :wrap-class="nsSelect.be('dropdown', 'wrap')"
            :view-class="nsSelect.be('dropdown', 'list')"
            :class="[
              nsSelect.is(
                'empty',
                !allowCreate && Boolean(query) && filteredOptionsCount === 0
              ),
            ]"
          >
            <fl-option v-if="showNewOption" :value="query" :created="true" />

            <template v-if="items?.length">
              <fl-option
                v-for="(item, index) in items"
                v-bind="item"
                :key="item?.value ?? item?.label ?? index"
              />
            </template>
            <slot v-else />
          </fl-scrollbar>
          <template
            v-if="
              emptyText &&
              (!allowCreate || loading || (allowCreate && options.size === 0))
            "
          >
            <slot v-if="$slots.empty" name="empty" />
            <p v-else :class="nsSelect.be('dropdown', 'empty')">
              {{ emptyText }}
            </p>
          </template>
        </fl-select-menu>
      </template>
    </fl-tooltip>
  </div>
</template>
<script setup lang="ts">
import {
  computed,
  getCurrentInstance,
  nextTick,
  onMounted,
  provide,
  reactive,
  toRefs,
  unref,
} from 'vue'
import { UPDATE_MODEL_EVENT } from '@follow-ui/constants'
import { useResizeObserver } from '@vueuse/core'
import { ClickOutside as vClickOutside } from '@follow-ui/directives'
import { useFocus, useLocale, useNamespace } from '@follow-ui/hooks'
import { selectKey } from '@follow-ui/tokens'
import { FlIcon } from '../../icon'
import { FlScrollbar } from '../../scrollbar'
import { FlTag } from '../../tag'
import { FlTooltip } from '../../tooltip'
import { selectEmits, selectProps, useSelect, useSelectStates } from './ts'
import FlSelectMenu from './select-dropdown.vue'
import FlOption from './option.vue'
import type { SelectContext } from '@follow-ui/tokens'

defineOptions({
  name: 'FlSelect',
})

const props = defineProps(selectProps)
const emit = defineEmits(selectEmits)
const ctx = getCurrentInstance()

const nsSelect = useNamespace('select')
const nsInput = useNamespace('input')
const { t } = useLocale()

const states = useSelectStates(props)

const {
  optionsArray,
  selectSize,
  readonly,
  handleResize,
  collapseTagSize,
  debouncedOnInputChange,
  debouncedQueryChange,
  deletePrevTag,
  deleteTag,
  deleteSelected,
  handleOptionSelect,
  scrollToOption,
  setSelected,
  resetInputHeight,
  managePlaceholder,
  showClose,
  selectDisabled,
  iconComponent,
  iconReverse,
  showNewOption,
  emptyText,
  toggleLastOptionHitState,
  resetInputState,
  handleComposition,
  onOptionCreate,
  onOptionDestroy,
  handleMenuEnter,
  handleFocus,
  blur,
  handleBlur,
  handleClearClick,
  handleClose,
  handleKeydownEscape,
  toggleMenu,
  selectOption,
  getValueKey,
  navigateOptions,
  dropMenuVisible,
  reference,
  input,
  tooltipRef,
  tags,
  selectWrapper,
  scrollbar,
  queryChange,
  groupQueryChange,
} = useSelect(props, states, ctx)

const { focus } = useFocus(reference)

const {
  inputWidth,
  selected,
  inputLength,
  filteredOptionsCount,
  visible,
  softFocus,
  selectedLabel,
  hoverIndex,
  query,
  inputHovering,
  currentPlaceholder,
  menuVisibleOnFocus,
  isOnComposition,
  isSilentBlur,
  options,
  cachedOptions,
  optionsCount,
  prefixWidth,
  tagInMultiLine,
} = toRefs(states)

//class数组
const wrapperKls = computed(() => {
  const classList = [nsSelect.b()]
  const _selectSize = unref(selectSize)
  if (_selectSize) {
    classList.push(nsSelect.m(_selectSize))
  }
  if (props.disabled) {
    classList.push(nsSelect.m('disabled'))
  }
  return classList
})

//设置tags最大宽度,inputWidth - clear按钮
const selectTagsStyle = computed(() => ({
  maxWidth: `${unref(inputWidth) - 20}px`,
  width: '100%',
}))

const popperPaneRef = computed(() => {
  return tooltipRef.value?.popperRef?.contentRef
})

//设置折叠tag文本的最大宽度
const tagTextStyle = computed(() => {
  const maxWidth =
    unref(inputWidth) > 123 ? unref(inputWidth) - 123 : unref(inputWidth) - 75
  return { maxWidth: `${maxWidth}px` }
})

provide(
  selectKey,
  reactive({
    props,
    options,
    optionsArray,
    cachedOptions,
    optionsCount,
    filteredOptionsCount,
    hoverIndex,
    handleOptionSelect,
    onOptionCreate,
    onOptionDestroy,
    selectWrapper,
    selected,
    setSelected,
    queryChange,
    groupQueryChange,
  }) as unknown as SelectContext
)

//挂载
onMounted(() => {
  //初始化cachedPlaceHolder
  states.cachedPlaceHolder = currentPlaceholder.value =
    props.placeholder || t('fl.select.placeholder')

  //如果是多选且有值,清空当前占位符
  if (
    props.multiple &&
    Array.isArray(props.modelValue) &&
    props.modelValue.length > 0
  ) {
    currentPlaceholder.value = ''
  }
  //监听selectWrapper,调用handleResize
  useResizeObserver(selectWrapper, handleResize)

  //如果是远程搜索以及多选,重置input高度
  if (props.remote && props.multiple) {
    resetInputHeight()
  }

  nextTick(() => {
    //如果没有ref节点,返回
    const refEl = reference.value && reference.value.$el
    if (!refEl) return
    //否则设置inputWidth为refEl.getBoundingClientRect().width
    inputWidth.value = refEl.getBoundingClientRect().width

    //如果有prefix插槽, 修改prefixWidth
    if (ctx?.slots.prefix) {
      //获取前缀插槽dom
      const prefix = refEl.querySelector(`.${nsInput.e('prefix')}`)
      //设置prefixWidth
      prefixWidth.value = Math.max(prefix.getBoundingClientRect().width + 5, 30)
    }
  })
  //设置选中
  setSelected()
})

//多选但传入modelValue不是数组时使modelValue = []
if (props.multiple && !Array.isArray(props.modelValue)) {
  emit(UPDATE_MODEL_EVENT, [])
}
//不是多选但传入modelValue是数组时使modelValue = ''
if (!props.multiple && Array.isArray(props.modelValue)) {
  emit(UPDATE_MODEL_EVENT, '')
}

defineExpose({
  popperPaneRef,
  softFocus,
  menuVisibleOnFocus,
  isOnComposition,
  isSilentBlur,
  blur,
  focus,
  toggleLastOptionHitState,
  deleteSelected,
  scrollToOption,
})
</script>
