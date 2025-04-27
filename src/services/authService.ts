import axios from 'axios'
import type { User } from '@/types/auth'
import type { ApiResponse } from '@/types/api'


const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'; // Default added
const API_AUTH_URL = `${API_BASE_URL}/auth`;

interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export const authService = {
  // Google OAuth login
  async googleLogin (firebaseIdToken: string): Promise<ApiResponse<LoginResponse>> {
    const response = await axios.post(`${API_AUTH_URL}/google-login`, { token: firebaseIdToken })
    return response.data
  },

  // Refresh token
  async refreshToken (refreshToken: string): Promise<ApiResponse<{ token: string }>> {
    const response = await axios.post(`${API_AUTH_URL}/refresh-token`, { refreshToken })
    return response.data
  },

  // Logout
  async logout (): Promise<ApiResponse<null>> {
    const response = await axios.post(`${API_AUTH_URL}/logout`)
    return response.data
  },

  // Get user profile
  async getProfile (): Promise<ApiResponse<User>> {
    const response = await axios.get(`${API_AUTH_URL}/profile`)
    return response.data
  },

  // Update user preferences
  async updatePreferences (preferences: any): Promise<ApiResponse<User>> {
    const response = await axios.put(`${API_AUTH_URL}/preferences`, { preferences })
    return response.data
  },
}
