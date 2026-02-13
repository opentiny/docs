type MarkdownEnv = Record<string, unknown>

const MERMAID_LANGS = new Set(['mermaid', 'mmd'])

const sanitizeId = (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, '_')

const getFenceLang = (info = '') => info.trim().split(/\s+/)[0]

export const isMermaidFence = (token: { info?: string }) => {
  const lang = getFenceLang(token?.info)
  return MERMAID_LANGS.has(lang)
}

export const renderMermaidFence = (
  token: { content?: string },
  idx: number,
  env: MarkdownEnv = {},
) => {
  const pagePath = (env.relativePath || env.path || env.filePath || 'page') as string
  const blockId = sanitizeId(`${pagePath}-${idx}`)
  const graph = encodeURIComponent(token?.content || '')

  return `<ClientOnly><MermaidBlock id="${blockId}" graph="${graph}"></MermaidBlock></ClientOnly>`
}
