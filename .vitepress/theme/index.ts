import DefaultTheme from 'vitepress/theme'
import { setupDarkModeListener } from './color-mode'
import Layout from './Layout.vue'
import HomePage from './home/index.vue'
import CustomTable from './components/CustomTable.vue'
import '@opentiny/tiny-robot-style'
import {nextTick, watch} from 'vue';
import {useRoute} from 'vitepress';
import mediumZoom from 'medium-zoom';
// 引入样式文件
import './medium-zoom.css';
import './style.css'

declare global {
  interface Window {
    __SW_REGISTERED__?: boolean
  }
}

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    // 监听暗黑模式变化
    setupDarkModeListener()

    app.mixin({
      mounted() {
        registerServiceWorker()
      },
    })
    app.component('HomePage', HomePage)
    app.component('CustomTable', CustomTable)
  },
  Layout,
  setup() {
    // 为img元素添加点击放大功能
    const route = useRoute();
    let zomm: any = null;
    watch(
      () => route.path,
      () => nextTick(() => {
        if (zomm) {
          zomm.detach();
        }
        zomm = mediumZoom('.main img', {background: 'var(--vp-c-bg)'})
      }),
      {immediate: true}
    )
  },
}

function registerServiceWorker() {
  if (
    typeof window === 'undefined' ||
    typeof navigator === 'undefined' ||
    !('serviceWorker' in navigator) ||
    window.__SW_REGISTERED__
  ) {
    return
  }

  window.__SW_REGISTERED__ = true
  navigator.serviceWorker
    .register(import.meta.env.BASE_URL + 'sw.js')
    .then(() => {
      console.log('ServiceWorker registration successful')
    })
    .catch((err) => {
      console.log('ServiceWorker registration failed: ', err)
    })
}
