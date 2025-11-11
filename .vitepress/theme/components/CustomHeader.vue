<template>
  <header class="custom-header">
    <div class="header-container">
      <!-- 第一行：Logo + 搜索栏 + 工具按钮 -->
      <div class="header-top">
        <!-- Logo 区域 -->
        <div class="logo-section">
          <a href="/" class="logo-link">
            <img
              :src="
                isDark
                  ? '/logo-opentiny-next-text-dark.svg'
                  : '/logo-opentiny-next-text.svg'
              "
              alt="OpenTiny NEXT"
              class="logo-icon"
            />
            <span v-if="false" class="logo-text">{{ site.title }}</span>
          </a>
          <!-- 产品区域 -->
          <div class="product-section">
            <TabNavigation
              :tabs="productTabs"
              :activeTab="activeProductTab"
              @tab-change="handleProductTabChange"
              style="width: 500px"
            />
          </div>
        </div>

        <!-- 右侧工具栏 -->
        <div class="tools-section">
          <!-- 中央搜索栏 -->
          <div class="search-section">
            <div class="search-container">
              <div class="search-icon">
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search..."
                class="search-input"
                @click="openSearch"
              />
              <div class="search-shortcut">
                <kbd class="kbd">Ctrl K</kbd>
              </div>
            </div>
          </div>
          <!-- OpenTiny 链接 -->
          <a href="https://opentiny.design" title="OpenTiny" class="home-link">
            <span>OpenTiny</span>
            <svg
              width="3"
              height="24"
              viewBox="0 -9 3 24"
              class="h-5 rotate-0 overflow-visible text-white/90"
            >
              <path
                d="M0 0L3 3L0 6"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              ></path>
            </svg>
          </a>

          <!-- 主题切换 -->
          <button @click="toggleDark" class="tool-button" title="Toggle theme">
            <svg
              v-if="!isDark"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <svg
              v-else
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          </button>

          <!-- GitHub 链接 -->
          <a
            href="https://github.com/opentiny"
            target="_blank"
            rel="noopener noreferrer"
            class="tool-button"
            title="GitHub"
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
              />
            </svg>
          </a>
        </div>
      </div>

      <!-- 第二行：移动端 -->
      <div class="mb-container">
        <div class="mb-navbar">
          <div class="mb-logo">
            <a href="/" class="logo-link">
              <img
                :src="
                  isDark
                    ? '/logo-opentiny-next-text-dark.svg'
                    : '/logo-opentiny-next-text.svg'
                "
                alt="OpenTiny NEXT"
                class="logo-icon"
              />
              <span v-if="false" class="logo-text">{{ site.title }}</span>
            </a>
          </div>

          <div class="nav-buttons">
            <button class="nav-button" @click="openSearch">
              <svg
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
            <button class="nav-button" @click="showModal = true">
              <svg
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- 第二行：主导航栏 -->
      <div class="header-bottom" v-if="showNavigation">
        <TabNavigation
          :tabs="navigationTabs"
          :activeTab="activeNavTab"
          @tab-change="handleNavTabChange"
          @tab-click="handleNavTabClick"
        />
      </div>
    </div>
  </header>
  <!-- 弹框 -->
  <div class="modal-overlay" v-if="showModal" @click="showModal = false">
    <div class="modal" @click.stop>
      <div class="modal-tabs">
        <div
          v-for="tab in productTabs"
          :key="tab.key"
          :class="getModalTabClasses(tab)"
          @click="showModal = false"
        >
          <img v-if="tab.src" :src="tab.src" class="modal-tab-icon" />
          <a
            :href="tab.link"
            rel="noopener noreferrer"
            class="modal-tab-title"
            >{{ tab.name }}</a
          >
        </div>
      </div>

      <div class="modal-theme-mb">
        <span>外观切换</span>
        <!-- 移动端主题切换 -->
        <button @click="toggleDark" class="tool-switch" title="Toggle theme">
          <svg
            v-if="!isDark"
            class="normal-svg"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <svg
            v-else
            class="dark-svg"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        </button>
      </div>
      <div class="modal-header">
        <a
          href="https://opentiny.design"
          title="OpenTiny"
          class="home-link home-link-mb"
        >
          <span>OpenTiny</span>
          <svg
            width="3"
            height="24"
            viewBox="0 -9 3 24"
            class="h-5 rotate-0 overflow-visible text-white/90"
          >
            <path
              d="M0 0L3 3L0 6"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            ></path>
          </svg>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from "vue";
import { useData, useRoute, useRouter } from "vitepress";
import TabNavigation from "./TabNavigation.vue";
import { normalizeLink, isActiveRoute, isHomePage } from "../utils/router";

