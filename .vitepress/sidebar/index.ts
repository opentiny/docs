import fs from 'node:fs'
import path from 'node:path'
import { buildEngineSidebar } from './catalog'
import { buildFlatSidebar } from './flat'
import { asKey, readDocTitle } from './pages'
import { sidebarSources, type SidebarSource } from './products'
import { sidebarFromFiles, transformMenu, type MenuContext, type SidebarItem, type SidebarMap } from './transform'

export { createRewrites } from './rewrites'

function applyAliases(sidebar: SidebarMap, mount: string | undefined, aliasKeys: string[] = []) {
  if (!aliasKeys.length) return
  const source = (mount && sidebar[asKey(mount)]) || Object.values(sidebar)[0]
  if (!source) return
  for (const alias of aliasKeys) {
    const key = asKey(alias)
    if (!sidebar[key]) sidebar[key] = source
  }
}

function menuContext(rootDir: string, source: Extract<SidebarSource, { kind: 'vitepress' }>): MenuContext {
  return {
    rootDir,
    pages: source.pages,
    mount: source.mount,
    replace: source.replace || [],
    ignore: source.ignore || [],
    folderTitle: source.folderTitle
  }
}

async function loadVitepress(rootDir: string, source: Extract<SidebarSource, { kind: 'vitepress' }>) {
  const ctx = menuContext(rootDir, source)
  let menu: unknown
  try {
    menu = await source.load()
  } catch (error) {
    console.warn(`[sidebar] ${source.id} 菜单读取失败，改为扫描文档目录。`, error)
    const scanned = sidebarFromFiles(ctx)
    applyAliases(scanned, source.mount, source.aliasKeys)
    return scanned
  }

  const transformed = transformMenu(menu, ctx)
  const hasItems = Object.keys(transformed.sidebar).length > 0
  const stale = transformed.total > 0 && transformed.kept / transformed.total < 0.5
  if (!hasItems || stale) {
    console.warn(
      `[sidebar] ${source.id} 的菜单链接对不上现有文档，改为扫描文档目录。${
        transformed.dropped.length ? `失效链接：${transformed.dropped.join(', ')}` : ''
      }`
    )
    const scanned = sidebarFromFiles(ctx)
    applyAliases(scanned, source.mount, source.aliasKeys)
    return scanned
  }

  applyAliases(transformed.sidebar, source.mount, source.aliasKeys)
  if (transformed.dropped.length) {
    console.info(`[sidebar] ${source.id} 已读取子模块菜单，去掉 ${transformed.dropped.length} 个失效链接`)
  }
  return transformed.sidebar
}

function resolveDocSlug(rootDir: string, pages: string, key: string) {
  for (const name of [`${key}.md`, `${key}-open.md`]) {
    if (fs.existsSync(path.join(rootDir, pages, name))) return name.slice(0, -3)
  }
  return null
}

function readDocMenus(menuFile: string) {
  const source = fs.readFileSync(menuFile, 'utf8')
  const start = source.indexOf('const envTarget')
  const end = source.indexOf('export const cmpMenus')
  if (start < 0 || end < 0) throw new Error(`无法从 ${menuFile} 解析文档菜单`)
  const slice = source
    .slice(start, end)
    .replace(/import\.meta\.env\.VITE_BUILD_TARGET/g, 'globalThis.process.env.VITE_BUILD_TARGET')
    .replace(/import\.meta\.env\.VITE_TINY_THEME/g, 'globalThis.process.env.VITE_TINY_THEME')
    .replace(/^export /gm, '')
  const docMenus = new Function(`${slice}\nreturn docMenus`)() as Array<{
    label?: string
    children?: Array<{ title?: string; key?: string }>
  }>
  const menu = docMenus?.[0]
  return {
    text: menu?.label || '指南',
    children: (menu?.children || [])
      .filter((item) => item?.title && item?.key)
      .map((item) => ({ title: String(item.title), key: String(item.key) }))
  }
}

function loadDocMenus(rootDir: string, source: Extract<SidebarSource, { kind: 'doc-menus' }>) {
  const key = asKey(source.key)
  let menu: { text: string; children: Array<{ title: string; key: string }> }
  try {
    menu = readDocMenus(path.join(rootDir, source.menuFile))
  } catch (error) {
    console.warn(`[sidebar] ${source.id} 菜单读取失败，改为扫描文档目录。`, error)
    return buildFlatSidebar({
      rootDir,
      pages: source.pages,
      key,
      group: '指南',
      ignore: source.ignore,
      pin: source.pin?.map((item) => item.slug),
      toLink: (rel) => `${key}${rel.replace(/\.md$/i, '')}`
    })
  }

  const items: SidebarItem[] = []
  for (const child of menu.children || []) {
    const slug = resolveDocSlug(rootDir, source.pages, child.key)
    if (!slug) continue
    items.push({ text: child.title, link: slug })
  }

  const pinned: SidebarItem[] = []
  for (const pin of source.pin || []) {
    const existing = items.find((item) => item.link === pin.slug)
    if (existing) {
      if (pin.text) existing.text = pin.text
      pinned.push(existing)
      continue
    }
    const file = path.join(rootDir, source.pages, `${pin.slug}.md`)
    if (!fs.existsSync(file)) continue
    pinned.push({ text: pin.text || readDocTitle(file, pin.slug), link: pin.slug })
  }

  const rest = items.filter((item) => !source.pin?.some((pin) => pin.slug === item.link))
  const merged = [...pinned, ...rest]
  if (!merged.length) return {}
  return { [key]: [{ text: menu.text || '指南', base: key, items: merged }] }
}

function loadMarkdown(rootDir: string, source: Extract<SidebarSource, { kind: 'markdown' }>) {
  if (!fs.existsSync(path.join(rootDir, source.pages))) {
    console.warn(`[sidebar] ${source.id} 文档目录不存在，已跳过侧边栏`)
    return {}
  }
  return buildFlatSidebar({
    rootDir,
    pages: source.pages,
    key: source.key,
    group: source.group,
    ignore: source.ignore,
    order: source.order,
    toLink: source.toLink
  })
}

async function loadSource(rootDir: string, source: SidebarSource): Promise<SidebarMap> {
  if (source.kind === 'vitepress') return loadVitepress(rootDir, source)
  if (source.kind === 'doc-menus') return loadDocMenus(rootDir, source)
  if (source.kind === 'markdown') return loadMarkdown(rootDir, source)
  const sidebar = buildEngineSidebar(rootDir)
  if (!Object.keys(sidebar).length) console.warn(`[sidebar] ${source.id} 未找到 catalog.json，已跳过侧边栏`)
  return sidebar
}

export async function loadSidebar(rootDir: string): Promise<SidebarMap> {
  const sidebar: SidebarMap = {}
  for (const source of sidebarSources) {
    try {
      const part = await loadSource(rootDir, source)
      for (const [key, items] of Object.entries(part)) {
        if (sidebar[key]) {
          console.warn(`[sidebar] ${key} 已由其他产品注册，忽略 ${source.id}`)
          continue
        }
        sidebar[key] = items
      }
    } catch (error) {
      console.warn(`[sidebar] ${source.id} 加载失败`, error)
    }
  }
  return sidebar
}
