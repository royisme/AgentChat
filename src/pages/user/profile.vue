<script setup lang="ts">
  import { computed } from 'vue'
  import { useAuthStore } from '@/stores/auth'
  import { formatDate } from '@/utils/helpers'
  import { useThemeStore } from '@/stores/theme'

  const authStore = useAuthStore()
  const themeStore = useThemeStore()
  const user = computed(() => authStore.user)
  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return 'Not available'
    return formatDate(timestamp)
  }

  // Generate a gradient background for avatar when no picture is available
  const avatarBackground = computed(() => {
    return themeStore.isDark ? 'linear-gradient(145deg, #4a209a, #7931d4)' : 'linear-gradient(145deg, #9333ea, #7c3aed)'
  })
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };
</script>

<template>
  <div class="profile-page">
    <v-container>
      <h1 class="text-h4 font-weight-bold text-center mb-8">Profile</h1>

      <v-row>
        <v-col cols="12" md="4">
          <v-card
            class="profile-card"
            :elevation="3"
            rounded="lg"
          >
            <div class="profile-header">
              <v-avatar class="profile-avatar" size="140">
                <v-img
                  v-if="user?.picture"
                  :alt="user?.name"
                  cover
                  :src="user.picture"
                />
                <v-sheet
                  v-else
                  class="d-flex align-center justify-center"
                  :color="themeStore.isDark ? 'primary-darken-1' : 'primary'"
                  height="100%"
                  rounded="circle"
                  :style="{ background: avatarBackground }"
                  width="100%"
                >
                  <span class="text-h3 font-weight-bold text-white">{{ user?.name?.charAt(0) }}</span>
                </v-sheet>
              </v-avatar>
            </div>

            <v-card-item class="text-center">
              <v-card-title class="text-h4 font-weight-bold mb-1">{{ user?.name }}</v-card-title>
              <v-card-subtitle class="text-subtitle-1 mb-4">
                <v-icon class="mr-1" size="small">mdi-email</v-icon>
                {{ user?.email }}
              </v-card-subtitle>

              <v-divider class="my-4" />

              <div class="d-flex justify-center gap-4">
                <v-btn
                  class="action-btn mr-4"
                  color="primary"
                  min-width="150"
                  prepend-icon="mdi-account-edit"
                  rounded="pill"
                  variant="tonal"
                >
                  Edit Profile
                </v-btn>
                <v-btn
                  class="action-btn"
                  color="primary"
                  min-width="150"
                  prepend-icon="mdi-logout"
                  rounded="pill"
                  variant="outlined"
                  @click="authStore.logout"
                >
                  Logout
                </v-btn>
              </div>
            </v-card-item>
          </v-card>
        </v-col>

        <v-col cols="12" md="8">
          <v-card :elevation="3" rounded="lg">
            <v-card-title class="d-flex align-center px-6 py-4">
              <v-icon class="mr-3" color="primary" icon="mdi-account-details" size="large" />
              <span class="text-h5 font-weight-bold">Account Details</span>
            </v-card-title>

            <v-divider />

            <v-card-text class="px-6 py-4">
              <v-row align="center" class="detail-item">
                <v-col class="detail-label" cols="12" sm="4">
                  <div class="d-flex align-center">
                    <v-icon
                      class="mr-3"
                      :color="themeStore.isDark ? 'grey-lighten-1' : 'grey-darken-2'"
                      icon="mdi-identifier"
                    />
                    <span class="text-subtitle-1 font-weight-medium">User ID</span>
                  </div>
                </v-col>
                <v-col class="detail-value" cols="12" sm="8">
                  <div class="text-body-1 py-1 id-value">
                    {{ user?.id }}
                    <v-tooltip location="end">
                      <template #activator="{ props }">
                        <v-btn
                          v-bind="props"
                          density="comfortable"
                          icon="mdi-content-copy"
                          size="small"
                          variant="text"
                          @click="copyToClipboard(user?.id || '')"
                        />
                      </template>
                      <span>Copy ID</span>
                    </v-tooltip>
                  </div>
                </v-col>
              </v-row>

              <v-divider class="my-2" />

              <v-row align="center" class="detail-item">
                <v-col class="detail-label" cols="12" sm="4">
                  <div class="d-flex align-center">
                    <v-icon
                      class="mr-3"
                      :color="themeStore.isDark ? 'grey-lighten-1' : 'grey-darken-2'"
                      icon="mdi-email"
                    />
                    <span class="text-subtitle-1 font-weight-medium">Email</span>
                  </div>
                </v-col>
                <v-col class="detail-value" cols="12" sm="8">
                  <div class="text-body-1 py-1">{{ user?.email }}</div>
                </v-col>
              </v-row>

              <v-divider class="my-2" />

              <v-row align="center" class="detail-item">
                <v-col class="detail-label" cols="12" sm="4">
                  <div class="d-flex align-center">
                    <v-icon
                      class="mr-3"
                      :color="themeStore.isDark ? 'grey-lighten-1' : 'grey-darken-2'"
                      icon="mdi-account"
                    />
                    <span class="text-subtitle-1 font-weight-medium">Name</span>
                  </div>
                </v-col>
                <v-col class="detail-value" cols="12" sm="8">
                  <div class="text-body-1 py-1">{{ user?.name }}</div>
                </v-col>
              </v-row>

              <v-divider class="my-2" />

              <v-row align="center" class="detail-item">
                <v-col class="detail-label" cols="12" sm="4">
                  <div class="d-flex align-center">
                    <v-icon
                      class="mr-3"
                      :color="themeStore.isDark ? 'grey-lighten-1' : 'grey-darken-2'"
                      icon="mdi-clock-outline"
                    />
                    <span class="text-subtitle-1 font-weight-medium">Created At</span>
                  </div>
                </v-col>
                <v-col class="detail-value" cols="12" sm="8">
                  <div class="text-body-1 py-1">{{ formatTimestamp(user?.createdAt || null) }}</div>
                </v-col>
              </v-row>

              <v-divider class="my-2" />

              <v-row align="center" class="detail-item">
                <v-col class="detail-label" cols="12" sm="4">
                  <div class="d-flex align-center">
                    <v-icon
                      class="mr-3"
                      :color="themeStore.isDark ? 'grey-lighten-1' : 'grey-darken-2'"
                      icon="mdi-update"
                    />
                    <span class="text-subtitle-1 font-weight-medium">Last Updated</span>
                  </div>
                </v-col>
                <v-col class="detail-value" cols="12" sm="8">
                  <div class="text-body-1 py-1">{{ formatTimestamp(user?.updatedAt || null) }}</div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <v-card class="mt-6" :elevation="3" rounded="lg">
            <v-card-title class="d-flex align-center px-6 py-4">
              <v-icon class="mr-3" color="primary" icon="mdi-cog" size="large" />
              <span class="text-h5 font-weight-bold">Preferences</span>
            </v-card-title>

            <v-divider />

            <v-card-text class="px-6 py-4">
              <v-row align="center" class="mb-3">
                <v-col class="d-flex align-center" cols="12" sm="4">
                  <v-icon
                    class="mr-3"
                    :color="themeStore.isDark ? 'grey-lighten-1' : 'grey-darken-2'"
                    icon="mdi-theme-light-dark"
                  />
                  <span class="text-subtitle-1 font-weight-medium">Theme Mode</span>
                </v-col>
                <v-col cols="12" sm="8">
                  <v-switch
                    v-model="themeStore.isDark"
                    color="primary"
                    hide-details
                    inset
                    :label="themeStore.isDark ? 'Dark' : 'Light'"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style scoped>
.profile-page {
  padding: var(--spacing-3) 0;
  min-height: 85vh;
}

.profile-card {
  position: sticky;
  top: var(--spacing-3);
  transition: transform 0.3s, box-shadow 0.3s;
}

.profile-card:hover {
  transform: translateY(-4px);
}

.profile-header {
  display: flex;
  justify-content: center;
  padding-top: var(--spacing-5);
}

.profile-avatar {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 4px solid rgba(var(--v-theme-surface), 0.8);
}

.detail-item {
  transition: background-color 0.2s;
  border-radius: var(--radius-md);
}

.detail-item:hover {
  background-color: rgba(var(--v-theme-surface-variant), 0.7);
}

.id-value {
  display: flex;
  align-items: center;
  font-family: monospace;
  font-size: 0.9rem;
  word-break: break-all;
}
.action-btn {
  flex: 1;
  max-width: 160px;
}
@media (max-width: 960px) {
  .profile-card {
    position: static;
    margin-bottom: var(--spacing-4);
  }

  .detail-label, .detail-value {
    padding-top: 8px;
    padding-bottom: 8px;
  }
}
</style>
