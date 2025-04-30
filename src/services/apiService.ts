// src/services/apiService.js
import axios from 'axios';
import router from '@/router';
import { useAuthStore } from '@/stores/auth'

// 基础URL配置
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// 创建axios实例
const apiService = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15秒超时
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// 创建一个不带拦截器的axios实例，用于auth服务
// 这样可以避免循环依赖
export const authApiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// 动态添加请求拦截器，避免循环引用

export function setupInterceptors () {
  // 请求拦截器 - 添加token并检查token状态
  apiService.interceptors.request.use(
    async config => {
      const authStore = useAuthStore();

      // 如果用户已登录（存在token）
      if (authStore.appToken) {
        // 检查token是否过期或即将过期（5分钟内）
        if (authStore.isInternalTokenExpired || authStore.isTokenExpiringSoon) {
          try {
            // 尝试刷新token
            console.log('API请求拦截: token已过期或即将过期，尝试刷新...');
            const refreshed = await authStore.refreshInternalToken();

            // 如果刷新失败，可能需要重新登录
            if (!refreshed) {
              console.warn('API请求拦截: token刷新失败，可能需要重新登录');
              // 对于非身份验证端点，我们仍然允许请求继续，但可能会失败
            }
          } catch (error) {
            console.error('API请求拦截: 刷新token时出错:', error);
          }
        }

        // 始终使用最新的token（如果存在）
        if (authStore.appToken) {
          config.headers.Authorization = `Bearer ${authStore.appToken}`;
        }
      }

      return config;
    },
    error => {
      return Promise.reject(error);
    }
  );

  // 响应拦截器 - 处理token错误
  apiService.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config;
      const authStore = useAuthStore();

      // 如果是401错误（未授权），可能是token无效或过期
      if (error.response && error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true; // 标记已尝试过重试

        // 检查是否有refresh token
        if (authStore.appRefreshToken) {
          try {
            // 尝试刷新token
            console.log('API响应拦截: 收到401响应，尝试刷新token...');
            const refreshed = await authStore.refreshInternalToken();

            if (refreshed) {
              // token刷新成功，更新请求头并重试
              console.log('API响应拦截: token刷新成功，重试原始请求');
              originalRequest.headers.Authorization = `Bearer ${authStore.appToken}`;
              return apiService(originalRequest);
            } else {
              // token刷新失败，清除认证并重定向到登录页
              console.warn('API响应拦截: token刷新失败，重定向到登录页');
              await authStore.logout();
              // 保存当前路径用于登录后重定向回来
              router.push({
                name: '/auth/login',
                query: {
                  redirect: router.currentRoute.value.fullPath,
                },
              });
            }
          } catch (refreshError) {
            console.error('API响应拦截: 刷新token时出错:', refreshError);
            await authStore.logout();
            router.push({
              name: '/auth/login',
              query: {
                redirect: router.currentRoute.value.fullPath,
              },
            });
          }
        } else {
          // 没有刷新token，直接登出
          console.warn('API响应拦截: 没有刷新token，执行登出');
          await authStore.logout();
          router.push({
            name: '/auth/login',
            query: {
              redirect: router.currentRoute.value.fullPath,
            },
          });
        }

        return Promise.reject(error);
      }

      // 处理其他错误
      return Promise.reject(error);
    }
  );
}

// 导出API服务
export default apiService;
