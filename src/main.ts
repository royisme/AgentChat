/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'

// Pinia

import { auth } from '@/plugins/firebase'; // Import auth
import { onAuthStateChanged } from 'firebase/auth';
// Styles
import './styles/main.scss'
import { setupInterceptors } from '@/services/apiService'; // Import interceptor setup
const app = createApp(App)

let isAuthReady = false;

const unsubscribe = onAuthStateChanged(auth, user => {
  if (!isAuthReady) {
    console.log(`Firebase initial auth state determined. User: ${user ? user.uid : 'None'}.`);
    isAuthReady = true;

    registerPlugins(app);
    app.mount('#app');
    console.log('App mounted.');
  }
  unsubscribe();
});
setTimeout(() => {
  if (!isAuthReady) {
    console.warn('Firebase auth state check timed out (e.g., 5s). Mounting app anyway.');
    isAuthReady = true;
    // Mount app even if Firebase is slow/stuck
    registerPlugins(app);
    app.mount('#app');
    // unsubscribe(); // Maybe unsubscribe here on timeout
  }
}, 5000);


setupInterceptors();

// 可选: 添加全局错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('全局错误:', err);
  console.error('错误信息:', info);
  // 可以在这里添加错误跟踪逻辑，如Sentry等
};
