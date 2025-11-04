<template>
  <div class="next-home">
    <div class="next-title">OpenTiny NEXT <span> 文档中心 </span></div>
    <div class="next-desc">在这里你可以了解 NEXT 全家桶的功能，API 使用指南，以及相关资料。快速找到你想要文档。</div>
    <div class="next-content">
      <div class="next-content-section" v-for="(nextDate, sIdx) in nextDates" :key="sIdx">
        <div class="next-content-row">
          <!-- 左侧 -->
          <div class="next-content-col">
            <div
              class="next-content-box"
              v-for="(box, bIdx) in nextDate.nextDateLeft"
              :key="bIdx"
            >
              <template v-if="bIdx === 0">
                <div class="next-content-icon">
                  <img :src="box.icon" alt="icon" />
                </div>
                <div class="next-content-title">{{ box.title }}</div>
                <div class="next-content-desc">{{ box.desc }}</div>
              </template>
              <template v-else>
                <div class="next-content-title">{{ box.title }}</div>
                <ul class="next-content-list">
                  <li v-for="(link, i) in box.links" :key="i">
                    <a :href="link.url">{{ link.text }}</a>
                  </li>
                </ul>
              </template>
            </div>
          </div>
          <!-- 右侧 -->
          <div class="next-content-col">
            <div
              class="next-content-box"
              v-for="(box, bIdx) in nextDate.nextDateRight"
              :key="bIdx"
            >
              <template v-if="bIdx === 0">
                <div class="next-content-title">{{ box.title }}</div>
                <div class="next-content-desc next-content-desc-right">{{ box.desc }}</div>
                <ul class="next-content-list bg-list">
                  <li v-for="(link, i) in box.links" :key="i">
                    <img :src="link.icon" alt="icon" />
                    <a :href="link.url">{{ link.text }}</a>
                  </li>
                </ul>
              </template>
              <template v-else>
                <div class="next-content-title">{{ box.title }}</div>
                <ul class="next-content-list">
                  <li v-for="(link, i) in box.links" :key="i">
                    <a :href="link.url">{{ link.text }}</a>
                  </li>
                </ul>
              </template>
            </div>
          </div>
        </div>
        <!-- 分割线，最后一个section不显示 -->
        <div
          v-if="sIdx < nextDates.length - 1"
          class="next-content-divider"
        ></div>
      </div>
    </div>
  </div>
</template>
<script setup>
const nextDates = [
  {
    nextDateLeft: [
      {
        icon: '/logo-active-next-sdk.svg',
        title: 'NEXT-SDKs',
        desc: 'OpenTiny NEXT-SDKs 是一套前端智能应用开发工具包，旨在简化 WebAgent 的集成与使用，支持多种编程语言和前端框架，帮助开发者快速实现智能化功能。'
      },
      {
        title: 'NEXT-SDKs API',
        links: [
            { text: 'WebMcpClient 类', url: '/next-sdk/guide/api-client' },
            { text: 'WebMcpServer 类', url: '/next-sdk/guide/api-server' },
            { text: 'AgentModelProvider 类', url: '/next-sdk/guide/api-agentModelProvider' },
            { text: 'createRemoter 函数', url: '/next-sdk/guide/api-createRemoter' },
            { text: '工具函数', url: '/next-sdk/guide/api-tools' }
          ]
      },

    ],
    nextDateRight: [
      {
        title: '快速开始',
        desc: '使用 OpenTiny NEXT-SDKs，只需要以下四步，就可以把你的前端应用变成智能应用。',
        links: [
          { text: '让你的应用智能化',icon: '/icon-app.svg',  url: '/next-sdk/guide/#让你的应用智能化' },
          { text: '浏览器直接引入',icon: '/icon-browser.svg',  url: '/next-sdk/guide/#浏览器直接引入' },
        ]
      },
      {
        title: '指引',
        links:[
        { text: '接入三方 AI 应用', url: '/next-sdk/guide/mcp-host' },
        { text: 'Electron 应用接入', url: '/next-sdk/guide/electron' },
        { text: 'uni-app 应用接入', url: '/next-sdk/guide/uni-app' },
        { text: '本地连接', url: '/next-sdk/guide/connect-local' },
        ]
      }
    ]
  },
  {
    nextDateLeft: [
      {
        title: 'TinyRobot',
        icon: '/logo-active-tiny-robot.svg',
        desc: 'TinyRobot是符合OpenTiny Design 设计体系的 AI 组件库，提供了丰富的AI交互组件，助力开发者快速构建AI应用。'
      },
      {
        title: '组件',
        links:[
            { text: 'Container 容器', url: '/tiny-robot/components/container' },
            { text: 'Bubble 气泡', url: '/tiny-robot/components/bubble' },
            { text: 'Sender 消息输入框', url: '/tiny-robot/components/sender' },
            { text: 'Prompts 提示集', url: '/tiny-robot/components/prompts' },
            { text: 'Welcome 欢迎', url: '/tiny-robot/components/welcome' },
            { text: 'Feedback 气泡反馈', url: '/tiny-robot/components/feedback' },
            { text: 'History 历史', url: '/tiny-robot/components/history' },
            { text: 'DropdownMenu 下拉菜单', url: '/tiny-robot/components/dropdown-menu' },
            { text: 'SuggestionPopover 建议弹出框', url: '/tiny-robot/components/suggestion-popover' },
            { text: 'SuggestionPills 建议按钮组', url: '/tiny-robot/components/suggestion-pills' },
            { text: 'DragOverlay 拖拽浮层', url: '/tiny-robot/components/drag-overlay' },
            { text: 'Attachments 附件卡片', url: '/tiny-robot/components/attachments' },
            { text: 'McpServerPicker 插件选择器', url: '/tiny-robot/components/mcp-server-picker' },
            { text: 'Theme 主题', url: '/tiny-robot/components/theme' },
          ],
      },

    ],
    nextDateRight: [
      {
        title: '指南',
        desc: 'TinyRobot是符合OpenTiny Design 设计体系的 AI 组件库，提供了丰富的AI交互组件，助力开发者快速构建AI应用。',
        links: [
          { text: '安装',icon: '/icon-tool.svg', url: '/tiny-robot/guide/quick-start.html#安装' },
          { text: '引入与使用',icon: '/icon-download.svg', url: '/tiny-robot/guide/usage.html#引入与使用' },
        ]
      },
      {
        title: '工具',
        links: [
            { text: 'AI模型交互工具类', url: '/tiny-robot/tools/ai-client' },
            { text: '消息数据管理', url: '/tiny-robot/tools/message' },
            { text: '会话数据管理', url: '/tiny-robot/tools/conversation' },
        ],
      },
      {
        title: '演示',
        links: [
          { text: '综合示例', url: '/tiny-robot/examples/assistant' },
        ]
      }
    ]
  },
  // 可继续添加更多 section
]
</script>
<style scoped>



