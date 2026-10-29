export type ReplaceRule = [from: string, to: string]

function collapse(link: string) {
  return link.replace(/\/{2,}/g, '/')
}

export function applyReplace(link: string, replace: ReplaceRule[] = []) {
  let value = link.startsWith('/') ? link : `/${link}`
  for (const [from, to] of replace) {
    if (!value.startsWith(from)) continue
    const rest = value.slice(from.length)
    value = to === '/' ? `/${rest}` : `${to.replace(/\/$/, '')}/${rest}`
    value = collapse(value)
  }
  return value
}

export function undoReplace(link: string, replace: ReplaceRule[] = []) {
  let value = link.startsWith('/') ? link : `/${link}`
  for (const [from, to] of [...replace].reverse()) {
    if (to === '/') {
      value = `${from.replace(/\/$/, '')}${value.startsWith('/') ? value : `/${value}`}`
    } else if (value.startsWith(to)) {
      value = from + value.slice(to.length)
    }
    value = collapse(value)
  }
  return value
}

export function mountPath(link: string, mount: string) {
  const prefix = mount.replace(/\/$/, '')
  if (!link.startsWith('/')) return link
  if (!prefix) return link
  if (link === prefix || link.startsWith(`${prefix}/`)) return link
  if (link === '/') return `${prefix}/`
  return `${prefix}${link}`
}

export function unmountPath(link: string, mount: string) {
  const prefix = mount.replace(/\/$/, '')
  if (!prefix) return link
  if (link.startsWith(`${prefix}/`)) return link.slice(prefix.length) || '/'
  if (link === prefix) return '/'
  return link
}

export function fileToSiteLink(relMd: string, mount: string, replace: ReplaceRule[] = []) {
  const noExt = relMd.replace(/\.md$/i, '')
  const withoutIndex = noExt.endsWith('/index') ? noExt.slice(0, -'/index'.length) : noExt === 'index' ? '' : noExt
  const replaced = applyReplace(`/${withoutIndex}`, replace)
  const mounted = mountPath(replaced, mount)
  return mounted.replace(/\/$/, '') || mount.replace(/\/$/, '') || '/'
}

export function siteLinkToSource(siteLink: string, mount: string, replace: ReplaceRule[] = []) {
  const unmounted = unmountPath(siteLink, mount)
  return undoReplace(unmounted, replace).replace(/^\/+/, '').replace(/\/+$/, '')
}
