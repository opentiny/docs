import type { ReplaceRule } from './map-link'

interface VitepressSource {
  kind: 'vitepress'
  id: string
  pages: string
  mount: string
  replace?: ReplaceRule[]
  ignore?: string[]
  aliasKeys?: string[]
  folderTitle?: Record<string, string>
  load: () => Promise<unknown>
}

interface DocMenusSource {
  kind: 'doc-menus'
  id: string
  pages: string
  key: string
  /** tiny-vue 的 menus.js。文件后半段依赖浏览器 location，这里只截取文档菜单再执行 */
  menuFile: string
  ignore?: string[]
  /** 菜单里没有、但本站需要排在最前的页面 */
  pin?: Array<{ slug: string; text?: string }>
}

interface MarkdownSource {
  kind: 'markdown'
  id: string
  pages: string
  key: string
  group: string
  ignore?: string[]
  order?: string[]
  toLink: (rel: string) => string
}

interface CatalogSource {
  kind: 'catalog'
  id: string
}

export type SidebarSource = VitepressSource | DocMenusSource | MarkdownSource | CatalogSource

/**
 * 侧边栏只在这里登记。
 * 子模块菜单或文档路径变化后，重新启动或构建就会重新读取，不用再改 config.mts。
 */
export const sidebarSources: SidebarSource[] = [
  {
    kind: 'vitepress',
    id: 'tiny-robot',
    pages: 'tiny-robot/docs/src',
    mount: '/tiny-robot',
    load: () => import('../../tiny-robot/docs/.vitepress/themeConfig.ts').then((mod) => mod.themeConfig.sidebar)
  },
  {
    kind: 'vitepress',
    id: 'next-sdk',
    pages: 'next-sdk/docs',
    mount: '/next-sdk',
    // 子模块目录名是 best-pratice，本站 rewrite 发布成 best-practice
    replace: [['/best-pratice/', '/best-practice/']],
    aliasKeys: ['/next-sdk/guide/'],
    load: () => import('../../next-sdk/docs/.vitepress/config.mts').then((mod) => mod.default.themeConfig?.sidebar)
  },
  {
    kind: 'vitepress',
    id: 'genui-sdk',
    pages: 'genui/genui-sdk/docs/src',
    mount: '/genui-sdk',
    ignore: ['en/**'],
    folderTitle: { schema: '协议规范' },
    load: () => import('../../genui/genui-sdk/docs/.vitepress/config/zh-theme.ts').then((mod) => mod.zhThemeConfig.sidebar)
  },
  {
    kind: 'doc-menus',
    id: 'tiny-vue',
    pages: 'tiny-vue/examples/sites/demos/pc/webdoc',
    key: '/tiny-vue/guide/',
    // 只在菜单解析失败、退回扫描目录时使用。正常路径以 menus.js 的 showScene 过滤为准
    ignore: ['*-en.md', 'aui-adapter.md', 'develop-demo.md', 'adapter.md', 'help.md'],
    pin: [{ slug: 'introduce', text: '简介' }],
    menuFile: 'tiny-vue/examples/sites/demos/pc/menus.js'
  },
  {
    kind: 'catalog',
    id: 'tiny-engine'
  },
  {
    kind: 'vitepress',
    id: 'tiny-editor',
    pages: 'tiny-editor/packages/docs/fluent-editor',
    mount: '/tiny-editor',
    replace: [['/docs/', '/']],
    load: () => import('../../tiny-editor/packages/docs/fluent-editor/.vitepress/sidebar.ts').then((mod) => mod.sidebar())
  },
  {
    kind: 'markdown',
    id: 'web-agent',
    pages: 'web-agent/docs',
    key: '/web-agent/guide/',
    group: '使用文档',
    order: ['getting-started', 'architecture', 'api-reference'],
    toLink: (rel) => `/web-agent/guide/${rel.replace(/\.md$/i, '')}`
  },
  {
    kind: 'markdown',
    id: 'tiny-pro',
    pages: 'tiny-pro/docs',
    key: '/tiny-pro/guide/',
    group: '使用文档',
    order: [
      'start',
      'quick-start',
      'back-end-guide',
      'front-end-guide',
      'directory',
      'menu',
      'newpage',
      'request',
      'international',
      'theme',
      'layout',
      'status',
      'permissions'
    ],
    toLink: (rel) => `/tiny-pro/guide/${rel.replace(/\.md$/i, '')}`
  }
]
