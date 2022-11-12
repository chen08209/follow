import { createApp } from 'vue'
import follow from '@follow-ui/follow-ui/index'
import '@follow-ui/theme-chalk/src/index.scss'
import App from './src/App.vue'
createApp(App).use(follow).mount('#app')
