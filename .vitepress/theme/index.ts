import { generateStore, getDefaultFiles } from '@opentiny/tiny-robot-playground/utils'
import DefaultTheme from 'vitepress/theme'
import { enhanceAppWithTabs } from 'vitepress-plugin-tabs/client'
import { setupDarkModeListener } from './color-mode'
import Layout from './Layout.vue'
import HomePage from './home/index.vue'
import CustomTable from './components/CustomTable.vue'
import '@opentiny/tiny-robot-style'
import {nextTick, watch} from 'vue';
import {useRoute} from 'vitepress';
import mediumZoom from 'medium-zoom';
import { insertFurion } from './insert-furion'
// 引入样式文件
import './medium-zoom.css';
import './style.css'

declare global {
  interface Window {
    __SW_REGISTERED__?: boolean
    __CODE_PLAYGROUND_LISTENED__?: boolean
  }
}

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    // 监听暗黑模式变化
    setupDarkModeListener()
    // 添加 furion 监控埋点
    insertFurion()

    app.mixin({
      mounted() {
        registerServiceWorker()
        listenCodePlaygroundEvent()
      },
    })
    app.component('HomePage', HomePage)
    app.component('CustomTable', CustomTable)
    enhanceAppWithTabs(app)
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
        if (typeof window !== 'undefined'){
          zomm = mediumZoom('.main img', {background: 'var(--vp-c-bg)'})
        }
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

function listenCodePlaygroundEvent() {
  if (typeof window === 'undefined' || window.__CODE_PLAYGROUND_LISTENED__) {
    return
  }

  window.__CODE_PLAYGROUND_LISTENED__ = true
  document.addEventListener('code-playground', (event) => {
    const detail = (event as CustomEvent).detail
    if (!detail) return
    const { props, currentFiles, activeFile } = detail

    const files: { filename: string; code: string }[] = []

    if (Object.keys(currentFiles).length === 0) {
      files.push({
        filename: 'src/App.vue',
        code: props.vueCode,
      })
    } else {
      files.push({
        filename: 'src/App.vue',
        code: currentFiles[activeFile].code,
      })

      Object.entries(currentFiles).forEach(([filename, file]) => {
        if (filename === activeFile) return
        files.push({ filename: `src/${filename}`, code: (file as { code: string }).code })
      })
    }

    const tinyRobotVersion = 'latest'
    const defaultFiles = getDefaultFiles({ tinyRobotVersion })
    const cssFile = defaultFiles.find((file) => file.filename === 'src/index.css')
    if (cssFile) {
      files.push(cssFile)
    }

    const extraPackages: string[] = JSON.parse(decodeURIComponent(props.playground))?.packages || []
    const extraImports = extraPackages
      .map((pkgAndVersion) => {
        const index = pkgAndVersion.lastIndexOf('@')
        const pkg = pkgAndVersion.slice(0, index)
        const version = pkgAndVersion.slice(index + 1)
        return { [pkg]: version }
      })
      .reduce((acc, curr) => {
        return { ...acc, ...curr }
      }, {})

    const { store } = generateStore({
      tinyRobotVersion,
      files,
      extraImports,
    })

    window.open(`https://playground.opentiny.design/tiny-robot.html` + store.serialize(), '_blank')
  })
}
