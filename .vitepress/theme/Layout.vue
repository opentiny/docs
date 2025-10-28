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

watch(
  () => route.path,
  () => {
      const path = route.path.replace(new RegExp(`^${site.value.base}`), '/')
      if(path.includes('/next-sdk/')){
        let pathkey = 0;
        const sidebarConfig = themeConfig.value.sidebar['/next-sdk/guide/'];
        if(!sidebarConfig) {
          docTitle.value = '指南'
          return;
        };
        sidebarConfig.forEach((child,key) => {
          child.items.forEach(item => {
            if(path.includes(item.link)){
              pathkey = key
            }
          });
        });
        docTitle.value =  sidebarConfig[pathkey]?.text || '指南'
      }else if(path.includes('/tiny-robot/')){
        const navConfig = themeConfig.value.nav;
        if(!navConfig) {
          docTitle.value = ''
          return;
        };
        navConfig.forEach(item => {
          if(path.includes(item.activeMatch)){
            docTitle.value = item.text
          }
        });
      }else{
        docTitle.value = ''
      }
  },
  { deep: true ,immediate:true},
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
