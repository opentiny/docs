import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'vitepress'
import { vitepressDemoPlugin } from 'vitepress-demo-plugin'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const resolveSubmoduleRelativePathsPlugin = (options: { source: string; target: string }[] = []) => ({
  name: 'resolve-submodule-relative-paths',
  // source: 导入的路径，例如 '../../demos/attachments/basic.vue'
  // importer: 发起导入的文件路径，例如 '.../docs/project-a/docs/src/components/bubble.md'
  resolveId(source, importer) {

    const index = options.findIndex(option => source.includes(option.source))
    if (index !== -1) {
      return source.replace(options[index].source, options[index].target || '')
    }
    // 如果不满足条件，则不处理
    return null
  },
})

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'OpenTiny NEXT',
  description: 'OpenTiny NEXT',
  outDir: 'dist',
  srcExclude: ['**/README.md'],
  base: process.env.VITEPRESS_BASE || '/',
  head: [['link', { rel: 'icon', href: '/logo-mini.svg' }]],
  vite: {
    plugins: [vueJsx(), resolveSubmoduleRelativePathsPlugin([{
      source: path.resolve(rootDir, 'demos'),
      target: path.resolve(rootDir, 'tiny-robot/docs/demos'),
    }])],
    server: { open: true },
    resolve: {
      alias: {
        '@opentiny/tiny-robot-style': '../../tiny-robot/packages/components/dist/style.css',
      },
    },
  },
  markdown: {
    config: (md) => {
      md.use(vitepressDemoPlugin)
    },
  },
  rewrites: {
    'tiny-robot/docs/src/:path*': 'tiny-robot/:path*',
    'next-sdk/docs/:path*': 'next-sdk/:path*',
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo-mini.svg',
    siteTitle: 'OpenTiny NEXT',
    nav: [
      { text: '指南', link: '/tiny-robot/guide/installation', activeMatch: '/guide/' },
      { text: '组件', link: '/tiny-robot/components/bubble', activeMatch: '/components/' },
      { text: '工具', link: '/tiny-robot/tools/ai-client', activeMatch: '/tools/' },
      { text: '演示', link: '/tiny-robot/examples/assistant', activeMatch: '/examples/' },
    ],
    sidebar: {
      '/tiny-robot/components/': [
        {
          text: '组件',
          base: '/tiny-robot/components/',
          items: [
            { text: 'Container 容器', link: 'container' },
            { text: 'Bubble 气泡', link: 'bubble' },
            { text: 'Sender 消息输入框', link: 'sender' },
            { text: 'Prompts 提示集', link: 'prompts' },
            { text: 'Welcome 欢迎', link: 'welcome' },
            { text: 'Feedback 气泡反馈', link: 'feedback' },
            { text: 'History 历史', link: 'history' },
            { text: 'DropdownMenu 下拉菜单', link: 'dropdown-menu' },
            { text: 'SuggestionPopover 建议弹出框', link: 'suggestion-popover' },
            { text: 'SuggestionPills 建议按钮组', link: 'suggestion-pills' },
            { text: 'DragOverlay 拖拽浮层', link: 'drag-overlay' },
            { text: 'Attachments 附件卡片', link: 'attachments' },
            { text: 'McpServerPicker 插件选择器', link: 'mcp-server-picker' },
            { text: 'Theme 主题', link: 'theme' },
          ],
        },
      ],
      '/tiny-robot/tools/': [
        {
          text: '工具',
          base: '/tiny-robot/tools/',
          items: [
            { text: 'AI模型交互工具类', link: 'ai-client' },
            { text: '消息数据管理', link: 'message' },
            { text: '会话数据管理', link: 'conversation' },
          ],
        },
      ],
      '/next-sdk/guide/': [
        {
          text: '介绍',
          items: [
            { text: '开始', link: '/next-sdk/guide/' },
          ]
        },
        {
          text: '指引',
          base: '/next-sdk/guide/',
          items: [
            { text: '接入三方 AI 应用', link: 'mcp-host' },
            { text: 'Electron 应用接入', link: 'electron' },
            { text: 'uni-app 应用接入', link: 'uni-app' },
            { text: '本地连接', link: 'connect-local' },
          ]
        },
        {
          text: 'NEXT-SDKs API',
          base: '/next-sdk/guide/',
          items: [
            { text: 'WebMcpClient 类', link: 'api-client' },
            { text: 'WebMcpServer 类', link: 'api-server' },
            { text: 'AgentModelProvider 类', link: 'api-agentModelProvider' },
            { text: 'createRemoter 函数', link: 'api-createRemoter' },
            { text: '工具函数', link: 'api-tools' }
          ]
        },
        {
          text: 'TinyRemoter for Vue',
          base: '/next-sdk/guide/',
          items: [{ text: 'TinyRobot 版本', link: 'tiny-robot-remoter' }]
        }
      ],
    },
    search: {
      provider: 'local',
    },
  },
})
