<template>
  <fl-form ref="formRef" label-width="100px" :model="form" :rules="formRules">
    <fl-form-item label="姓名" prop="name">
      <fl-input v-model="form.name" />
    </fl-form-item>
    <fl-form-item label="出生日期" prop="birthday">
      <fl-date-picker v-model="form.birthday" />
    </fl-form-item>
    <fl-form-item label="性别" prop="sex">
      <fl-radio-group v-model="form.sex">
        <fl-radio label="男" />
        <fl-radio label="女" />
        <fl-radio label="未知" />
      </fl-radio-group>
    </fl-form-item>
    <fl-form-item>
      <fl-button type="primary" @click="onSubmit(formRef)">确定</fl-button>
      <fl-button @click="onReset(formRef)">重置</fl-button>
    </fl-form-item>
  </fl-form>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import type { FormInstance } from 'follow-ui'
const formRef = ref<FormInstance>()
const rawForm = {
  name: '',
  birthday: '',
  sex: '',
}
const form = reactive({
  ...rawForm,
})

const formRules = reactive({
  name: [
    { required: true, message: '姓名是必填项', trigger: 'blur' },
    { max: 5, message: '长度必须在 3 到 5 之间', trigger: 'blur' },
  ],
  birthday: [
    {
      required: true,
      message: '出生日期是必填项',
      trigger: 'blur',
    },
  ],
  sex: [{ required: true, message: '性别是必填项', trigger: 'change' }],
})

const onSubmit = async (formRef: FormInstance) => {
  if (!formRef) return
  await formRef.validate((valid, fields) => {
    if (valid) {
      console.log('submit!')
    } else {
      console.log('error submit!', fields)
    }
  })
}
const onReset = (formRef: FormInstance) => {
  Object.keys(rawForm).forEach((item) => {
    form[item] = rawForm[item]
  })
  formRef.resetFields()
}
</script>
