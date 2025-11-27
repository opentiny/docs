---
layout: false
---

<script setup>
import { useRouter  } from 'vitepress'
import { onMounted } from 'vue'

const router = useRouter()

// 文件映射配置
const fileMap = {
  'extension': '/downloads/extension.zip',
}

// 获取文件名
const getFileName = (fileKey) => {
  const names = {
    'extension': 'extension.zip',
  }
  return names[fileKey] || 'download.zip'
}

onMounted(() => {
  const fileKey = 'extension'
  const fileUrl = fileMap[fileKey]
  if (fileUrl) {
    // 创建隐藏的下载链接
    const link = document.createElement('a')
    link.href = fileUrl
    link.download = getFileName(fileKey)
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // 下载后跳转回首页
    setTimeout(() => {
      router.go('/')
    }, 1000)
  } else {
    // 文件不存在，跳转到错误页面
  }
})
</script>

<template>
  <div class="download-container">
    <p>文件下载准备中...</p>
    <p v-if="!fileUrl">如果下载没有自动开始，<a href="/">请返回首页</a></p>
  </div>
</template>

<style scoped>
.download-container {
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
}
p{
  font-size: 16px;
  color: #333;
  margin: 8px 0;
}

a{
  color: #1476FF;
}
</style>
