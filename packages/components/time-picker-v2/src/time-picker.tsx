import { defineComponent} from "vue";
import { FlPicker,pickerProps } from "../../picker";
import TimePanel from "./time-panel.vue";
import { disabledTimeListsProps } from "./props";

export default defineComponent({
    name: 'FlTimePicker2',
    install: null,
    props: {
        ...pickerProps,
        ...disabledTimeListsProps
    },
    emits: ['update:modelValue'],
    setup(props,ctx) {
        const mode = 'time'
        const modelUpdater = (value: any) => ctx.emit('update:modelValue', value)
        return () => {
            return (
                <FlPicker {...props} mode={mode} onUpdate:modelValue={modelUpdater}>
                    {{
                        default: (props: any) => <TimePanel {...props} />,
                    }}
                </FlPicker>
            )
        }
    }
})