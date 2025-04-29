<template>
  <div class="default-layout">
    <AppBar />
    <v-main class="main-content">
      <router-view />
    </v-main>
    <AppFooter class="app-footer" />
  </div>

</template>

<script lang="ts" setup>
  import AppBar from '@/components/AppBar.vue'
  import AppFooter from '@/components/AppFooter.vue';
</script>

<style scoped>
.default-layout {
  min-height: 100vh; /* 至少占满视口高度 */
  display: flex;
  flex-direction: column;
}
.app-footer {
  width: 100%;
  max-height: fit-content;
  z-index: 1;
}
</style>
