import path from 'node:path'
import type { DefaultTheme } from 'vitepress'
import type { ReplaceRule } from './map-link'
import { applyReplace, fileToSiteLink, mountPath, siteLinkToSource } from './map-link'
import { asKey, isExternalLink, listMarkdown, markdownFile, readDocTitle, stripHash } from './pages'

export type SidebarItem = DefaultTheme.SidebarItem
export type SidebarMap = Record<string, SidebarItem[]>

export interface MenuContext {
  rootDir: string
  pages: string
  mount: string
  replace: ReplaceRule[]
  ignore: string[]
  folderTitle?: Record<string, string>
}

interface RawItem {
  text?: string
  link?: string
  items?: RawItem[]
  collapsed?: boolean
  base?: string
  docFooterText?: string
  rel?: string
  target?: string
}

interface TransformResult {
  sidebar: SidebarMap
  total: number
  kept: number
  dropped: string[]
}

function joinLink(base: string, link: string) {
  if (!link || isExternalLink(link) || link.startsWith('/')) return link
  const prefix = base.endsWith('/') ? base : `${base}/`
  return `${prefix}${link}`.replace(/\/{2,}/g, '/')
}

function mapAbsolute(link: string, ctx: MenuContext) {
  return mountPath(applyReplace(link, ctx.replace), ctx.mount)
}

function resolveFile(siteLink: string, ctx: MenuContext) {
  return markdownFile(ctx.rootDir, ctx.pages, siteLinkToSource(siteLink, ctx.mount, ctx.replace))
}

function cloneShell(item: RawItem): SidebarItem {
  const next: SidebarItem = {}
  if (item.text) next.text = item.text
  if (item.collapsed != null) next.collapsed = item.collapsed
  if (item.docFooterText) next.docFooterText = item.docFooterText
  if (item.rel) next.rel = item.rel
  if (item.target) next.target = item.target
  return next
}

export function transformMenu(sidebar: unknown, ctx: MenuContext): TransformResult {
  const dropped: string[] = []
  let total = 0
  let kept = 0

  const transformItems = (items: RawItem[], inheritedBase: string): SidebarItem[] => {
    const next: SidebarItem[] = []
    for (const item of items) {
      const mappedBase = item.base ? mapAbsolute(item.base, ctx) : inheritedBase
      if (item.items?.length) {
        const children = transformItems(item.items, mappedBase)
        if (!children.length && !item.link) continue
        const group = cloneShell(item)
        if (item.base) group.base = mappedBase
        if (children.length) group.items = children
        if (item.link) {
          const linked = attachLink(item, mappedBase, group)
          if (linked) next.push(group)
          else if (children.length) next.push(group)
        } else if (children.length) {
          next.push(group)
        }
        continue
      }
      if (!item.link) continue
      const leaf = cloneShell(item)
      if (item.base) leaf.base = mappedBase
      if (attachLink(item, mappedBase, leaf)) next.push(leaf)
    }
    return next
  }

  const attachLink = (item: RawItem, base: string, target: SidebarItem) => {
    const link = item.link || ''
    if (isExternalLink(link)) {
      target.link = link
      return true
    }
    total += 1
    const absolute = link.startsWith('/') ? mapAbsolute(stripHash(link), ctx) : joinLink(base, stripHash(link))
    if (!resolveFile(absolute, ctx)) {
      dropped.push(link)
      return false
    }
    kept += 1
    target.link = link.startsWith('/') ? mapAbsolute(link, ctx) : link
    return true
  }

  const result: SidebarMap = {}
  if (Array.isArray(sidebar)) {
    const items = transformItems(sidebar as RawItem[], '')
    if (items.length) result[asKey(mapAbsolute('/', ctx))] = items
  } else if (sidebar && typeof sidebar === 'object') {
    const cache = new Map<RawItem[], SidebarItem[]>()
    for (const [key, value] of Object.entries(sidebar as Record<string, RawItem[]>)) {
      if (!Array.isArray(value)) continue
      let items = cache.get(value)
      if (!items) {
        items = transformItems(value, '')
        cache.set(value, items)
      }
      if (!items.length) continue
      result[asKey(mapAbsolute(key, ctx))] = items
    }
  }

  return { sidebar: result, total, kept, dropped }
}

export function sidebarFromFiles(ctx: MenuContext): SidebarMap {
  const groups = new Map<string, SidebarItem[]>()
  for (const rel of listMarkdown(ctx.rootDir, ctx.pages, ctx.ignore)) {
    const site = fileToSiteLink(rel, ctx.mount, ctx.replace)
    const dir = site.slice(0, site.lastIndexOf('/') + 1)
    const slug = site.slice(dir.length)
    const title = readDocTitle(path.join(ctx.rootDir, ctx.pages, rel), slug)
    const items = groups.get(dir) || []
    items.push({ text: title, link: slug })
    groups.set(dir, items)
  }

  const sections: SidebarItem[] = []
  for (const [dir, items] of groups) {
    const name = dir.split('/').filter(Boolean).pop() || 'docs'
    items.sort((a, b) => String(a.link).localeCompare(String(b.link), 'en'))
    sections.push({ text: ctx.folderTitle?.[name] || name, base: dir, items })
  }
  if (!sections.length) return {}
  return { [asKey(ctx.mount)]: sections }
}
