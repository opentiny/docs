import fs from 'node:fs'
import path from 'node:path'
import { readEngineCatalog } from './catalog'
import { listContentDirs } from './pages'

const engineFallback: Record<string, string> = {
  'tiny-engine/docs/:section(getting-started|basic-features|advanced-features|tutorials)/:path*': 'tiny-engine/guide/:path*',
  'tiny-engine/docs/:section(practical-cases|api|extension-capabilities-tutorial|development-getting-started|changelog|solutions|extension-capabilities-overview)/:path*':
    'tiny-engine/dev/:path*',
  'tiny-engine/docs/:section(ecosystem-center|about-applications|about-materials|about-designer)/:path*':
    'tiny-engine/portal/:path*'
}

function dirRewrites(rootDir: string, sourceDir: string, sitePrefix: string) {
  const rewrites: Record<string, string> = {}
  for (const name of listContentDirs(rootDir, sourceDir)) {
    rewrites[`${sourceDir}/${name}/:path*`] = `${sitePrefix}/${name}/:path*`
  }
  return rewrites
}

function engineRewrites(rootDir: string) {
  const catalog = readEngineCatalog(rootDir)
  if (!catalog) return { ...engineFallback }
  const byType = new Map<string, string[]>()
  for (const chapter of catalog.chapters || []) {
    const names = (chapter.sections || []).map((section) => section.name).filter(Boolean)
    if (!chapter.type || !names.length) continue
    byType.set(chapter.type, names)
  }
  const rewrites: Record<string, string> = {}
  const preferred = ['guide', 'dev', 'portal']
  const types = [...preferred, ...[...byType.keys()].filter((type) => !preferred.includes(type))]
  for (const type of types) {
    const names = byType.get(type)
    if (!names?.length) continue
    rewrites[`tiny-engine/docs/:section(${names.join('|')})/:path*`] = `tiny-engine/${type}/:path*`
  }
  return rewrites
}

export function createRewrites(rootDir: string): Record<string, string> {
  const bestPracticeDir = path.join(rootDir, 'next-sdk/docs/best-pratice')
  const nextSdk: Record<string, string> = {}
  if (fs.existsSync(bestPracticeDir)) {
    nextSdk['next-sdk/docs/best-pratice/:path*'] = 'next-sdk/best-practice/:path*'
  }
  nextSdk['next-sdk/docs/:path*'] = 'next-sdk/:path*'

  return {
    ...dirRewrites(rootDir, 'tiny-robot/docs/src', 'tiny-robot'),
    ...nextSdk,
    'genui/genui-sdk/docs/src/:path*': 'genui-sdk/:path*',
    'tiny-vue/examples/sites/demos/pc/webdoc/:path*': 'tiny-vue/guide/:path*',
    ...engineRewrites(rootDir),
    ...dirRewrites(rootDir, 'tiny-editor/packages/docs/fluent-editor/docs', 'tiny-editor'),
    'web-agent/docs/:path*': 'web-agent/guide/:path*',
    'opentiny.design/packages/opentiny-docs/src/views/vue-pro/:path*': 'tiny-pro/guide/:path*'
  }
}
