<template>
  <section
    class="hero-section"
    
  >
    <div class="hero-bg" :style="{ backgroundImage: `url(${prefix}images/img-bg.webp)` }"></div>
    <div
      class="hero-title"
      :style="{ backgroundImage: `url(${titleSrc})` }"
      role="img"
      aria-label="欢迎来到 OpenTiny 文档中心"
    ></div>
    <div class="hero-subtitle">
      OpenTiny官方文档， 可查阅产品介绍、快速入门、用户指南、开发指南、API参考、SDK参考、视频帮助等信息。
    </div>
    <div class="hero-search" ref="searchContainer">
      <div class="search-box">
        <img class="search-icon" :src="prefix + 'images/icon-search.svg'" width="20" height="20" alt="搜索" />
        <input v-model="searchQuery" type="text" placeholder="请输入关键词，如产品名称、组件名称、技术疑点等" @input="onSearch" @focus="searchFocused = true" @keydown.enter="onSearchEnter" />
        <svg v-if="searchQuery" class="clear-icon" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" @click="clearSearch">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <!-- 搜索结果 -->
      <div v-if="searchResults.length && searchFocused" class="search-results">
        <div class="search-results-scroll">
        <a
          v-for="result in searchResults"
          :key="result.id"
          :href="result.id"
          class="result-item"
        >
          <div class="result-titles">
            <template v-for="(t, i) in result.titles" :key="i">
              <span class="result-text" v-html="highlight(t, result.terms)"></span>
              <svg class="result-chevron" width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </template>
            <span class="result-text" v-html="highlight(result.title, result.terms)"></span>
          </div>
        </a>
        </div>
      </div>
      <!-- 热门搜索 -->
      <div class="hot-search">
        <img class="hot-icon" :src="prefix + 'images/icon-fire.svg'" width="14" height="14" alt="热门" />
        <span class="hot-label">热门搜索：</span>
        <a v-for="item in hotSearches" :key="item.text" :href="item.url" class="hot-tag">{{ item.text }}</a>
      </div>
    </div>
    <div class="hero-entries">
      <div
        v-for="card in categoryCards"
        :key="card.title"
        class="category-card"
      >
        <span v-if="card.hot" class="hot-badge">
          <img :src="prefix + 'images/icon-fire.svg'" width="12" height="12" alt="" />
          HOT
        </span>
        <img class="category-icon" :src="card.icon" width="40" height="40" alt="" />
        <div class="category-title">{{ card.title }}</div>
        <div class="category-subtitle">{{ card.subtitle }}</div>
        <div class="category-links">
          <a
            v-for="link in card.links"
            :key="link.text"
            :href="normalizeLink(link.url, prefix)"
            target="_blank"
            rel="noopener noreferrer"
            class="category-link"
          >{{ link.text }}</a>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useData } from "vitepress";
import MiniSearch from "minisearch";
import localSearchIndex from "@localSearchIndex";
import { normalizeLink } from "../../utils/router";

const { site } = useData();
const prefix = site.value.base || "/";
const isDarkMode = ref(false);
const titleSrc = computed(() => `${prefix}images/header-title${isDarkMode.value ? "-dark" : ""}.svg`);
let darkObserver = null;

// 内联搜索（与 VitePress 头部搜索使用同一索引）
const searchQuery = ref("");
const searchResults = ref([]);
const searchFocused = ref(false);
const searchContainer = ref(null);
let searchIndex = null;
let debounceTimer = null;

onMounted(async () => {
  try {
    const indexModule = await localSearchIndex["root"]();
    const jsonStr = indexModule.default;
    searchIndex = MiniSearch.loadJSON(jsonStr, {
      fields: ["title", "titles", "text"],
      storeFields: ["title", "titles"],
      searchOptions: {
        fuzzy: 0.2,
        prefix: true,
        boost: { title: 4, text: 2, titles: 1 },
      },
    });
  } catch {
    // 搜索索引加载失败
  }

  // 点击空白关闭搜索结果
  document.addEventListener("click", onClickOutside);

  // 监听暗色模式切换（VitePress 在 <html> 上 toggle .dark class）
  const updateDark = () => {
    isDarkMode.value = document.documentElement.classList.contains("dark");
  };
  updateDark();
  darkObserver = new MutationObserver(updateDark);
  darkObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
});

