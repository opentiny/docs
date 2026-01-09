<template>
  <div class="opentiny-next-layout">
    <!-- 自定义顶部导航栏 -->
    <CustomHeader />

    <!-- 主内容区域 -->
    <div class="main-content">
      <ThemeProvider :color-mode="colorMode">
        <DefaultLayout>
            <template #doc-before>
              <div class="doc-title">
                  {{docTitle}}
              </div>
          </template>
        </DefaultLayout>
      </ThemeProvider>
    </div>
  </div>
</template>

<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { ThemeProvider } from '@opentiny/tiny-robot'
import { onMounted, onUnmounted, ref,computed,watch } from 'vue' 
import { colorModeSubject } from './color-mode'
import CustomHeader from './components/CustomHeader.vue'
import { useData, useRoute, useRouter } from 'vitepress'

// 创建响应式的 colorMode 值
const colorMode = ref<'light' | 'dark' | 'auto'>('auto')
const docTitle = ref('指南')

// 获取 VitePress 数据
const { site,theme } = useData()
const route = useRoute()
const themeConfig = computed(() => theme.value)
const router = useRouter();

// 在客户端环境下同步 ColorModeSubject
if (typeof window !== 'undefined') {
  let unsubscribe: (() => void) | undefined = undefined

  onMounted(() => {
    // 订阅 ColorModeSubject 的变化
    unsubscribe = colorModeSubject.subscribe((mode) => {
      colorMode.value = mode
    })
  })

  // 组件卸载时取消订阅
  onUnmounted(() => {
    unsubscribe?.()
  })
}

// 获取 VitePress 默认布局组件
const DefaultLayout = DefaultTheme.Layout

// 定义重定向映射
const redirectMap = [
  { 
    patterns: ['/tiny-engine.html', '/tiny-engine/', '/tiny-engine/guide.html', '/tiny-engine/guide/'],
    target: '/tiny-engine/guide/introduction'
  },
  { 
    patterns: ['/tiny-engine/dev/', '/tiny-engine/dev.html'],
    target: '/tiny-engine/dev/dev-intro'
  },
  { 
    patterns: ['/tiny-engine/portal/', '/tiny-engine/portal.html'],
    target: '/tiny-engine/portal/ecosystem-intro'
  },
  { 
    patterns: ['/tiny-vue.html', '/tiny-vue/', '/tiny-vue/guide.html', '/tiny-vue/guide/'],
    target: '/tiny-vue/guide/introduce'
  },
  { 
    patterns: ['/tiny-robot.html', '/tiny-robot/', '/tiny-robot/guide.html', '/tiny-robot/guide/'],
    target: '/tiny-robot/guide/quick-start'
  },
  { 
    patterns: ['/tiny-robot/examples/', '/tiny-robot/examples.html'],
    target: '/tiny-robot/examples/assistant'
  },
  { 
    patterns: ['/next-sdk.html', '/next-sdk/'],
    target: '/next-sdk/guide'
  },
  { 
    patterns: ['/genui-sdk.html', '/genui-sdk/', '/genui-sdk/guide.html', '/genui-sdk/guide/'],
    target: '/genui-sdk/guide/installation'
  }
];

// 将文档标题更新逻辑提取为独立函数，便于维护和测试
const updateDocTitle = () => {
  const base = site.value?.base || '/'
  const path = route.path.replace(new RegExp(`^${base}`), '/')
  const cfg = themeConfig.value || {}

  for (const { patterns, target } of redirectMap) {
    if (patterns.includes(path)) {
      router.go(target);
      break;
    }
  }

  // next-sdk / tiny-vue: 从对应 sidebar 的 guide 中寻找匹配项
  if (path.includes('/next-sdk/') || path.includes('/tiny-vue/')) {
    let sidebarConfig: any[] = []
    if (path.includes('/next-sdk/')) {
      sidebarConfig = cfg.sidebar?.['/next-sdk/guide/'] || []
    } else if (path.includes('/tiny-vue/')) {
      sidebarConfig = cfg.sidebar?.['/tiny-vue/guide/'] || []
    }

    if (!sidebarConfig || !sidebarConfig.length) {
      docTitle.value = '指南'
      return
    }

    const pathIndex = sidebarConfig.findIndex((child: any) =>
      child.items?.some((item: any) => item?.link && path.includes(item.link))
    )

    docTitle.value = sidebarConfig[pathIndex >= 0 ? pathIndex : 0]?.text || '指南'
    return
  }

  // tiny-robot: 从 nav 中匹配 activeMatch
  if (path.includes('/tiny-robot/')) {
    const navConfig = cfg.nav || []
    if (!navConfig.length) {
      docTitle.value = ''
      return
    }
    const match = navConfig.find((item: any) => item?.activeMatch && path.includes(item.activeMatch))
    docTitle.value = match?.text || ''
    return
  }

  // tiny-engine: 需要先找到对应的 engineNav，然后查 sidebar 的二级或三级项
  if (path.includes('/tiny-engine/')) {
    const engineNavConfig = cfg.engineNav || []
    if (!engineNavConfig.length) {
      docTitle.value = ''
      return
    }

    const activeNav = engineNavConfig.find((item: any) => item?.activeMatch && path.includes(item.activeMatch))
    const engineSidebarConfig = cfg.sidebar?.[`/tiny-engine${activeNav?.activeMatch}`] || []
    if (!engineSidebarConfig.length) {
      docTitle.value = ''
      return
    }

    let enginePathkey = 0
    let engineDeepPathkey: number | null = null

    engineSidebarConfig.forEach((child: any, key: number) => {
      child.items?.forEach((item: any, deepKey: number) => {
        if (item?.items?.length) {
          const foundDeep = item.items.find((deepItem: any) => deepItem?.link && path.includes(deepItem.link))
          if (foundDeep) {
            enginePathkey = key
            engineDeepPathkey = deepKey
          }
        } else if (item?.link && path.includes(item.link)) {
          enginePathkey = key
        }
      })
    })

    if (engineDeepPathkey !== null) {
      docTitle.value = engineSidebarConfig[enginePathkey].items?.[engineDeepPathkey]?.text || ''
    } else {
      docTitle.value = engineSidebarConfig[enginePathkey]?.text || ''
    }

    return
  }

  // 默认情况：清空标题
  docTitle.value = ''
}

// 监听路由变更，初始化并同步标题
watch(
  () => route.path,
  updateDocTitle,
  { deep: true, immediate: true }
)
</script>

<style scoped>
.opentiny-next-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
}

.doc-title{
  color: #1476ff;
  margin-top: 0.125rem;
  margin-bottom: 10px;
  font-weight: 600;
  font-size: 0.875rem;
  line-height: 1.25rem;
}
</style>
