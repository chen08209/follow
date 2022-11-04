import '../vitepress/styles/fonts.css'
import '../vitepress/styles/vars.css'
import '../vitepress/styles/base.css'
import '../vitepress/styles/utils.css'
import '../vitepress/styles/components/custom-block.css'
import '../vitepress/styles/components/vp-code.css'
import '../vitepress/styles/components/vp-doc.css'
import '../vitepress/styles/components/vp-sponsor.css'
import '../vitepress/styles/components/vp-sponsor.css'
import './scss/base.scss'
import './scss/code.scss'
import NotFound from './NotFound.vue'
import Layout from './Layout.vue'
import Demo from './demo/Demo.vue'
import Code from './demo/Code.vue'
import follow from 'follow-ui'
import 'follow-ui/dist/index.css'
import { installExamples } from './utils'

export default {
  Layout,
  NotFound,
  enhanceApp: ({ app }) => {
    app.use(follow)
    installExamples(app)
    app.component('Demo', Demo)
    app.component('Code', Code)
  },
}