// 获取 VitePress 数据
const { site, theme } = useData();

const route = useRoute();
const router = useRouter();

const showModal = ref(false);

// 获取主题配置
const themeConfig = computed(() => theme.value);

interface configNavItem {
  text: string;
  link: string;
  activeMatch?: string;
}

// 获取标签页类名
const getModalTabClasses = (tab: TabItem) => ({
  "modal-tab": true,
  "modal-tab-active": tab.key === activeProductTab.value,
});

// 转换导航配置为TabNavigation所需格式
const navigationTabs = computed(() => {
  if (
    activeProductTab.value === "next-sdk" &&
    route.path.includes("/next-sdk/")
  ) {
    return [{ key: "guide", name: "使用文档", link: "/next-sdk/guide/" }];
  } else if (
    activeProductTab.value === "tiny-vue" &&
    route.path.includes("/tiny-vue/")
  ) {
    return [{ key: "guide", name: "使用文档", link: "/tiny-vue/guide/" }];
  } else {
    let configNav: configNavItem[] = [];
    if (
      activeProductTab.value === "tiny-engine" &&
      route.path.includes("/tiny-engine/")
    ) {
      configNav = themeConfig.value.engineNav || [];
    } else {
      configNav = themeConfig.value.nav || [];
    }
    return (
      configNav?.map((item: configNavItem) => ({
        key:
          getConfigKey(item.link) ||
          item.text.toLowerCase().replace(/\s+/g, "-"),
        name: item.text,
        link: `${prefix}${item.link.slice(1)}`,
        disabled: false,
      })) || []
    );
  }
});

interface TabItem {
  key: string;
  name: string;
  link: string;
  disabled?: boolean;
}

// 是否显示导航栏: 如果当前路径是首页，则不显示导航栏
const getConfigKey = (link: any) => {
  return link.replace(/\/$/, "").split("/")[2];
};
// 是否显示导航栏: 如果当前路径是首页，则不显示导航栏
const showNavigation = computed(() => {
  return !isHomePage(route.path, site.value.base);
});

// 当前激活的导航标签
const activeNavTab = ref("");

// 处理导航标签变化
const getActiveNavTab = () => {
  const currentTab = navigationTabs.value.find((tab: TabItem) =>
    isActiveNav({ text: tab.name, link: tab.key, activeMatch: undefined })
  );
  activeNavTab.value =
    activeProductTab.value === "next-sdk" && route.path.includes("/next-sdk/")
      ? "guide"
      : currentTab?.key || "";
};

// 处理导航标签变化
const handleNavTabChange = (tabKey: string) => {
  const tab = navigationTabs.value.find((t: TabItem) => t.key === tabKey);
  if (tab?.link) {
    // 使用 VitePress 路由进行 SPA 导航，确保使用正确的路径
    const targetPath = normalizeLink(tab.link, site.value.base);
    router.go(targetPath);
  }
};

// 处理导航标签点击
const handleNavTabClick = (tab: TabItem) => {
  if (tab.link) {
    // 使用 VitePress 路由进行 SPA 导航，确保使用正确的路径
    const targetPath = normalizeLink(tab.link, site.value.base);
    router.go(targetPath);
  }
};

// 暗色模式状态
const isDark = ref(false);

// 初始化暗色模式状态
onMounted(() => {
  isDark.value = document.documentElement.classList.contains("dark");
});

// 切换暗色模式
const toggleDark = () => {
  const html = document.documentElement;
  const isDarkMode = html.classList.contains("dark");

  if (isDarkMode) {
    html.classList.remove("dark");
    localStorage.setItem("vitepress-theme-appearance", "light");
    isDark.value = false;
  } else {
    html.classList.add("dark");
    localStorage.setItem("vitepress-theme-appearance", "dark");
    isDark.value = true;
  }
};

interface NavItem {
  text: string;
  link: string;
  activeMatch?: string;
}

// 判断导航项是否激活
const isActiveNav = (navItem: NavItem) => {
  return isActiveRoute(
    route.path,
    navItem.link,
    navItem.activeMatch,
    site.value.base
  );
};

// 打开搜索
const openSearch = () => {
  // 触发 VitePress 默认搜索
  const event = new KeyboardEvent("keydown", {
    key: "k",
    ctrlKey: true,
    bubbles: true,
  });
  document.dispatchEvent(event);
};

const prefix = site.value.base || "/";

