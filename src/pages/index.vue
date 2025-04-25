<template>
  <div class="landing-page">

    <v-container>
      <v-row align="center" class="hero-section" justify="center">
        <v-col class="text-center text-md-left" cols="12" md="6">
          <h1 class="text-h2 font-weight-bold mb-4">
            Your AI Insurance Expert
          </h1>
          <p class="text-h6 mb-6" :class="themeStore.isDark ? 'text-grey-lighten-1' : 'text-grey-darken-1'">
            Get instant answers to your insurance questions with our AI-powered assistant. Available 24/7 to help you understand coverage, claims, and policies.
          </p>
          <v-btn
            class="text-none"
            color="secondary"
            size="x-large"
            @click="router.push('/chat')"
          >
            Start Your Consultation
          </v-btn>
        </v-col>

        <v-col class="text-center" cols="12" md="6">
          <v-img
            alt="AI Insurance Assistant"
            class="rounded-lg"
            max-height="400"
            src="https://images.pexels.com/photos/7876708/pexels-photo-7876708.jpeg"
          />
        </v-col>
      </v-row>

      <v-row class="features-section my-16">
        <v-col class="text-center mb-12" cols="12">
          <h2 class="text-h3 font-weight-bold mb-3">How We Help You</h2>
          <p class="text-h6" :class="themeStore.isDark ? 'text-grey-lighten-1' : 'text-grey-darken-1'">
            Expert assistance across all your insurance needs
          </p>
        </v-col>

        <v-col cols="12" md="4">
          <v-card class="feature-card" elevation="0">
            <v-card-item>
              <template #prepend>
                <v-icon
                  color="primary"
                  icon="mdi-shield-check"
                  size="x-large"
                />
              </template>
              <v-card-title class="text-h5">Coverage Guidance</v-card-title>
              <v-card-text>
                Understand different types of insurance coverage and find the right protection for your needs.
              </v-card-text>
            </v-card-item>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card class="feature-card" elevation="0">
            <v-card-item>
              <template #prepend>
                <v-icon
                  color="primary"
                  icon="mdi-file-document"
                  size="x-large"
                />
              </template>
              <v-card-title class="text-h5">Claims Support</v-card-title>
              <v-card-text>
                Get step-by-step guidance through the claims process and maximize your benefits.
              </v-card-text>
            </v-card-item>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card class="feature-card" elevation="0">
            <v-card-item>
              <template #prepend>
                <v-icon
                  color="primary"
                  icon="mdi-calculator"
                  size="x-large"
                />
              </template>
              <v-card-title class="text-h5">Premium Calculations</v-card-title>
              <v-card-text>
                Understand how premiums are calculated and find ways to optimize your costs.
              </v-card-text>
            </v-card-item>
          </v-card>
        </v-col>
      </v-row>


    </v-container>

    <v-footer class="text-center d-flex flex-column" :class="themeStore.isDark ? 'bg-surface' : 'bg-primary'">
      <div class="py-4 text-white">
        <p>© {{ new Date().getFullYear() }} Insurance AI Assistant. All rights reserved.</p>
      </div>
    </v-footer>
  </div>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router'
  import { useThemeStore } from '@/stores/theme'
  import ThemeToggle from '@/components/ThemeToggle.vue'

  const router = useRouter()
  const themeStore = useThemeStore()
</script>

<style scoped>
.landing-page {
  background-color: rgb(var(--v-theme-background));
}

.hero-section {
  min-height: 80vh;
  display: flex;
  align-items: center;
}

.feature-card {
  height: 100%;
  transition: transform 0.3s ease;
  border: 1px solid rgb(var(--v-theme-surface-variant));
  border-radius: 12px;
}

.feature-card:hover {
  transform: translateY(-4px);
}

.cta-section {
  background-color: rgb(var(--v-theme-surface-variant));
  border-radius: 24px;
  padding: var(--spacing-6);
}

@media (max-width: 600px) {
  .hero-section {
    min-height: auto;
    padding: var(--spacing-4) 0;
  }

  .cta-section {
    padding: var(--spacing-4);
  }
}
</style>
