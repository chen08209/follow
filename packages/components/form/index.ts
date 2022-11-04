import { withInstall, withNoopInstall } from '@follow-ui/utils'
import Form from './src/form.vue'
import FormItem from './src/form-item.vue'

export const FlForm = withInstall(Form, {
  FormItem,
})
export default FlForm
export const FlFormItem = withNoopInstall(FormItem)

export * from './src/ts'

export type FormInstance = InstanceType<typeof Form>
export type FormItemInstance = InstanceType<typeof FormItem>
