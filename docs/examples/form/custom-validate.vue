<template>
  <fl-form
    ref="formRef"
    label-width="100px"
    :model="form"
    :rules="formRules"
    label-position="left"
  >
    <fl-form-item label="密码" prop="password">
      <fl-input v-model="form.password" show-password />
    </fl-form-item>
    <fl-form-item label="确认密码" prop="confirmPassword">
      <fl-input v-model="form.confirmPassword" show-password />
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
  password: '',
  confirmPassword: '',
}
const form = reactive({
  ...rawForm,
})

const validatePass = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error('请输入密码'))
  } else {
    callback()
  }
}

const validateConfirmPass = (rule: any, value: any, callback: any) => {
  if (!form.password) {
    callback(new Error('请先输入密码'))
  } else if (value !== form.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const formRules = reactive({
  password: [{ validator: validatePass, trigger: 'blur' }],
  confirmPassword: [{ validator: validateConfirmPass, trigger: 'blur' }],
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
