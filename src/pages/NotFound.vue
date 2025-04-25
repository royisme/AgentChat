<script setup lang="ts">
  import { useRouter } from 'vue-router'

  const router = useRouter()

  const goHome = () => {
    router.push('/')
  }
</script>

<template>
  <div class="not-found">
    <div class="not-found-content">
      <v-icon class="mb-4" color="primary" size="100">mdi-alert-circle-outline</v-icon>
      <h1 class="text-h2 mb-4">404</h1>
      <p class="text-h5 mb-6">Page Not Found</p>
      <p class="mb-8">The page you are looking for doesn't exist or has been moved.</p>
      <v-btn color="primary" size="large" @click="goHome">
        Go Home
      </v-btn>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--neutral-50);
}

.not-found-content {
  text-align: center;
  padding: var(--spacing-4);
  max-width: 500px;
}
</style>
