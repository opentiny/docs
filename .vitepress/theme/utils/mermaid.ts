import type { MermaidConfig } from 'mermaid'

export interface MermaidPalette {
  bg: string
  bgSoft: string
  text1: string
  text2: string
  border: string
  brand: string
}

const BASE_MERMAID_CONFIG: MermaidConfig = {
  startOnLoad: false,
  securityLevel: 'strict',
  theme: 'base',
  fontFamily: 'var(--vp-font-family-base)',
  flowchart: {
    htmlLabels: true,
    curve: 'monotoneX'
  }
}

const FALLBACK_LIGHT_PALETTE: MermaidPalette = {
  bg: '#ffffff',
  bgSoft: '#f6f8fa',
  text1: '#1f2937',
  text2: '#475569',
  border: '#94a3b8',
  brand: '#2563eb'
}

const FALLBACK_DARK_PALETTE: MermaidPalette = {
  bg: '#0b1220',
  bgSoft: '#1f2937',
  text1: '#f8fafc',
  text2: '#cbd5e1',
  border: '#64748b',
  brand: '#60a5fa'
}

const isHexColor = (value: string) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value)

const hexToRgba = (hex: string, alpha: number) => {
  if (!isHexColor(hex)) {
    return hex
  }
  let color = hex.slice(1)
  if (color.length === 3) {
    color = color
      .split('')
      .map((char) => char + char)
      .join('')
  }
  const r = Number.parseInt(color.slice(0, 2), 16)
  const g = Number.parseInt(color.slice(2, 4), 16)
  const b = Number.parseInt(color.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const mergePalette = (palette: MermaidPalette | undefined, isDark: boolean): MermaidPalette => {
  const fallback = isDark ? FALLBACK_DARK_PALETTE : FALLBACK_LIGHT_PALETTE
  return {
    ...fallback,
    ...(palette || {})
  }
}

const getThemeVariables = (isDark: boolean, palette?: MermaidPalette): MermaidConfig['themeVariables'] => {
  const colors = mergePalette(palette, isDark)

  if (isDark) {
    return {
      darkMode: true,
      background: 'transparent',
      fontFamily: 'var(--vp-font-family-base)',
      textColor: colors.text2,
      lineColor: colors.border,
      primaryColor: colors.bgSoft,
      primaryTextColor: colors.text1,
      primaryBorderColor: colors.border,
      secondaryColor: colors.bgSoft,
      secondaryTextColor: colors.text1,
      secondaryBorderColor: colors.border,
      tertiaryColor: colors.bg,
      tertiaryTextColor: colors.text2,
      tertiaryBorderColor: colors.border,
      mainBkg: colors.bgSoft,
      secondBkg: colors.bg,
      nodeTextColor: colors.text1,
      edgeLabelBackground: hexToRgba(colors.bg, 0.92),
      clusterBkg: hexToRgba(colors.bgSoft, 0.72),
      clusterBorder: colors.border,
      actorBkg: colors.bgSoft,
      actorBorder: colors.border,
      actorTextColor: colors.text1,
      labelBoxBkgColor: hexToRgba(colors.bg, 0.92),
      labelTextColor: colors.text1,
      noteBkgColor: hexToRgba(colors.bgSoft, 0.95),
      noteBorderColor: colors.border,
      noteTextColor: colors.text1,
      signalColor: colors.text2,
      signalTextColor: colors.text1,
      titleColor: colors.text1,
      loopTextColor: colors.text1,
      activationBkgColor: colors.bgSoft,
      sequenceNumberColor: colors.bg
    }
  }

  return {
    darkMode: false,
    background: 'transparent',
    fontFamily: 'var(--vp-font-family-base)',
    textColor: colors.text2,
    lineColor: colors.border,
    primaryColor: '#ffffff',
    primaryTextColor: colors.text1,
    primaryBorderColor: colors.border,
    secondaryColor: colors.bgSoft,
    secondaryTextColor: colors.text1,
    secondaryBorderColor: colors.border,
    tertiaryColor: colors.bg,
    tertiaryTextColor: colors.text2,
    tertiaryBorderColor: colors.border,
    mainBkg: '#ffffff',
    secondBkg: colors.bgSoft,
    nodeTextColor: colors.text1,
    edgeLabelBackground: hexToRgba(colors.text2, 0.1),
    clusterBkg: hexToRgba(colors.bgSoft, 0.6),
    clusterBorder: colors.border,
    actorBkg: '#ffffff',
    actorBorder: colors.border,
    actorTextColor: colors.text1,
    labelBoxBkgColor: colors.bg,
    labelTextColor: colors.text1,
    noteBkgColor: '#fffdf0',
    noteBorderColor: '#e7d28b',
    noteTextColor: colors.text1,
    signalColor: colors.text2,
    signalTextColor: colors.text2,
    titleColor: colors.text1,
    loopTextColor: colors.text1,
    activationBkgColor: colors.bgSoft,
    sequenceNumberColor: colors.bg
  }
}

let mermaidPromise: Promise<typeof import('mermaid')> | null = null
let renderQueue = Promise.resolve()

const loadMermaid = async () => {
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid')
  }
  const module = await mermaidPromise
  return module.default
}

export const sanitizeMermaidCode = (rawCode: string) => {
  return rawCode.replace(/^\s*%%\{[\s\S]*?\}%%\s*$/gm, '').trim()
}

export const renderMermaidSvg = async (params: {
  id: string
  code: string
  isDark: boolean
  palette?: MermaidPalette
}) => {
  const graph = sanitizeMermaidCode(params.code)
  if (!graph) {
    throw new Error('Mermaid 图表内容为空。')
  }

  const task = async () => {
    const mermaid = await loadMermaid()
    const isDark = params.isDark
    mermaid.initialize({
      ...BASE_MERMAID_CONFIG,
      themeVariables: getThemeVariables(isDark, params.palette)
    })
    const { svg } = await mermaid.render(params.id, graph)
    return svg
  }

  const currentTask = renderQueue.then(task)
  renderQueue = currentTask.then(
    () => undefined,
    () => undefined
  )

  return currentTask
}
