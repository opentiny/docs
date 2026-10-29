import fs from 'node:fs'
import path from 'node:path'
import type { SidebarItem, SidebarMap } from './transform'

interface EngineArticle {
  title: string
  name: string
  articles?: EngineArticle[]
}

interface EngineSection {
  title: string
  name: string
  articles: EngineArticle[]
}

interface EngineChapter {
  title: string
  type: string
  sections: EngineSection[]
}

interface EngineCatalog {
  chapters: EngineChapter[]
}

const catalogRelative = 'tiny-engine/docs/catalog.json'

export function readEngineCatalog(rootDir: string): EngineCatalog | null {
  const file = path.join(rootDir, catalogRelative)
  if (!fs.existsSync(file)) return null
  return JSON.parse(fs.readFileSync(file, 'utf8')) as EngineCatalog
}

function articleSlug(name: string) {
  return name.replace(/\.md$/i, '')
}

function toItems(sectionDir: string, articles: EngineArticle[], base: string): SidebarItem[] {
  const items: SidebarItem[] = []
  for (const article of articles || []) {
    if (article.articles) {
      const folder = articleSlug(article.name)
      const nestedBase = `${base}${folder}/`
      const children = toItems(path.join(sectionDir, folder), article.articles, nestedBase)
      if (!children.length) continue
      items.push({ text: article.title, collapsed: false, base: nestedBase, items: children })
      continue
    }
    const slug = articleSlug(article.name)
    const file = path.join(sectionDir, article.name.endsWith('.md') ? article.name : `${slug}.md`)
    if (!fs.existsSync(file)) continue
    items.push({ text: article.title, link: slug })
  }
  return items
}

export function buildEngineSidebar(rootDir: string): SidebarMap {
  const catalog = readEngineCatalog(rootDir)
  if (!catalog) return {}
  const sidebar: SidebarMap = {}
  for (const chapter of catalog.chapters || []) {
    if (!chapter.type) continue
    const siteBase = `/tiny-engine/${chapter.type}/`
    const groups: SidebarItem[] = []
    for (const section of chapter.sections || []) {
      const sectionDir = path.join(rootDir, 'tiny-engine/docs', section.name)
      const items = toItems(sectionDir, section.articles, siteBase)
      if (items.length) groups.push({ text: section.title, collapsed: false, base: siteBase, items })
    }
    if (groups.length) sidebar[siteBase] = groups
  }
  return sidebar
}
