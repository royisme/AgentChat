<template>
  <v-footer class="text-center d-flex flex-column" :class="themeStore.isDark ? 'bg-surface' : 'bg-primary'">
    <div class="py-4 text-white">
      <p>© {{ new Date().getFullYear() }} AI Agent Hub - A JACHacks 2025 Project. All rights reserved.</p>
    </div>
  </v-footer>
</template>

<script setup lang="ts">
  import { useThemeStore } from '@/stores/theme'
  const themeStore = useThemeStore()
</script>

<style scoped lang="sass">
</style>
