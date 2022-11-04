# 快速开始

本节将介绍如何在项目中快速使用 follow-ui

## 具体用法

:::code ts

import { createApp } from 'vue'
import follow from 'follow-ui'
import 'follow-ui/dist/index.css'
import App from './App.vue'

const app = createApp(App)

app.use(follow)
app.mount('#app')

:::

## Volar 支持

使用 Volar 时，请在 tsconfig.json 中通过 compilerOptions.type 指定全局组件类型。

:::code json

// tsconfig.json
{
  "compilerOptions": {
    // ...
    "types": ["follow-ui/global"]
  }
}

:::
