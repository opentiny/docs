import fs from 'node:fs'
import path from 'node:path'

const SKIP_DIRS = new Set(['public', 'assets', '.vitepress', 'node_modules'])

export function isExternalLink(link: string) {
  return /^(?:[a-z]+:)?\/\//i.test(link) || link.startsWith('mailto:') || link.startsWith('tel:')
}

export function stripHash(link: string) {
  return link.split('#')[0].split('?')[0]
}

export function asKey(link: string) {
  const clean = stripHash(link)
  if (!clean || clean === '/') return '/'
  return clean.endsWith('/') ? clean : `${clean}/`
}

export function readDocTitle(filePath: string, fallback: string) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '')
    const body = raw.replace(/^---[\s\S]*?---\s*/, '')
    const heading = body.match(/^#\s+(.+)$/m)?.[1]
    if (!heading) {
      const frontmatter = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
      const title = frontmatter?.[1].match(/^title:\s*(.+)$/m)?.[1]?.trim().replace(/^['"]|['"]$/g, '')
      return title || fallback
    }
    const text = heading
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    const bilingual = text.match(/^(.+?)\s+[A-Z][A-Za-z0-9].*$/)
    if (bilingual && /[\u4e00-\u9fff]/.test(bilingual[1])) return bilingual[1].trim()
    return text || fallback
  } catch {
    return fallback
  }
}

function matchGlob(rel: string, pattern: string) {
  if (pattern.endsWith('/**')) {
    const prefix = pattern.slice(0, -3)
    return rel === prefix || rel.startsWith(`${prefix}/`)
  }
  const target = pattern.includes('/') && !pattern.startsWith('**/') ? rel : rel.split('/').pop() || rel
  const source = pattern.startsWith('**/') ? pattern.slice(3) : pattern
  const expression = `^${source.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')}$`
  return new RegExp(expression).test(target)
}

export function isIgnoredPage(rel: string, patterns: string[] = []) {
  const base = rel.split('/').pop() || rel
  if (rel === 'index.md' || /^README/i.test(base)) return true
  return patterns.some((pattern) => matchGlob(rel, pattern))
}

export function listMarkdown(rootDir: string, pagesDir: string, patterns: string[] = []) {
  const start = path.join(rootDir, pagesDir)
  const files: string[] = []
  const walk = (dir: string, rel = '') => {
    if (!fs.existsSync(dir)) return
    for (const name of fs.readdirSync(dir)) {
      if (name.startsWith('.') || SKIP_DIRS.has(name)) continue
      const full = path.join(dir, name)
      const child = rel ? `${rel}/${name}` : name
      const stat = fs.statSync(full)
      if (stat.isDirectory()) {
        walk(full, child)
        continue
      }
      if (!name.endsWith('.md') || isIgnoredPage(child, patterns)) continue
      files.push(child)
    }
  }
  walk(start)
  return files
}

export function markdownFile(rootDir: string, pagesDir: string, siteRelative: string) {
  const rel = siteRelative.replace(/^\/+/, '').replace(/\/+$/, '')
  if (!rel) return null
  const base = path.join(rootDir, pagesDir, rel)
  const candidates = [`${base}.md`, path.join(base, 'index.md')]
  return candidates.find((file) => fs.existsSync(file)) || null
}

export function listContentDirs(rootDir: string, sourceDir: string) {
  const abs = path.join(rootDir, sourceDir)
  if (!fs.existsSync(abs)) return []
  return fs
    .readdirSync(abs)
    .filter((name) => {
      if (name.startsWith('.') || SKIP_DIRS.has(name)) return false
      return fs.statSync(path.join(abs, name)).isDirectory()
    })
    .sort()
}
