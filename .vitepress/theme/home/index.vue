<template>
  <div class="home-root">
    <HeroSection />
    <div class="home-page">
      <ProductSection />
      <!-- 暂时隐藏最近更新模块，暂停 GitHub API 调用 -->
      <!-- <UpdateSection /> -->
    </div>
  </div>
</template>

<script setup>
import HeroSection from "./components/HeroSection.vue";
import ProductSection from "./components/ProductSection.vue";
import UpdateSection from "./components/UpdateSection.vue";
</script>

<style src="./styles.css"></style>