// 默认激活NEXT-SDKs
const activeProductTab = ref("");
// 产品Tab配置
const productTabs = computed(() => [
  {
    key: "next-sdk",
    name: "NEXT-SDKs",
    link: `${prefix}next-sdk/guide`,
    src: `${prefix}logo-${
      activeProductTab.value === "next-sdk" ? "active" : "normal"
    }-next-sdk.svg`,
  },
  {
    key: "tiny-robot",
    name: "TinyRobot",
    link: `${prefix}tiny-robot/guide/quick-start`,
    src: `${prefix}logo-${
      activeProductTab.value === "tiny-robot" ? "active" : "normal"
    }-tiny-robot.svg`,
  },
  {
    key: "tiny-vue",
    name: "TinyVue",
    link: `${prefix}tiny-vue/guide/envpreparation-open`,
    src: `${prefix}logo-active-next-sdk.svg`,
  },
  {
    key: "tiny-engine",
    name: "TinyEngine",
    link: `${prefix}tiny-engine/engines/introduction`,
    src: `${prefix}logo-active-next-sdk.svg`,
  },
]);

// 切换tab时路由跳转
const handleProductTabChange = (tabKey: string) => {
  const tab = productTabs.value.find((t) => t.key === tabKey);
  if (tab?.link) {
    const targetPath = normalizeLink(tab.link, site.value.base);
    router.go(targetPath);
    activeProductTab.value = tabKey;
  }
};

watch(
  () => route.path,
  () => {
    getActiveNavTab();
    const path = route.path.replace(new RegExp(`^${site.value.base}`), "/");
    if (path.includes("/next-sdk/")) {
      activeProductTab.value = "next-sdk";
    } else if (path.includes("/tiny-robot/")) {
      activeProductTab.value = "tiny-robot";
    } else if (path.includes("/tiny-vue/")) {
      activeProductTab.value = "tiny-vue";
    } else if (path.includes("/tiny-engine/")) {
      activeProductTab.value = "tiny-engine";
    } else {
      activeProductTab.value = "";
    }
  },
  { deep: true, immediate: true }
);
</script>

<style lang="less" scoped>
.custom-header {
  --vp-c-divider: #f9f9f9;
  --search-border-color: #dfdfdf;

  position: sticky;
  top: 0;
  z-index: 50;
  width: 100%;
  border-bottom: 1px solid var(--vp-c-divider);
  background-color: var(--vp-c-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.dark .custom-header {
  --vp-c-divider: #282c34;
  --search-border-color: rgba(255, 255, 255, 0.2);
  background-color: #000000;
}

.header-container {
  max-width: 92rem;
  margin: 0 auto;
  width: 100%;
}

/* 第一行样式 */
.header-top {
  display: flex;
  height: 4rem;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--vp-c-divider);
  margin-left: 3rem;
  margin-right: 3rem;
}

.logo-section {
  display: flex;
  align-items: center;
}

.product-section {
  padding-left: 48px;
  position: relative;
}

.product-section:before {
  content: "";
  border-left: 1px solid #f0f0f0;
  position: absolute;
  top: 12px;
  left: 0;
  height: 50%;
  z-index: 2;
}
.dark .product-section:before {
  border-left: 1px solid rgba(255, 255, 255, 0.2);
}

.logo-link {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: var(--vp-c-text-1);
  margin-right: 48px;
}

.logo-icon {
  height: 32px;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
}

/* 搜索栏样式 */
.search-section {
  display: flex;
  flex: 1;
  max-width: 512px;
  margin: 0 32px;
}

.search-container {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--vp-c-text-2);
  pointer-events: none;
}

.search-input {
  width: 100%;
  height: 39px;
  padding: 0 64px 0 40px;
  border: 1px solid var(--search-border-color);
  border-radius: 12px;
  font-size: 14px;
  color: var(--vp-c-text-1);
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 3px var(--vp-c-brand-soft);
  background-color: var(--vp-c-bg);
}

.search-input::placeholder {
  color: var(--vp-c-text-2);
}

.search-shortcut {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
}

.kbd {
  padding: 4px 8px;
  background-color: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  font-size: 12px;
  font-family: ui-monospace, SFMono-Regular, Monaco, Consolas, monospace;
  color: var(--vp-c-text-2);
}

/* 工具栏样式 */
.tools-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.home-link {
  --home-link-bg-color: #191919;
  --home-link-text-color: #ffffff;
  --tool-button-color: #f5f5f5;

  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--home-link-text-color);
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s ease;
  padding: 4px 16px;
  border-radius: 25px;
  text-align: center;
  background-color: var(--home-link-bg-color);
}

.home-link-mb {
  width: 182px;
  line-height: 38px;
  justify-content: center;
  padding: 0;
}

.dark .home-link {
  --home-link-bg-color: #1476ff;
  --home-link-text-color: #ffffff;
  --tool-button-color: #1a1a1a;
}

.tool-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  border-radius: 32px;
  color: var(--tool-button-color);
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.tool-button:hover {
  background-color: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}