onUnmounted(() => {
  document.removeEventListener("click", onClickOutside);
  if (darkObserver) darkObserver.disconnect();
});

const onClickOutside = (e) => {
  if (searchContainer.value && !searchContainer.value.contains(e.target)) {
    searchFocused.value = false;
  }
};

// 回车跳转第一条结果
const onSearchEnter = () => {
  if (searchResults.value.length) {
    window.location.href = searchResults.value[0].id;
  }
};

const onSearch = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const query = searchQuery.value.trim();
    if (!query || !searchIndex) {
      searchResults.value = [];
      return;
    }
    try {
      searchResults.value = searchIndex.search(query).slice(0, 20);
    } catch {
      searchResults.value = [];
    }
  }, 200);
};

const clearSearch = () => {
  searchQuery.value = "";
  searchResults.value = [];
};

// 高亮匹配关键词：先转义 text 防止 v-html 注入，再包裹 <mark>
const escapeHtml = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const highlight = (text, terms) => {
  if (!text) return "";
  const safe = escapeHtml(text);
  if (!terms || !terms.length) return safe;
  const escaped = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(`(${escaped.join("|")})`, "gi");
  return safe.replace(regex, "<mark>$1</mark>");
};

// 热门搜索
const hotSearches = [
  { text: "SDK Server 基础使用文档", url: `${prefix}next-sdk/webmcp-sdk/webmcp-server.html` },
  { text: "NEXT-SDKs API", url: `${prefix}next-sdk/webmcp-sdk/global-tools` },
  { text: "TinyRobot 快速开始", url: `${prefix}tiny-robot/guide/quick-start` },
];

// 四分类卡片
const categoryCards = [
  {
    title: "API 开发文档",
    subtitle: "查阅各产品 API 参考文档",
    icon: `${prefix}images/icon-api.svg`,
    hot: true,
    links: [
      { text: "NEXT-SDKs WebMCP API", url: "/next-sdk/guide/webmcp-article.html" },
      { text: "TinyEditor API", url: "/tiny-editor/api/fluent-editor-instance.html" },
      { text: "TinyRobot API", url: "/tiny-robot/tools/ai-client.html#api" },
      { text: "WebAgent API", url: "/web-agent/guide/api-reference.html" },
    ],
  },
  {
    title: "SDKs 开发文档",
    subtitle: "各产品 SDK 接入与使用指南",
    icon: `${prefix}images/icon-sdk.svg`,
    links: [
      { text: "NEXT-SDKs WebMCP", url: "/next-sdk/guide/quick-start.html" },
      { text: "TinyEditor", url: "/tiny-editor/guide/quick-start.html" },
      { text: "TinyRobot", url: "/tiny-robot/components/container.html" },
      { text: "WebAgent API", url: "/web-agent/guide/api-reference.html" },
    ],
  },
  {
    title: "开发指南",
    subtitle: "MCP 工具开发与最佳实践",
    icon: `${prefix}images/icon-guide.svg`,
    links: [
      { text: "NEXT-SDKs", url: "/next-sdk/guide/quick-start.html" },
      { text: "GenUI SDK", url: "/genui-sdk/guide/quick-start.html" },
      { text: "TinyRobot", url: "/tiny-robot/guide/quick-start.html" },
      { text: "TinyVue", url: "/tiny-vue/guide/installation.html" },
      { text: "TinyEditor", url: "/tiny-editor/guide/quick-start.html" },
      { text: "TinyEngine", url: "/tiny-engine/guide/quick-start.html" },
      { text: "WebAgent", url: "/web-agent/guide/getting-started.html" },
    ],
  },
  {
    title: "产品演示场",
    subtitle: "体验各产品功能与示例",
    icon: `${prefix}images/icon-demo.svg`,
    links: [
      { text: "TinyRobot", url: "/tiny-robot/examples/assistant.html" },
      { text: "TinyEditor", url: "/tiny-editor/demo/basic-usage.html" },
      { text: "TinyEngine", url: "https://opentiny.design/tiny-engine#/tiny-engine-editor" },
    ],
  },
];
</script>
