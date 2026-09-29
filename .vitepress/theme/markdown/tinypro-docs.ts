/**
 * 子模块里的 TinyPro 文档沿用 opentiny.design 的写法。
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

const isVueProDoc = (filePath = '') => filePath.replace(/\\/g, '/').includes('/views/vue-pro/')

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
    .replace(/<a\s+[^>]*href\s*=\s*['"]([^'"]+)['"][^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)')
    .replace(/<code>([\s\S]*?)<\/code>/gi, '`$1`')
    .replace(/<br\s*\/?>/gi, ' ')
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

const rewriteVueProUrls = (src: string) =>
  src
    // 高级章节已不在本站发布，总览里的入口回到上游文档
    .replaceAll('](/vue-pro/docs/advanced/', '](https://opentiny.design/vue-pro/docs/advanced/')
    .replaceAll('/src/assets/images/vue-pro/', '../../assets/images/vue-pro/')
    .replaceAll('](/tiny-vue)', '](/tiny-vue/guide/introduce)')
    .replaceAll('](/tiny-cli/', '](https://opentiny.design/tiny-cli/')
    .replaceAll('](./tiny-pro.md)', '](./quick-start)')
    .replace(/!\[([^\]]*)\]\(([^)\s]*?%20[^)\s]*)\)/g, (_match, alt: string, url: string) => {
      const decoded = decodeURIComponent(url)
      return /\s/.test(decoded) ? `![${alt}](<${decoded}>)` : `![${alt}](${decoded})`
    })

function transformVueProMarkdown(src: string) {
  return rewriteVueProUrls(mapOutsideFences(src, convertHtmlHeadings))
}

export function tinyproDocsPlugin(md: { parse: (src: string, env: Record<string, unknown>) => unknown }) {
  const parse = md.parse.bind(md)
  md.parse = (src: string, env: Record<string, unknown>) => {
    // VitePress 会把 env.path 改成重写后的 tiny-pro/guide/*.md，源文件在 realPath
    const filePath = String(env?.realPath || env?.path || '')
    const next = isVueProDoc(filePath) ? transformVueProMarkdown(src) : src
    return parse(next, env)
  }
}
