/**
 * TinyRobot AI 助手文档来自 web-agent-enterprise 的 robot-wxt 文档。
 * 源文有一处指向本包里不存在的 guide/quick-start，对应本站 NEXT-SDK 快速开始。
 */

const isTinyRobotAiDoc = (filePath = '') =>
  filePath.replace(/\\/g, '/').includes('/packages/robot-wxt/docs/')

const rewriteKnownLinks = (src: string) =>
  src.replaceAll('](../guide/quick-start.md', '](/next-sdk/guide/quick-start')

export function tinyRobotAiDocsPlugin(md: { parse: (src: string, env: Record<string, unknown>) => unknown }) {
  const parse = md.parse.bind(md)
  md.parse = (src: string, env: Record<string, unknown>) => {
    const filePath = String(env?.realPath || env?.path || '')
    if (!isTinyRobotAiDoc(filePath)) return parse(src, env)
    return parse(rewriteKnownLinks(src), env)
  }
}
