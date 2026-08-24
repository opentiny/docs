<template>
  <div class="home-root">
    <HeroSection />
    <div class="home-page">
      <ProductSection />
      <UpdateSection />
    </div>
  </div>
</template>

<script setup>
import HeroSection from "./components/HeroSection.vue";
import ProductSection from "./components/ProductSection.vue";
import UpdateSection from "./components/UpdateSection.vue";
</script>

<style src="./styles.css"></style>
