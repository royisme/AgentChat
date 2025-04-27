<script setup lang="ts">
  import { useThemeStore } from '@/stores/theme'
  const themeStore = useThemeStore()
</script>

<template>
  <v-btn
    class="theme-toggle-btn"
    :class="{ 'dark-theme': themeStore.isDark, 'light-theme': !themeStore.isDark }"
    elevation="2"
    height="40"
    min-width="40"
    width="40"
    @click="themeStore.toggleTheme"
  >
    <v-icon :icon="themeStore.isDark ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent'" />
    <v-tooltip activator="parent" location="bottom">
      {{ themeStore.isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode' }}
    </v-tooltip>
  </v-btn>
</template>

<style scoped>
.theme-toggle-btn {
  transition: all 0.3s ease;
  border-radius: 50%;
  position: relative;
  overflow: hidden;
}

.theme-toggle-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  transition: all 0.3s ease;
  z-index: -1;
}

.light-theme {
  background: linear-gradient(145deg, #ffeb3b, #ffc107);
  color: #333;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.light-theme:hover {
  background: linear-gradient(145deg, #ffc107, #ff9800);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.dark-theme {
  background: linear-gradient(145deg, #424242, #212121);
  color: #ffd54f;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.dark-theme:hover {
  background: linear-gradient(145deg, #212121, #000000);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4), 0 0 8px rgba(255, 213, 79, 0.3);
}

.v-icon {
  font-size: 20px;
  transition: all 0.3s ease;
}

.dark-theme .v-icon {
  transform: rotate(0deg);
}

.light-theme .v-icon {
  transform: rotate(360deg);
}
</style>