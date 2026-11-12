import type { MarkdownRenderer } from 'vitepress'

const tinyRobotSection = /^\/(?:guide|suites|components|tools|best-practices|icons|examples|migration)(?=\/|[?#]|$)/

export function tinyRobotLinks(md: MarkdownRenderer) {
  md.core.ruler.after('inline', 'tiny-robot-links', (state) => {
    if (!state.env.relativePath?.startsWith('tiny-robot/')) return

    for (const token of state.tokens) {
      for (const child of token.children ?? []) {
        if (child.type !== 'link_open') continue
        const href = child.attrGet('href')
        if (href && tinyRobotSection.test(href)) {
          child.attrSet('href', `/tiny-robot${href}`)
        }
      }
    }
  })
}