.next-home {
  margin: 80px auto;
  --next-home-bg-color: #ffffff;
  --next-home-border-color: #f0f0f0;
  --next-home-title-color: #000000;
  --next-home-content-title-color: #000000;
  --next-home-desc-color: #666666;
  --next-home-li-bg-color: #f5f5f5;
}

.dark .next-home {
  --next-home-bg-color: #000000;
  --next-home-border-color: rgba(255, 255, 255, 0.2);
  --next-home-title-color: #DEE1E6;
  --next-home-content-title-color: #e6e6e6;
  --next-home-desc-color: #b3b3b3;
  --next-home-li-bg-color: #1A1A1A;

}
.next-desc {
    font-size: 16px;
    color: var(--next-home-desc-color);
    margin-top: 8px;
    margin-bottom: 40px;
}
.next-title {
    display: flex;
    height: 60px;
    color: var(--next-home-title-color);
    font-size: 40px;
    font-weight: 600;
}
.next-content {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-top: 32px;
}
.next-content-section {
  width: 100%;
}
.next-content-row {
  display: flex;
  flex-direction: row;
  gap: 40px;
  width: 100%;
}
.next-content-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 40px;
}
.next-content-box {
  border: 1px solid var(--next-home-border-color);
  border-radius: 12px;
  padding: 32px;
  background: var(--next-home-bg-color);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  box-sizing: border-box;
}
.next-content-icon {
  height: 32px;
  margin-bottom: 16px;
}
.next-content-icon img {
  height: 32px;
  width: 32px;
}
.next-content-title {
  font-size: 28px;
  font-weight: 600;
  line-height: 37px;
  color: var(--next-home-content-title-color);
  margin-bottom: 24px;
}
.next-content-desc {
  font-size: 16px;
  color: var(--next-home-desc-color);
  line-height: 32px;  
}
.next-content-desc-right {
 margin-bottom: 24px;
}
.next-content-list {
  list-style: none !important;
  padding: 0 !important;
  margin: 0 !important;
  width: 100%;
}
.next-content-list li {
  margin-top: 16px;
}
.next-content-list li:first-child {
  margin-top: 0;
}
.next-content-list a {
  color: #1476FF !important;
  border-width: 0px !important;
  text-decoration: none;
  font-size: 15px;
  transition: color 0.2s;
}
.next-content-list a:hover {
  text-decoration: underline !important;
  text-decoration-color: #1476FF !important;

}
.bg-list{
    width: 100%;
}
.bg-list li{
  background: var(--next-home-li-bg-color);
  border-radius: 8px;
  padding: 24px;
  line-height: 21px;
  width: 100%;
  margin-top: 24px;
  display: flex;
  flex-direction: row;
  gap: 16px;
}
.bg-list li img{
    margin-top: 4px;
    height: 16px;
    width: 16px; 
}
.next-content-divider {
  height: 1px;
  background: var(--next-home-border-color);
  margin: 40px 0;
  width: 100%;
}

@media (max-width: 979px){
  .next-home{
    margin: 20px auto;
  }
  .next-title{
    font-size: 36px;
    line-height: 50px;
  }
  .next-title span{
    display: none;
  }
  .next-content{
    margin-top: 20px;
  }
  .next-desc{
    font-size: 16px;
    margin-bottom: 21px;
  }
  .next-content-row {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }  
  .next-content-box{
    padding: 28px 20px;
  } 
  .next-content-icon{
    margin-bottom: 12px;
  }
  .next-content-title{
    font-size: 20px;
    line-height: 27px;
    margin-bottom: 20px;
  }
  .next-content-desc{
    font-size: 16px;
    line-height: 32px;  
  }
}

</style>