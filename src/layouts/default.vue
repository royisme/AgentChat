<template>
  <div class="default-layout">
    <AppBar class="mb-4" />
    <v-main>
      <router-view />
    </v-main>
    <AppFooter class="mt-4" />

  </div>
</template>

<script lang="ts" setup>
  import AppBar from '@/components/AppBar.vue'
  import AppFooter from '@/components/AppFooter.vue';
</script>
