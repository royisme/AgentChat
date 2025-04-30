<template>
  <div class="landing-page">
    <v-container>
      <v-row align="center" class="hero-section" justify="center">
        <v-col class="text-center text-md-left" cols="12" md="6">
          <div class="hackathon-badge mb-4">
            <v-chip
              class="text-uppercase font-weight-bold"
              color="secondary"
              size="large"
            >
              Smart Insurance Consultation
            </v-chip>
          </div>
          <h1 class="text-h2 font-weight-bold mb-4">
            Your Personal Insurance AI Advisor
          </h1>
          <p class="text-h6 mb-6" :class="themeStore.isDark ? 'text-grey-lighten-1' : 'text-grey-darken-1'">
            Get instant, personalized insurance quotes and expert advice. Our AI assistant helps you understand your coverage options and find the best insurance solutions for your needs.
          </p>
          <v-btn
            class="text-none"
            color="secondary"
            size="x-large"
            @click="router.push('/login')"
          >
            Get Your Quote Now
          </v-btn>
        </v-col>

        <v-col class="text-center" cols="12" md="6">
          <v-img
            alt="Insurance Consultation"
            class="rounded-lg"
            max-height="400"
            src="https://images.pexels.com/photos/7876708/pexels-photo-7876708.jpeg"
          />
        </v-col>
      </v-row>

      <v-row class="features-section my-16">
        <v-col class="text-center mb-12" cols="12">
          <h2 class="text-h3 font-weight-bold mb-3">Comprehensive Insurance Solutions</h2>
          <p class="text-h6" :class="themeStore.isDark ? 'text-grey-lighten-1' : 'text-grey-darken-1'">
            Expert guidance for all your insurance needs, powered by advanced AI
          </p>
        </v-col>

        <v-col cols="12" md="4">
          <v-card class="feature-card" elevation="0">
            <v-card-item>
              <template #prepend>
                <v-icon
                  color="primary"
                  icon="mdi-car-insurance"
                  size="x-large"
                />
              </template>
              <v-card-title class="text-h5">Auto Insurance</v-card-title>
              <v-card-text>
                Get instant quotes for comprehensive, collision, and liability coverage. Compare options from top insurers.
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
                  icon="mdi-home-insurance"
                  size="x-large"
                />
              </template>
              <v-card-title class="text-h5">Home Insurance</v-card-title>
              <v-card-text>
                Protect your home with customized coverage for property damage, liability, and personal belongings.
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
                  icon="mdi-shield-check"
                  size="x-large"
                />
              </template>
              <v-card-title class="text-h5">Life Insurance</v-card-title>
              <v-card-text>
                Secure your family's future with term life, whole life, and universal life insurance options.
              </v-card-text>
            </v-card-item>
          </v-card>
        </v-col>
      </v-row>

      <v-row align="center" class="benefits-section my-16 py-16" justify="center">
        <v-col class="text-center mb-8" cols="12">
          <h2 class="text-h3 font-weight-bold mb-3">Why Choose Our AI Assistant?</h2>
          <p class="text-h6" :class="themeStore.isDark ? 'text-grey-lighten-1' : 'text-grey-darken-1'">
            Experience the future of insurance consultation with our advanced AI technology
          </p>
        </v-col>

        <v-col class="text-center" cols="12" md="8">
          <v-timeline align="start">
            <v-timeline-item
              dot-color="secondary"
              size="small"
            >
              <div class="text-left">
                <h3 class="text-h6 mb-2">Instant Quotes</h3>
                <p>Get accurate insurance quotes in seconds, tailored to your specific needs</p>
              </div>
            </v-timeline-item>

            <v-timeline-item
              dot-color="secondary"
              size="small"
            >
              <div class="text-left">
                <h3 class="text-h6 mb-2">Expert Guidance</h3>
                <p>Receive personalized advice on coverage options and policy features</p>
              </div>
            </v-timeline-item>

            <v-timeline-item
              dot-color="secondary"
              size="small"
            >
              <div class="text-left">
                <h3 class="text-h6 mb-2">24/7 Availability</h3>
                <p>Access insurance information and support whenever you need it</p>
              </div>
            </v-timeline-item>
          </v-timeline>
        </v-col>
      </v-row>

      <v-row align="center" class="cta-section my-16" justify="center">
        <v-col class="text-center" cols="12" md="8">
          <h2 class="text-h3 font-weight-bold mb-3">Ready to Find Your Perfect Coverage?</h2>
          <p class="text-h6 mb-6" :class="themeStore.isDark ? 'text-grey-lighten-1' : 'text-grey-darken-1'">
            Get started with our AI insurance assistant and find the right coverage for your needs
          </p>
          <v-btn
            class="text-none"
            color="secondary"
            size="x-large"
            @click="router.push('/login')"
          >
            Get Your Quote
          </v-btn>
        </v-col>
      </v-row>
    </v-container>

  </div></template>

<script setup lang="ts">
  import { useRouter } from 'vue-router'
  import { useThemeStore } from '@/stores/theme'

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

.hackathon-section {
  background-color: rgb(var(--v-theme-surface-variant));
  border-radius: 24px;
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
