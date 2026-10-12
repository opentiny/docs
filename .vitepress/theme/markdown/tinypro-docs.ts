/**
 * TinyPro 文档来自 tiny-pro 仓库的 docs 目录，图片在 docs/public/images。
 * 这里只在渲染时改链接、图片路径和 HTML 标题，不复制源文件。
 */

const rControl = /[\u0000-\u001f]/g
const rSpecial = /[\s~`!@#$%^&*()\-_+=[\]{}|\\;:"'“”‘’<>,.?/]+/g
const rCombining = /[\u0300-\u036F]/g

const slugify = (str: string) =>
  str
    .normalize('NFKD')
    .replace(rCombining, '')
    .replace(rControl, '')
    .replace(rSpecial, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/^(\d)/, '_$1')
    .toLowerCase()

const isTinyProDoc = (filePath = '') => filePath.replace(/\\/g, '/').includes('/tiny-pro/docs/')

const mapOutsideFences = (src: string, transform: (part: string) => string) => {
  const re = /(^|\n)(```[\s\S]*?\n```)/g
  let result = ''
  let last = 0
  let match: RegExpExecArray | null
  while ((match = re.exec(src))) {
    const fenceStart = match.index + match[1].length
    result += transform(src.slice(last, fenceStart))
    result += match[2]
    last = fenceStart + match[2].length
  }
  result += transform(src.slice(last))
  return result
}

const inlineHeading = (inner: string) =>
  inner
    .replace(/<code>([\s\S]*?)<\/code>/gi, '`$1`')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()

const convertHtmlHeadings = (src: string) =>
  src.replace(/<h([1-6])([^>]*)>([\s\S]*?)<\/h\1>/gi, (_match, level: string, attrs: string, inner: string) => {
    const idMatch = attrs.match(/id\s*=\s*['"]([^'"]+)['"]/i)
    const id = idMatch?.[1] || ''
    const text = inlineHeading(inner)
    const heading = `${'#'.repeat(Number(level))} ${text}`
    if (!id || slugify(text) === id.toLowerCase()) return heading
    return `${heading} {#${id}}`
  })

const rewriteImageDestination = (url: string) => {
  const trimmed = url.trim()
  const wrapped = trimmed.startsWith('<') && trimmed.endsWith('>')
  const raw = wrapped ? trimmed.slice(1, -1).trim() : trimmed
  if (!raw.startsWith('/images/')) return null
  let next = `./public/images/${raw.slice('/images/'.length)}`
  try {
    next = decodeURIComponent(next)
  } catch {
    // 保留原始编码
  }
  return /\s/.test(next) ? `<${next}>` : next
}

const rewriteTinyProBody = (part: string) =>
  part
    .replace(/!\[([^\]]*)\]\(([^)\n]+)\)/g, (match, alt: string, url: string) => {
      const next = rewriteImageDestination(url)
      return next ? `![${alt}](${next})` : match
    })
    .replaceAll('](/quick-start)', '](/tiny-pro/guide/quick-start)')

function transformTinyProMarkdown(src: string) {
  return mapOutsideFences(src, (part) => rewriteTinyProBody(convertHtmlHeadings(part)))
}

type MarkdownToken = {
  attrs?: [string, string][] | null
  children?: MarkdownToken[] | null
}

const stripHeadingAttrFromLabel = (tokens: MarkdownToken[]) => {
  for (const token of tokens) {
    for (const attr of token.attrs || []) {
      // 锚点文案在解析时就已经写进 aria-label，这里只清掉 {#id}
      if (attr[0] === 'aria-label') attr[1] = attr[1].replace(/ \{#[^{}]+\}/g, '')
    }
    if (token.children?.length) stripHeadingAttrFromLabel(token.children)
  }
}

export function tinyproDocsPlugin(md: { parse: (src: string, env: Record<string, unknown>) => unknown }) {
  const parse = md.parse.bind(md)
  md.parse = (src: string, env: Record<string, unknown>) => {
    // VitePress 会把 env.path 改成重写后的 tiny-pro/guide/*.md，源文件在 realPath
    const filePath = String(env?.realPath || env?.path || '')
    if (!isTinyProDoc(filePath)) return parse(src, env)
    const tokens = parse(transformTinyProMarkdown(src), env)
    if (Array.isArray(tokens)) stripHeadingAttrFromLabel(tokens)
    return tokens
  }
}
