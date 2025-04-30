// API response types
import type { User } from '@/types/auth'
/**
 * 标准 API 响应结构，对应后端的 AuthApiResponse 模型
 * (泛型 T 用于 data 字段的具体类型)
 */
export interface ApiResponse<T = unknown> {
  data?: T | null;
  status: number;
  message: string;
  error?: string | null; // 假设后端可能在错误时填充此字段
}
export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

/**
 * 刷新令牌请求体，对应后端的 RefreshTokenRequest 模型
 */
export interface RefreshTokenRequest {
  refresh_token: string;
}

/**
 * 刷新令牌响应体，对应后端的 NewAccessTokenResponse 模型
 */
export interface RefreshTokenResponse {
  token: string;
}
