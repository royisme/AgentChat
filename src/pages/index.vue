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
              JACHacks 2025 Project
            </v-chip>
          </div>
          <h1 class="text-h2 font-weight-bold mb-4">
            Your Universal AI Agent Hub
          </h1>
          <p class="text-h6 mb-6" :class="themeStore.isDark ? 'text-grey-lighten-1' : 'text-grey-darken-1'">
            Connect and interact with multiple AI agents through a single, unified interface. Built during JACHacks 2025, where 200 students came together to innovate and create impactful solutions.
          </p>
          <v-btn
            class="text-none"
            color="secondary"
            size="x-large"
            @click="router.push('/chat')"
          >
            Experience the Future
          </v-btn>
        </v-col>

        <v-col class="text-center" cols="12" md="6">
          <v-img
            alt="AI Agent Hub"
            class="rounded-lg"
            max-height="400"
            src="https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg"
          />
        </v-col>
      </v-row>

      <v-row class="features-section my-16">
        <v-col class="text-center mb-12" cols="12">
          <h2 class="text-h3 font-weight-bold mb-3">Seamless AI Integration</h2>
          <p class="text-h6" :class="themeStore.isDark ? 'text-grey-lighten-1' : 'text-grey-darken-1'">
            Connect with multiple AI agents through a single, powerful interface
          </p>
        </v-col>

        <v-col cols="12" md="4">
          <v-card class="feature-card" elevation="0">
            <v-card-item>
              <template #prepend>
                <v-icon
                  color="primary"
                  icon="mdi-connection"
                  size="x-large"
                />
              </template>
              <v-card-title class="text-h5">Multi-Agent Support</v-card-title>
              <v-card-text>
                Connect with various specialized AI agents for different tasks and domains through a unified interface.
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
                  icon="mdi-sync"
                  size="x-large"
                />
              </template>
              <v-card-title class="text-h5">Seamless Integration</v-card-title>
              <v-card-text>
                Effortlessly switch between different AI agents while maintaining context and conversation history.
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
              <v-card-title class="text-h5">Secure & Private</v-card-title>
              <v-card-text>
                Your conversations and data are protected with enterprise-grade security and privacy measures.
              </v-card-text>
            </v-card-item>
          </v-card>
        </v-col>
      </v-row>

      <v-row align="center" class="hackathon-section my-16 py-16" justify="center">
        <v-col class="text-center mb-8" cols="12">
          <h2 class="text-h3 font-weight-bold mb-3">Built at JACHacks 2025</h2>
          <p class="text-h6" :class="themeStore.isDark ? 'text-grey-lighten-1' : 'text-grey-darken-1'">
            John Abbott College's premier hackathon bringing together 200 students for innovation and collaboration
          </p>
        </v-col>

        <v-col class="text-center" cols="12" md="8">
          <v-timeline align="start">
            <v-timeline-item
              dot-color="secondary"
              size="small"
            >
              <div class="text-left">
                <h3 class="text-h6 mb-2">Innovation Challenge</h3>
                <p>One of 200 projects developed during the intensive hackathon weekend</p>
              </div>
            </v-timeline-item>

            <v-timeline-item
              dot-color="secondary"
              size="small"
            >
              <div class="text-left">
                <h3 class="text-h6 mb-2">Technical Achievement</h3>
                <p>Built using cutting-edge technologies and AI integration capabilities</p>
              </div>
            </v-timeline-item>

            <v-timeline-item
              dot-color="secondary"
              size="small"
            >
              <div class="text-left">
                <h3 class="text-h6 mb-2">Future Development</h3>
                <p>Continuing to evolve with new features and agent integrations</p>
              </div>
            </v-timeline-item>
          </v-timeline>
        </v-col>
      </v-row>

      <v-row align="center" class="cta-section my-16" justify="center">
        <v-col class="text-center" cols="12" md="8">
          <h2 class="text-h3 font-weight-bold mb-3">Experience the Future of AI Interaction</h2>
          <p class="text-h6 mb-6" :class="themeStore.isDark ? 'text-grey-lighten-1' : 'text-grey-darken-1'">
            Join us in revolutionizing how people interact with AI agents
          </p>
          <v-btn
            class="text-none"
            color="secondary"
            size="x-large"
            @click="router.push('/chat')"
          >
            Start Now
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
