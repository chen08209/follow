<template>
  <p>
    <fl-radio-group v-model="labelPosition">
      <fl-radio-button label="left">Left</fl-radio-button>
      <fl-radio-button label="right">Right</fl-radio-button>
      <fl-radio-button label="top">Top</fl-radio-button>
    </fl-radio-group>
  </p>
  <fl-form label-width="100px" :model="form" :label-position="labelPosition">
    <fl-form-item label="姓名">
      <fl-input v-model="form.name" />
    </fl-form-item>
    <fl-form-item label="出生日期">
      <fl-date-picker v-model="form.birthday" />
    </fl-form-item>
    <fl-form-item label="用途">
      <fl-select v-model="form.use">
        <fl-option label="测试" value="test" />
        <fl-option label="收集数据" value="data" />
      </fl-select>
    </fl-form-item>
    <fl-form-item label="性别">
      <fl-radio-group v-model="form.sex">
        <fl-radio label="男" />
        <fl-radio label="女" />
        <fl-radio label="未知" />
      </fl-radio-group>
    </fl-form-item>
    <fl-form-item label="爱好">
      <fl-checkbox-group v-model="form.preference">
        <fl-checkbox label="游戏" />
        <fl-checkbox label="足球" />
        <fl-checkbox label="游泳" />
        <fl-checkbox label="其他" />
      </fl-checkbox-group>
    </fl-form-item>
    <fl-form-item label="是否工作">
      <fl-switch v-model="form.work" />
    </fl-form-item>
    <fl-form-item>
      <fl-button type="primary" @click="onSubmit">确定</fl-button>
      <fl-button @click="onReset">重置</fl-button>
    </fl-form-item>
  </fl-form>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
const labelPosition = ref('top')
const rawForm = {
  name: '',
  birthday: '',
  use: '',
  work: false,
  sex: '',
  preference: [],
}
const form = reactive({
  ...rawForm,
})

const onSubmit = () => {
  console.log(form)
}
const onReset = () => {
  Object.keys(rawForm).forEach((item) => {
    form[item] = rawForm[item]
  })
}
</script>
