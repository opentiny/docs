/**
 * 将 tiny-editor 文档中的 :::demo src=... 语法
 * 转换为主站 vitepress-demo-plugin 可解析的 <demo vue="..." />。
 *
 * tiny-editor 独立站点使用 @vitepress-code-preview，
 * 统一文档站使用 vitepress-demo-plugin，语法不兼容。
 */
export function transformTinyEditorDemoMarkdown(src: string) {
  // docs/demo/*.md 中 src=demos/xxx.vue，相对路径为 ../../demos/xxx.vue
  return src.replace(/:::demo\s+src=([^\s]+)\s*\r?\n:::/g, (_match, demoSrc: string) => {
    const vuePath = demoSrc.startsWith('demos/') ? `../../${demoSrc}` : demoSrc
    return `<demo vue="${vuePath}" />`
  })
}

export function tinyEditorDemoPlugin(md: {
  parse: (src: string, env: Record<string, unknown>) => unknown
}) {
  const parse = md.parse.bind(md)
  md.parse = (src: string, env: Record<string, unknown>) => {
    return parse(transformTinyEditorDemoMarkdown(src), env)
  }
}
