<template>
  <main class="home">
    <div class="hero">
      <h1 class="title">
        <Transition name="up1" appear>
          <span class="clip">"暂时"</span>
        </Transition>
        <Transition name="up2" appear>
          <span class="common">没有任何意义的</span>
        </Transition>
        <Transition name="up2" appear>
          <span class="common">Vue3组件库</span>
        </Transition>
        <Transition name="up3" appear>
          <span class="comment">当然, 也可能不只是暂时</span>
        </Transition>
      </h1>
      <Transition name="up4" appear>
        <div class="actions">
          <a :href="site.base + 'guide/characteristic.html'" class="action">
            <fl-button type="primary" :ripple="false">
              快速开始
              <fl-icon class="icon"><ArrowRight /></fl-icon>
            </fl-button>
          </a>
          <div class="action">
            <fl-button
              ref="cliButton"
              @blur="isCopied = false"
              @click="handlerCopy"
            >
              npm i follow-ui
              <fl-icon class="icon">
                <component :is="isCopied ? Check : CopyDocument"
              /></fl-icon>
            </fl-button>
          </div>
        </div>
      </Transition>
    </div>
    <Transition name="slide" appear>
      <div class="features">
        <a
          v-for="item in cards"
          :key="item.label"
          class="feature"
          :href="site.base + item.link"
        >
          <div class="container">
            <div class="icon">{{ item.icon }}</div>
            <p class="title">{{ item.label }}</p>
            <p class="content">{{ item.content }}</p>
          </div>
        </a>
      </div>
    </Transition>
  </main>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useData } from 'vitepress'
import { ArrowRight, Check, CopyDocument } from '@element-plus/icons-vue'

const { site } = useData()
const cliButton = ref()
const isCopied = ref(false)
const cards = [
  {
    label: '指引',
    content: '安装以及基本使用, 快速体验封装框架',
    icon: '⚡️',
    link: 'guide/characteristic.html',
  },
  {
    label: '组件',
    content: '预览, 体验组件交互细节, 便于快速开发',
    icon: '📦',
    link: 'components/button.html',
  },
  {
    label: '更多',
    content: '了解更多详细信息',
    icon: '💡',
    link: '',
  },
]
const handlerCopy = async () => {
  const text = (cliButton.value.ref as HTMLSpanElement).textContent?.trim()
  if (text) {
    try {
      await navigator.clipboard.writeText(text)
      isCopied.value = true
    } catch (err) {
      console.error(err)
    }
  }
}
</script>
<style scoped lang="scss">
@use 'scss/gobal.scss' as *;
@media (min-width: 768px) {
  .hero {
    align-items: flex-start !important;
    text-align: start !important;
    padding: 0 1rem !important;
    flex-basis: 50% !important;
    .title {
      font-size: 4rem;
    }
  }
  .home::before {
    filter: blur(200px) !important;
  }
}
.home {
  @include flex;
  justify-content: space-between;
  height: calc(100vh - var(--vp-nav-height));
  box-sizing: border-box;
  max-width: calc(var(--vp-layout-max-width) - 64px);
  width: 100%;
  overflow-x: hidden;
  height: 100%;
  padding: 4rem 0;
  padding-bottom: 3rem;
  flex-wrap: wrap;
  .hero {
    @include flex;
    flex-flow: column;
    flex-grow: 1;
    flex-basis: 100%;
    text-align: center;
    padding: 0 1rem 3rem 0;
    box-sizing: border-box;
    // overflow: hidden;
    .title {
      width: max-content;
      line-height: 5.75rem;
      font-size: 3.5rem;
      display: flex;
      font-weight: 800;
      flex-flow: column;
      margin: 0;
      .clip {
        font-size: 5rem;
        background: linear-gradient(to right, #0099ff, #056de8);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .comment {
        font-size: 1rem;
        font-weight: 400;
      }
    }
    .actions {
      @include flex;
      margin: 0;
      color: #ffffff;
      .action {
        .fl-button {
          height: 4rem;
          font-size: calc(1rem + 2px);
          border-radius: 10px;
          .icon {
            margin-left: 15px;
          }
        }
        &:last-child {
          margin-left: 1rem;
        }
      }
    }
  }
  .features {
    @include flex;
    flex-wrap: wrap;
    flex-grow: 1;
    flex-basis: 50%;
    box-sizing: border-box;
    position: relative;
    opacity: 0.9;
    .feature {
      height: 50%;
      cursor: pointer;
      padding: 1rem;
      box-sizing: border-box;
      .container {
        box-sizing: border-box;
        background-color: var(--bg-color-soft);
        backdrop-filter: saturate(50%) blur(200px);
        height: 100%;
        width: 100%;
        position: relative;
        border-radius: 0.8rem;
        bottom: 0;
        line-height: 2rem;
        padding: 2rem;
        border: 1px solid var(--fl-border-color-light);

        .icon {
          @include flex;
          height: 4rem;
          width: 4rem;
          border-radius: 0.6rem;
          font-size: 2rem;
          background: var(--bg-color-deep);
          margin-bottom: 1rem;
        }
        .title {
          font-weight: 600;
          font-size: calc(1rem + 4px);
        }
        .content {
          font-size: 1rem;
          color: var(--text-color-2);
        }
      }
      .container:hover {
        background-color: var(--bg-color);
      }

      &:nth-child(1) {
        width: 100%;
      }
      &:nth-child(2) {
        width: 60%;
      }
      &:nth-child(3) {
        width: 40%;
      }
    }
  }
}
.home::before {
  content: '';
  position: absolute;
  pointer-events: none;
  left: 50%;
  transform: translate(-50%, -50%);
  height: 10%;
  width: 100vw;
  background: #0099ff;
  filter: blur(100px);
  will-change: transform;
}

.slide-enter-active {
  animation: slide 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes slide {
  0% {
    transform: translateX(200px);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

.up1-enter-active {
  animation: up 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.up2-enter-active {
  animation: up 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.up3-enter-active {
  animation: up 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.up4-enter-active {
  animation: up 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes up {
  0% {
    transform: translateY(200px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
