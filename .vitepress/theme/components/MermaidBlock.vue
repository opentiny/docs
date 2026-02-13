<template>
  <div class="vp-mermaid-wrapper">
    <div v-if="errorMessage" class="vp-mermaid-error">
      <p class="vp-mermaid-error-title">Mermaid 渲染失败，已回退为源码：</p>
      <pre><code>{{ sourceCode }}</code></pre>
    </div>
    <div v-else-if="!svgCode" class="vp-mermaid-loading">Rendering Mermaid...</div>
    <div v-else class="vp-mermaid-diagram" v-html="svgCode"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vitepress'
import type { MermaidPalette } from '../utils/mermaid'
import { renderMermaidSvg } from '../utils/mermaid'

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  graph: {
    type: String,
    required: true,
  },
})

const route = useRoute()

const svgCode = ref('')
const errorMessage = ref('')
const renderVersion = ref(0)
let mutationObserver: MutationObserver | null = null

const safeId = computed(() => props.id.replace(/[^a-zA-Z0-9_-]/g, '_'))

const sourceCode = computed(() => {
  try {
    return decodeURIComponent(props.graph)
  } catch (error) {
    return props.graph
  }
})

const getIsDarkMode = () => {
  if (typeof document === 'undefined') {
    return false
  }
  return document.documentElement.classList.contains('dark')
}

const readThemePalette = (): MermaidPalette => {
  const styles = getComputedStyle(document.documentElement)
  const read = (name: string, fallback: string) => {
    const value = styles.getPropertyValue(name).trim()
    return value || fallback
  }

  return {
    bg: read('--vp-c-bg', getIsDarkMode() ? '#0b1220' : '#ffffff'),
    bgSoft: read('--vp-c-bg-soft', getIsDarkMode() ? '#1f2937' : '#f6f8fa'),
    text1: read('--vp-c-text-1', getIsDarkMode() ? '#f8fafc' : '#1f2937'),
    text2: read('--vp-c-text-2', getIsDarkMode() ? '#cbd5e1' : '#475569'),
    border: read('--vp-c-border', getIsDarkMode() ? '#64748b' : '#94a3b8'),
    brand: read('--vp-c-brand-1', getIsDarkMode() ? '#60a5fa' : '#2563eb'),
  }
}

const renderDiagram = async () => {
  if (typeof window === 'undefined') {
    return
  }

  const currentVersion = renderVersion.value + 1
  renderVersion.value = currentVersion
  svgCode.value = ''
  errorMessage.value = ''

  try {
    const svg = await renderMermaidSvg({
      id: `${safeId.value}-${currentVersion}`,
      code: sourceCode.value,
      isDark: getIsDarkMode(),
      palette: readThemePalette(),
    })

    if (currentVersion !== renderVersion.value) {
      return
    }

    svgCode.value = svg
  } catch (error) {
    if (currentVersion !== renderVersion.value) {
      return
    }
    errorMessage.value = error instanceof Error ? error.message : String(error)
  }
}

onMounted(() => {
  mutationObserver = new MutationObserver(() => {
    renderDiagram()
  })
  mutationObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })
  renderDiagram()
})

watch(() => props.graph, renderDiagram)
watch(() => route.path, renderDiagram)

onBeforeUnmount(() => {
  mutationObserver?.disconnect()
  mutationObserver = null
  renderVersion.value += 1
})
</script>