.tool-switch {
  position: relative;
  border-radius: 11px;
  display: block;
  width: 40px;
  height: 20px;
  flex-shrink: 0;
  margin-top: 8px;
  border: 1px solid #e6e6e6;
  background-color: #f0f0f0;
  transition: border-color 0.25s, background-color 0.25s;
}
.tool-switch .normal-svg {
  background: #ffffff;
  border-radius: 50%;
}
.dark .tool-switch {
  border: 1px solid #333333;
  background-color: #333333;
  display: flex;
  flex-direction: row-reverse;
}
.dark .tool-switch .dark-svg {
  background: #000000;
  border-radius: 50%;
}
/* 第二行样式 */
.header-bottom {
  height: var(--vp-nav-bottom-height);
  align-items: center;
  padding-left: 3rem;
  padding-right: 3rem;
}

/* 响应式设计 */
@media (min-width: 980px) {
  .header-top {
    display: flex;
  }
  .mb-container {
    display: none;
  }
}

@media (max-width: 979px) {
  .header-top {
    display: none;
  }
  .mb-container {
    display: block;
  }
  .mb-navbar {
    height: 64px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 16px;
    position: relative;
    border-bottom: 1px solid var(--search-border-color);
  }

  .mb-logo {
    display: flex;
    align-items: center;
  }

  .nav-buttons {
    display: flex;
    gap: 20px;
  }

  .nav-button {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 32px;
  }

  .nav-button svg {
    width: 20px;
    height: 20px;
    margin-left: 6px;
  }

  .nav-button:hover {
    background-color: var(--vp-c-bg-soft);
  }
  .modal-overlay {
    position: fixed;
    overflow-y: auto;
    z-index: 99;
    inset: 0;
    backdrop-filter: blur(4px);
    background-color: rgba(11, 12, 15, 0.2) !important;
  }
  .dark .modal-overlay {
    background: rgba(0, 0, 0, 0.8);
  }
  .modal {
    position: fixed;
    top: 64px;
    right: 0;
    width: 223px;
    border-radius: 12px;
    padding: 20px;
    background: rgb(255, 255, 255);
    overflow: hidden;
    z-index: 1000;
    animation: modal-appear 0.3s ease-out;
    border: 1px solid rgba(0, 0, 0, 0.2);
  }
  .dark .modal {
    background: rgba(0, 0, 0);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  @keyframes modal-appear {
    from {
      opacity: 0;
      transform: translateY(-20px) scale(0.9);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .modal-header {
    color: var(--home-link-text-color);
    font-weight: 600;
    font-size: 18px;
    margin-top: 16px;
  }

  .modal-theme-mb {
    display: flex;
    margin-top: 16px;
    background-color: #f5f5f5;
    border-radius: 8px;
    line-height: 38px;
    font-size: 14px;
    color: #595959;
    padding: 0 12px;
  }
  .modal-theme-mb span {
    flex: 1;
  }
  .modal-theme-mb .tool-button {
    margin-top: 3px;
  }
  .dark .modal-theme-mb {
    background-color: #1a1a1a;
    color: #ffffff;
  }
  .modal-tabs {
    display: flex;
    flex-direction: column;
    border-bottom: 1px solid #e6e6e6;
  }
  .dark .modal-tabs {
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }

  .modal-tab {
    display: flex;
    align-items: center;
    cursor: pointer;
    margin-bottom: 16px;
    transition: all 0.2s ease;
  }

  .modal-tab-icon {
    font-size: 20px;
    margin-right: 15px;
    color: #4b6cb7;
    width: 24px;
    text-align: center;
  }

  .modal-tab-title {
    font-size: 16px;
    color: #595959;
  }
  .modal-tab-active .modal-tab-title {
    color: #191919;
  }
  .dark .modal-tab-active .modal-tab-title {
    color: #e6e6e6;
  }
  .modal-tab-title:hover {
    color: #191919;
  }
  .dark .modal-tab-title {
    color: #808080;
  }
  .dark .modal-tab-title:hover {
    color: #e6e6e6;
  }

  .mb-route-indicator {
    background: #e9ecef;
    padding: 10px 15px;
    border-radius: 8px;
    display: inline-block;
    margin-top: 10px;
    font-weight: 500;
    color: #495057;
  }
}
@media (max-width: 679px) {
  .header-top {
    display: none;
  }
}
/* 可访问性支持 */
@media (prefers-contrast: high) {
  .custom-header {
    border-bottom: 2px solid var(--vp-c-divider);
  }

  .nav-item-active::before {
    height: 3px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .nav-item-active::after,
  .nav-item,
  .tool-button,
  .search-input {
    animation: none;
    transition: none;
  }
}
</style>
