import type { User } from '@/types/auth'
import type { ApiResponse,LoginResponse,RefreshTokenResponse } from '@/types/api'
import { authApiClient } from '@/services/apiService'


const API_AUTH_ROUTER_PREFIX = `/auth`;


export const authService = {
  // Google OAuth login
  async googleLogin (firebaseIdToken: string): Promise<ApiResponse<LoginResponse>> {
    const response = await authApiClient.post(`${API_AUTH_ROUTER_PREFIX}/google-login`, { token: firebaseIdToken })
    return response.data
  },

  // Refresh token
  async refreshToken (refreshToken: string): Promise<ApiResponse<RefreshTokenResponse>> {
    const response = await authApiClient.post(`${API_AUTH_ROUTER_PREFIX}/refresh-token`, { refreshToken })
    return response.data
  },
  // Verify token
  async verifyToken (token: string): Promise<boolean> {
    const response = await authApiClient.post(`${API_AUTH_ROUTER_PREFIX}/verify-token`, { token })
    if (response.status === 204) {
      // 状态码为 204，表示令牌有效
      console.log('Token is valid.');
      return true; // 或者执行其他登录状态有效的逻辑
    } else {
      return false; // 令牌无效
    }
  },
  // Logout
  async logout (): Promise<ApiResponse<null>> {
    const response = await authApiClient.post(`${API_AUTH_ROUTER_PREFIX}/logout`)
    return response.data
  },

  // Get user profile
  async getProfile (): Promise<ApiResponse<User>> {
    const response = await authApiClient.get(`${API_AUTH_ROUTER_PREFIX}/profile`)
    return response.data
  },

  // Update user preferences
  async updatePreferences (preferences: any): Promise<ApiResponse<User>> {
    const response = await authApiClient.put(`${API_AUTH_ROUTER_PREFIX}/preferences`, { preferences })
    return response.data
  },
}
