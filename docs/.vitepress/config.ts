import { mdPlugin } from './config/plugins'

let base = '/'
if (process.env.NODE_ENV === 'production') {
  base = '/follow/'
}

const head = [['link', { ref: 'icon', href: 'favicon.ico' }]]
const nav = [
  { text: '指南', link: '/guide/characteristic', activeMatch: '/guide/' },
  { text: '组件', link: '/components/button', activeMatch: '/components/' },
]
const sidebar = {
  '/guide/': [
    {
      text: '前言',
      items: [
        {
          text: '特色',
          link: '/guide/characteristic',
        },
      ],
    },
    {
      text: '基础',
      items: [
        {
          text: '安装',
          link: '/guide/installation',
        },
        {
          text: '快速开始',
          link: '/guide/quickstart',
        },
      ],
    },
  ],
  '/components/': [
    {
      text: '基础组件',
      items: [
        {
          text: '按钮',
          link: '/components/button',
        },
        {
          text: '开关',
          link: '/components/switch',
        },
        {
          text: '单选框',
          link: '/components/radio',
        },
        {
          text: '多选框',
          link: '/components/checkbox',
        },
        {
          text: '输入框',
          link: '/components/input',
        },
        {
          text: '选择器',
          link: '/components/select',
        },
        {
          text: '颜色选择器',
          link: '/components/color',
        },
        {
          text: '日期选择器',
          link: '/components/date',
        },
        {
          text: '时间选择器',
          link: '/components/time',
        },
        {
          text: '日期时间选择器',
          link: '/components/datetime',
        },
      ],
    },
    {
      text: '组合组件',
      items: [
        {
          text: '表单',
          link: '/components/form',
        },
        {
          text: '表格',
          link: '/components/table',
        },
      ],
    },
  ],
}
export default {
  title: 'Follow',
  srcDir: 'src',
  base: base,
  head,
  themeConfig: {
    logo: {
      light: '/logo-light.svg',
      dark: '/logo-dark.svg',
    },
    docFooter: { prev: '上一页', next: '下一页' },
    outlineTitle: '本页目录',
    nav,
    sidebar,
  },
  vite: {
    server: {
      host: true,
    },
  },
  markdown: {
    config: (md) => mdPlugin(md),
  },
}
