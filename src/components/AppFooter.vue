<template>
  <v-footer class="footer-container text-center d-flex flex-column pa-0" :class="themeStore.isDark ? 'bg-surface' : 'bg-primary'">
    <div class="py-4 text-white">
      <p>© {{ new Date().getFullYear() }} AI Agent Hub - A JACHacks 2025 Project. All rights reserved.</p>
    </div>
  </v-footer>
</template>

<script setup lang="ts">
  import { useThemeStore } from '@/stores/theme'
  const themeStore = useThemeStore()
</script>

<style scoped>
.footer-container {
  width: 100%;
}
</style>
