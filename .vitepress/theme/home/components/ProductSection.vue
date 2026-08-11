<template>
  <section class="projects-section">
    <div class="section-header">
      <div class="section-title">全部产品文档</div>
      <p class="section-subtitle">覆盖组件、低代码、生成式UI、AI 对话、智能执行、浏览器增强与 Web 智能体</p>
    </div>

    <div class="product-cards-grid">
      <div
        v-for="(row, rowIndex) in productCards"
        :key="rowIndex"
        class="product-cards-row"
      >
      <div
        v-for="card in row"
        :key="card.title"
        class="product-card"
        :class="{ 'product-card--featured': card.cover }"
      >
        <div
          v-if="card.cover"
          class="product-card-cover"
          :style="{ backgroundImage: `url(${card.cover})` }"
        ></div>
        <div class="product-card-header">
          <div class="product-card-title">{{ card.title }}</div>
          <div class="product-card-subtitle">{{ card.subtitle }}</div>
        </div>
        <div class="product-card-divider"></div>
        <div class="product-components">
          <div
            v-for="comp in card.components"
            :key="comp.name"
            class="product-component"
          >
            <img class="component-icon" :src="comp.icon" width="24" height="24" alt="" />
            <div class="component-content">
              <div class="component-name">
                {{ comp.name }}
                <span v-if="comp.badge" class="component-new-tag">{{ comp.badge }}</span>
              </div>
              <div class="component-desc">{{ comp.desc }}</div>
              <div class="component-links">
                <a
                  v-for="link in comp.links"
                  :key="link.text"
                  :href="normalizeLink(link.url, prefix)"
                  class="component-link"
                >{{ link.text }}</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useData } from "vitepress";
import { normalizeLink } from "../../utils/router";
const { site } = useData();
const prefix = site.value.base || "/";

const productCards = [
  [
  {
    title: "AI 智能应用开发产品",
    subtitle: "AI交互组件 / AI应用开发SDK / AI扩展插件 / MCP接入服务",
    cover: `${prefix}images/img-card.webp`,
    components: [
      {
        name: "TinyRobot",
        badge: "NEW",
        desc: "AI 对话组件库",
        icon: `${prefix}images/icon-tiny-robot.svg`,
        links: [
          { text: "综合示例", url: "/tiny-robot/examples/assistant" },
          { text: "迁移指南", url: "/tiny-robot/migration/bubble-migration" },
        ],
      },
      {
        name: "NEXT-SDKs",
        desc: "前端智能应用开发工具包",
        icon: `${prefix}images/icon-next-sdks.svg`,
        links: [
          { text: "全局API", url: "/next-sdk/webmcp-sdk/global-tools" },
          { text: "快速安装", url: "/next-sdk/guide/quick-start" },
        ],
      },
      {
        name: "AI-Extension",
        desc: "AI 浏览器扩展插件",
        icon: `${prefix}images/icon-ai-extension.svg`,
        links: [
          { text: "MCP大模型开发指南", url: "/next-sdk/ai-extension/next-wxt" },
        ],
      },
      {
        name: "GenUI-SDK",
        desc: "开源生成式UI",
        icon: `${prefix}images/icon-gen-ui.svg`,
        links: [
          { text: "特性示例", url: "/genui-sdk/examples/renderer/custom-actions" },
          { text: "组件文档", url: "/genui-sdk/components/renderer" },
        ],
      },
      {
        name: "WebAgent",
        desc: "MCP 代理转发服务",
        icon: `${prefix}images/icon-web-agent.svg`,
        links: [
          { text: "API参考", url: "/web-agent/guide/api-reference" },
          { text: "架构设计", url: "/web-agent/guide/architecture" },
        ],
      },
    ],
  },
  {
    title: "低代码智能搭建产品",
    subtitle: "可视化搭建 / 开放扩展能力",
    components: [
      {
        name: "TinyEngine",
        desc: "低代码智能搭建平台",
        icon: `${prefix}images/icon-tiny-engine.svg`,
        links: [
          { text: "快速上手", url: "/tiny-engine/guide/quick-start" },
          { text: "设计器简介", url: "/tiny-engine/guide/designer-ui-modules" },
        ],
      },
    ],
  },
  ],
  [
  {
    title: "前端应用开发模板产品",
    subtitle: "提供可直接复用的企业应用模板",
    components: [
      {
        name: "TinyPro Vue",
        desc: "中后台应用开发模板",
        icon: `${prefix}images/icon-tiny-pro.svg`,
        links: [
          { text: "使用指南", url: "https://opentiny.design/vue-pro/docs/introduce" },
          { text: "Pro套件", url: "https://opentiny.design/tiny-cli/docs/toolkits/pro" },
        ],
      },
      {
        name: "TinyPro Angular",
        desc: "中后台应用开发模板",
        icon: `${prefix}images/icon-tiny-pro-angular.svg`,
        links: [
          { text: "组件总览", url: "https://opentiny.design/tiny-ng" },
          { text: "Pro套件", url: "https://opentiny.design/tiny-cli/docs/toolkits/pro" },
        ],
      },
      {
        name: "TinyCli",
        desc: "脚手架底座",
        icon: `${prefix}images/icon-tiny-cli.svg`,
        links: [
          { text: "快速开始", url: "https://opentiny.design/tiny-cli/docs/start" },
          { text: "Pro套件", url: "https://opentiny.design/tiny-cli/docs/toolkits/pro" },
        ],
      },
    ],
  },
  {
    title: "UI组件库产品",
    subtitle: "为应用加入对话消息，和智能操作界面",
    components: [
      {
        name: "TinyVue",
        desc: "智能组件库",
        icon: `${prefix}images/icon-tiny-vue.svg`,
        links: [
          { text: "安装", url: "/tiny-vue/guide/installation" },
          { text: "引入组件", url: "/tiny-vue/guide/import-components" },
        ],
      },
      {
        name: "TinyNG",
        desc: "Angular 组件库",
        icon: `${prefix}images/icon-tiny-ng.svg`,
        links: [
          { text: "组件总览", url: "https://opentiny.design/tiny-ng" },
          { text: "快速上手", url: "https://opentiny.design/tiny-ng/docs/getstart" },
        ],
      },
      {
        name: "TinyCharts",
        desc: "专业图表组件库",
        icon: `${prefix}images/icon-tiny-charts.svg`,
        links: [
          { text: "快速开始", url: "https://opentiny.design/tiny-charts/" },
        ],
      },
      {
        name: "TinyEditor",
        desc: "富文本编辑器",
        icon: `${prefix}images/icon-tiny-editor.svg`,
        links: [
          { text: "自定义工具栏", url: "/tiny-editor/demo/custom-toolbar" },
        ],
      },
    ],
  },
  ],
];
</script>
