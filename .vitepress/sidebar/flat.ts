import path from 'node:path'
import { listMarkdown, readDocTitle } from './pages'
import type { SidebarItem, SidebarMap } from './transform'

export interface FlatSidebarOptions {
  rootDir: string
  pages: string
  key: string
  group: string
  ignore?: string[]
  order?: string[]
  pin?: string[]
  toLink: (rel: string) => string
}

function sortSlugs<T extends { slug: string }>(items: T[], order: string[] = [], pin: string[] = []) {
  const rank = new Map(order.map((slug, index) => [slug, index]))
  const pinRank = new Map(pin.map((slug, index) => [slug, index]))
  return [...items].sort((a, b) => {
    const pinA = pinRank.has(a.slug) ? (pinRank.get(a.slug) as number) : pin.length
    const pinB = pinRank.has(b.slug) ? (pinRank.get(b.slug) as number) : pin.length
    if (pinA !== pinB) return pinA - pinB
    const rankA = rank.has(a.slug) ? (rank.get(a.slug) as number) : order.length
    const rankB = rank.has(b.slug) ? (rank.get(b.slug) as number) : order.length
    if (rankA !== rankB) return rankA - rankB
    return a.slug.localeCompare(b.slug, 'en')
  })
}

export function buildFlatSidebar(options: FlatSidebarOptions): SidebarMap {
  const files = listMarkdown(options.rootDir, options.pages, options.ignore || [])
  const key = options.key.endsWith('/') ? options.key : `${options.key}/`
  const items: SidebarItem[] = sortSlugs(
    files.map((rel) => {
      const site = options.toLink(rel)
      const slug = site.startsWith(key) ? site.slice(key.length) : site.replace(/^\//, '')
      return {
        slug,
        text: readDocTitle(path.join(options.rootDir, options.pages, rel), slug.split('/').pop() || slug)
      }
    }),
    options.order,
    options.pin
  ).map(({ text, slug }) => ({ text, link: slug }))

  if (!items.length) return {}
  return { [key]: [{ text: options.group, base: key, items }] }
}
