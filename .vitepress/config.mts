import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'vitepress'
import { vitepressDemoPlugin } from 'vitepress-demo-plugin'
import { tabsMarkdownPlugin } from 'vitepress-plugin-tabs'
import { isMermaidFence, renderMermaidFence } from './theme/markdown/mermaid'
import { tinyEditorDemoPlugin } from './theme/markdown/tiny-editor-demo'
import { tinyproDocsPlugin } from './theme/markdown/tinypro-docs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRewrites, loadSidebar } from './sidebar'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const sidebar = await loadSidebar(rootDir)
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
    const index = options.findIndex((option) => source.includes(normalizePath(option.source, targetStyle)))
    if (index !== -1) {
      return source.replace(
        normalizePath(options[index].source, targetStyle),
        normalizePath(options[index].target || '', targetStyle)
      )
    }
    // 如果不满足条件，则不处理
    return null
  }
})

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'OpenTiny NEXT',
  description: 'OpenTiny NEXT',
  // 忽略死链检查（true 会跳过 VitePress 的 dead link 报错）
  ignoreDeadLinks: true,
  outDir: 'dist',
  srcExclude: [
    '**/README*.md',
    '**/develop-demo-en.md',
    '**/theme-en.md',
    'tiny-vue/packages/**/*.md',
    'tiny-engine/packages/**/*.md',
    'tiny-robot/packages/**/*.md',
    'next-sdk/packages/**/*.md',
    'genui-sdk/packages/**/*.md',
    // tinyglobby 的 ignore 会丢掉 ! 反选，不能用「整仓排除再放行」。
    // 只排除 TinyPro Vue 中文文档以外的 markdown。
    // opentiny.design 自带一份 genui-sdk 子模块。站点已用 genui/genui-sdk，
    // 这份文档的 demo 解析不到物料包，不能编进本站。
    'opentiny.design/genui-sdk/**',
    'opentiny.design/packages/common/**',
    'opentiny.design/packages/home/**',
    'opentiny.design/packages/tech-college/**',
    'opentiny.design/packages/tiny-engine-portal/**',
    'opentiny.design/packages/opentiny-docs/src/views/ng-pro/**',
    'opentiny.design/packages/opentiny-docs/src/views/theme/**',
    'opentiny.design/packages/opentiny-docs/src/views/tiny-cli/**',
    'opentiny.design/packages/opentiny-docs/src/views/vue-pro/*-us.md',
    'opentiny.design/packages/opentiny-docs/src/views/vue-pro/quick.md',
    'opentiny.design/packages/opentiny-docs/src/views/vue-pro/plugin.md',
    'opentiny.design/packages/opentiny-docs/src/views/vue-pro/library.md',
    'opentiny.design/packages/opentiny-docs/src/views/vue-pro/practiced.md',
    'opentiny.design/packages/opentiny-docs/src/views/vue-pro/backEnd.md',
    'opentiny.design/packages/opentiny-docs/src/views/vue-pro/back-end-design.md',
    'opentiny.design/packages/opentiny-docs/src/views/vue-pro/back-end-api-specification.md',
    'opentiny.design/packages/opentiny-docs/src/views/vue-pro/back-end-guide-spring-boot.md',
    'opentiny.design/packages/opentiny-docs/src/views/vue-pro/responsive-adaptation-guide.md'
  ],
  base: process.env.VITEPRESS_BASE || '/',
  head: [['link', { rel: 'icon', href: '/images/logo-mini.svg' }]],
  vite: {
    // 允许以大写扩展名结尾的图片/静态资源被当作资产处理，避免被 import-analyze 当作 JS 解析
    assetsInclude: ['**/*.{png,PNG,jpg,JPG,jpeg,JPEG,gif,GIF,webp,WEBP,svg,SVG}'],
    plugins: [
      vueJsx(),
      resolveSubmoduleRelativePathsPlugin([
        {
          source: path.resolve(rootDir, 'demos'),
          target: path.resolve(rootDir, 'tiny-robot/docs/demos')
        }
      ])
    ],
    server: { open: true },
    // 子模块里有大量独立站点的 index.html。依赖扫描如果把它们都当成入口，
    // 会扫到无效的 import.meta.glob，导致文档站起不来。
    optimizeDeps: {
      entries: ['.vitepress/theme/index.ts']
    },
    resolve: {
      alias: {
        '@opentiny/tiny-robot-style': '../../tiny-robot/packages/components/dist/style.css',
        '@demos': '../' // 根据你的项目结构调整路径
      }
    }
  },
  markdown: {
    config: (md) => {
      // tiny-editor 的 :::demo src=... 转成 <demo vue="..." />，再交给 vitepress-demo-plugin
      md.use(tinyEditorDemoPlugin)
      md.use(tinyproDocsPlugin)
      md.use(vitepressDemoPlugin, {
        playground: { show: true },
        codeTransformer: (code) => {
          return code.replace(/import\.meta\.env\.BASE_URL/g, `'${process.env.VITEPRESS_BASE || '/'}'`)
        }
      })
      md.use(tabsMarkdownPlugin)
      // map unsupported languages to supported ones for highlighter
      const _fence = md.renderer.rules.fence
      const langMap: Record<string, string> = { env: 'bash', vue3: 'vue', properties: 'ini' }
      md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const token = tokens[idx]
        if (token && isMermaidFence(token)) {
          return renderMermaidFence(token, idx, env || {})
        }
        if (token && token.info) {
          const info = token.info.trim()
          const lang = info.split(/\s+/)[0]
          if (langMap[lang]) {
            token.info = info.replace(new RegExp('^' + lang + '\\b'), langMap[lang])
          }
        }
        return _fence ? _fence(tokens, idx, options, env, self) : self.renderToken(tokens, idx, options)
      }
    }
  },
  rewrites: createRewrites(rootDir),
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/images/logo-mini.svg',
    siteTitle: 'OpenTiny NEXT',
    outline: 'deep',
    nav: [
      {
        text: '指南',
        link: '/tiny-robot/guide/quick-start',
        activeMatch: '/guide/'
      },
      {
        text: '演示',
        link: '/tiny-robot/examples/assistant',
        activeMatch: '/examples/'
      },
      {
        text: '迁移指南',
        link: '/tiny-robot/migration/bubble-migration',
        activeMatch: '/migration/'
      }
    ],
    engineNav: [
      {
        text: '使用指南',
        link: '/tiny-engine/guide/introduction',
        activeMatch: '/guide/'
      },
      {
        text: '平台开发指南',
        link: '/tiny-engine/dev/dev-intro',
        activeMatch: '/dev/'
      },
      {
        text: '网站文档',
        link: '/tiny-engine/portal/ecosystem-intro',
        activeMatch: '/portal/'
      }
    ],
    genuiNav: [
      {
        text: '快速开始',
        link: '/genui-sdk/guide/quick-start',
        activeMatch: '/guide/'
      },
      {
        text: '组件文档',
        link: '/genui-sdk/components/renderer',
        activeMatch: '/components/'
      },
      {
        text: '特性示例',
        link: '/genui-sdk/examples/renderer/custom-actions',
        activeMatch: '/examples/'
      },
      {
        text: '协议规范',
        link: '/genui-sdk/schema/protocol',
        activeMatch: '/schema/'
      }
    ],
    sidebar,
    search: {
      provider: 'local'
    }
  }
})
