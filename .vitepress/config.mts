import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'vitepress'
import { vitepressDemoPlugin } from 'vitepress-demo-plugin'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const normalizePath = (path: string, targetStyle: 'windows' | 'linux' = 'linux') => {
  if (targetStyle === 'windows') {
    return path.replace(/\//g, '\\')
  }
  return path.replace(/\\/g, '/')
}

const resolveSubmoduleRelativePathsPlugin = (options: { source: string; target: string }[] = []) => ({
  name: 'resolve-submodule-relative-paths',
  // source: 导入的路径，例如 '../../demos/attachments/basic.vue'
  // importer: 发起导入的文件路径，例如 '.../docs/project-a/docs/src/components/bubble.md'
  resolveId(source, importer) {
    const targetStyle = source.includes('\\') ? 'windows' : 'linux'
    const index = options.findIndex(option => source.includes(normalizePath(option.source, targetStyle)))
    if (index !== -1) {
      return source.replace(normalizePath(options[index].source, targetStyle), normalizePath(options[index].target || '', targetStyle))
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
    'tiny-vue/examples/sites/demos/pc/webdoc/:path*': 'tiny-vue/guide/:path*',
    'tiny-engine/docs/:section(getting-started|basic-features|advanced-features|tutorials)/:path*': 'tiny-engine/engines/:path*',
    'tiny-engine/docs/:section(practical-cases|api|extension-capabilities-tutorial|development-getting-started|changelog|solutions|extension-capabilities-overview)/:path*': 'tiny-engine/dev/:path*',
    'tiny-engine/docs/:section(ecosystem-center|about-applications|about-materials|about-designer)/:path*': 'tiny-engine/portal/:path*',
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo-mini.svg',
    siteTitle: 'OpenTiny NEXT',
    nav: [
      { text: '指南', link: '/tiny-robot/guide/quick-start', activeMatch: '/guide/' },
      { text: '组件', link: '/tiny-robot/components/bubble', activeMatch: '/components/' },
      { text: '工具', link: '/tiny-robot/tools/ai-client', activeMatch: '/tools/' },
      { text: '演示', link: '/tiny-robot/examples/assistant', activeMatch: '/examples/' },
    ],
    engineNav: [
      { text: '使用指南', link: '/tiny-engine/engines/introduction', activeMatch: '/engines/' },
      { text: '平台开发指南', link: '/tiny-engine/dev/dev-intro', activeMatch: '/dev/' },
      { text: '网站文档', link: '/tiny-engine/portal/ecosystem-intro', activeMatch: '/portal/' },
    ],
    sidebar: {
      '/tiny-robot/guide/': [
        {
          text: '指南',
          base: '/tiny-robot/guide/',
          items: [{ text: '快速开始', link: 'quick-start' }],
        },
      ],
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
      '/tiny-robot/examples/': [
        {
          text: '演示',
          base: '/tiny-robot/examples/',
          items: [{ text: '综合示例', link: 'assistant' }],
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
            { text: 'WebAgent 私有化部署', link: 'web-agent-private-deployment' },
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
      '/tiny-vue/guide/': [
        {
          text: '指南',
          base: '/tiny-vue/guide/',
          items: [
            { text: '环境准备', link: 'envpreparation-open' },
            { text: '安装', link: 'installation' },
            { text: '更新日志', link: 'changelog' },
            { text: '引入组件', link: 'import-components' },
            { text: '国际化', link: 'i18n' },
            { text: '主题配置', link: 'theme' },
            { text: '暗黑模式', link: 'theme-dark' },
            { text: '智能化', link: 'mcp' },
            { text: '表单校验配置', link: 'form-valid' },
            { text: '常见问题', link: 'faq' },
          ]
        },
      ],
      '/tiny-engine/engines/': [
        {
          text: "新手指引",
          collapsed: false,
          base: "/tiny-engine/engines/",
          items: [
            { text: "简介", link: "introduction" },
            { text: "快速上手", link: "quick-start" }
          ]
        },
        {
          text: "基础功能",
          collapsed: false,
          base: "/tiny-engine/engines/",
          items: [
            { text: "初识设计器", link: "intro-to-designer" },
            { text: "设计前端应用流程", link: "frontend-application-flow" },
            { text: "设计器界面模块简介", link: "designer-ui-modules" },
            { text: "页面管理", link: "page-management" },
            { text: "使用组件", link: "using-components" },
            { text: "样式设置", link: "style-settings" },
            { text: "使用状态管理和变量绑定", link: "state-management-and-variable-binding" },
            { text: "行内样式绑定状态变量", link: "inline-style-variable-binding" },
            { text: "查看大纲树", link: "outline-tree" },
            { text: "国际化", link: "internationalization" },
            { text: "页面和区块预览", link: "page-and-block-preview" }
          ]
        },
        {
          text: "进阶功能",
          collapsed: false,
          base: "/tiny-engine/engines/",
          items: [
            { text: "区块管理", link: "block-management" },
            { text: "使用JS面板和事件绑定", link: "js-panel-and-event-binding" },
            { text: "使用工具类方法 utils", link: "using-utils-methods" },
            { text: "高级面板设置", link: "advanced-panel-settings" },
            { text: "如何使用插槽", link: "how-to-use-slots" },
            { text: "循环渲染", link: "loop-rendering" },
            { text: "条件渲染", link: "conditional-rendering" },
            { text: "集成ChatGPT搭建简单页面能力", link: "integrating-chatgpt-for-simple-pages" },
            { text: "新版AI插件使用", link: "new-ai-plugin-usage" },
            { text: "数据源和Collection—远程字段", link: "data-source-and-collection-remote-fields" },
            { text: "数据源和Collection—mock数据", link: "data-source-and-collection-mock-data" },
            { text: "数据源和Collection—使用数据源", link: "data-source-and-collection-usage" },
            {
              text: "路由功能",
              collapsed: false,
              base: "/tiny-engine/engines/route-capabilities/",
              items: [
                { text: "页面支持嵌套路由", link: "page-support-nested-route" },
                { text: "路由bar一键清除预览页面路径", link: "route-bar-clear-preview-page" },
                { text: "路由bar高亮显示预览页面路径", link: "route-bar-current-page-highlight" },
                { text: "RouterView组件支持预览子界面", link: "route-view-support-preview-subpage" }
              ]
            },
            { text: "主题切换功能", link: "theme-switch" },
            { text: "画布快捷操作", link: "canvas-shortcuts" }
          ]
        },
        {
          text: "教程",
          collapsed: false,
          base: "/tiny-engine/engines/",
          items: [
            { text: "从零搭建一个页面", link: "build-a-page-from-scratch" },
          ]
        }
      ],
      '/tiny-engine/dev/': [
        {
          text: "开始",
          collapsed: false,
          base: "/tiny-engine/dev/",
          items: [
            { text: "简介", link: "dev-intro" },
            { text: "快速上手", link: "dev-quick-start" },
            { text: "前后端启动联调(Java服务端)", link: "debugging-of-java-backend" }
          ]
        },
        {
          text: "更新日志",
          collapsed: false,
          base: "/tiny-engine/dev/",
          items: [
            { text: "更新日志", link: "changelog" },
            { text: "v2.7升级指南", link: "v2.7-upgrade-guide" }
          ]
        },
        {
          text: "解决方案",
          collapsed: false,
          base: "/tiny-engine/dev/",
          items: [
            {text: "前端及Java服务端docker部署", link: "front-backend-docker-deployment"},
            { text: "Java服务端部署", link: "server-deployment-solution-java" },
            { text: "Node.js服务端部署", link: "server-deployment-solution" },
            { text: "区块发布方案(Node.js服务端)", link: "block-release-solution" },
            { text: "区块局域网发布方案(Node.js服务端)", link: "block-lan-release-solution" },
            { text: "设计器中引入第三方组件库", link: "third-party-library-in-designer" },
            { text: "物料同步方案", link: "material-sync-solution" },
            { text: "本地化CDN方案", link: "import-map-local" },
            { text: "全新区块构建方案", link: "block-construction-solution" },
            { text: "全新画布通信方案", link: "canvas-communication-solution" }
          ]
        },
        {
          text: "扩展能力介绍",
          collapsed: false,
          base: "/tiny-engine/dev/",
          items: [
            { text: "新架构介绍", link: "new-architecture" },
            { text: "注册表", link: "registry" },
            { text: "注册表（新版）", link: "new-registry" },
            { text: "注册表高级特性", link: "new-registry-advanced" },
            { text: "元服务和元应用", link: "meta-services-and-meta-apps" }
          ]
        },
        {
          text: "扩展能力使用教程",
          collapsed: false,
          base: "/tiny-engine/dev/",
          items: [
            { text: "如何开发插件", link: "how-to-develop-plugins" },
            {
              text: "出码功能",
              collapsed: false,
              base: "/tiny-engine/dev/code-output-function/",
              items: [
                { text: "出码功能简介与使用", link: "code-output-overview-and-usage" },
                { text: "如何自定义出码", link: "how-to-customize-code-output" },
                { text: "如何自定义出码插件", link: "how-to-customize-code-output-plugins" },
                { text: "自定义页面出码插件", link: "custom-page-code-output-plugin" },
                { text: "官方出码能力API", link: "official-code-output-api" }
              ]
            },
            { text: "定制插件UI", link: "customize-plugin-ui" },
            { text: "定制元服务逻辑", link: "customize-meta-service-logic" },
            { text: "开发设置器组件", link: "develop-configurator-components" },
            { text: "AI插件使用前配置", link: "ai-plugin-configuration" },
            { text: "如何自定义主题", link: "how-to-custom-theme" }
          ]
        },
        {
          text: "API",
          collapsed: false,
          base: "/tiny-engine/dev/",
          items: [
            { text: "API总览", link: "api-overview" },
            {
              text: "前端API",
              collapsed: false,
              base: "/tiny-engine/dev/frontend-api/",
              items: [
                { text: "主包API", link: "main-package-api" },
                { text: "画布API", link: "canvas-api" },
                { text: "全局布局API", link: "global-layout-api" },
                { text: "物料API", link: "material-api" },
                { text: "设置面板API", link: "settings-panel-api" },
                { text: "预览API", link: "preview-api" }
              ]
            },
            {
              text: "后端API",
              collapsed: false,
              base: "/tiny-engine/dev/backend-api/",
              items: [
                { text: "AI功能接口", link: "ai-function-api" },
                { text: "应用管理", link: "app-management" },
                { text: "区块分类", link: "block-categories" },
                { text: "应用工具类管理", link: "app-utility-management" },
                { text: "区块管理", link: "block-management-api" },
                { text: "数据源管理", link: "data-source-management" },
                { text: "DSL代码生成", link: "dsl-code-generation" },
                { text: "物料中心", link: "material-center" },
                { text: "页面管理", link: "page-management-api" },
                { text: "APP服务", link: "app-services" }
              ]
            }
          ]
        },
        {
          text: "实战案例",
          collapsed: false,
          base: "/tiny-engine/dev/",
          items: [
            { text: "PDM元数据审批电子流", link: "pdm-metadata-approval-workflow" },
            { text: "图元编排设计器", link: "graphical-element-arrangement-designer" },
            { text: "SMB轻量应用服务", link: "smb-lightweight-application-service" }
          ]
        }
      ],
      '/tiny-engine/portal/': [
        {
          text: "生态中心",
          collapsed: false,
          base: "/tiny-engine/portal/",
          items: [
            { text: "介绍", link: "ecosystem-intro" },
            { text: "如何导入组件库", link: "how-to-import-library" },
            { text: "如何发布区块", link: "how-to-publish-block" },
            { text: "发布其他生态", link: "publish-other-ecosystems" }
          ]
        },
        {
          text: "关于应用",
          collapsed: false,
          base: "/tiny-engine/portal/",
          items: [
            {
              text: "创建应用（创建空白应用、从模板创建应用）",
              link: "create-application-blank-or-template"
            },
            { text: "开发应用", link: "develop-application" }
          ]
        },
        {
          text: "关于物料",
          collapsed: false,
          base: "/tiny-engine/portal/",
          items: [
            { text: "介绍", link: "materials-intro" },
            { text: "创建物料资产包", link: "create-material-asset-package" },
            { text: "添加组件库和区块", link: "add-library-and-blocks" },
            { text: "构建物料资产包", link: "build-material-asset-package" }
          ]
        },
        {
          text: "关于设计器",
          collapsed: false,
          base: "/tiny-engine/portal/",
          items: [
            { text: "介绍", link: "designer-intro" },
            { text: "创建设计器", link: "create-designer" },
            {
              text: "定制物料资产包、主题、DSL、工具栏和插件栏",
              link: "customize-material-package-themes-dsl-toolbar-plugins"
            },
            { text: "定制设计器", link: "customize-designer" }
          ]
        }
      ],
    },
    search: {
      provider: 'local',
    },
  },
})
