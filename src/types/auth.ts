// Authentication types
export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  preferences?: UserPreferences;
  createdAt?: string;
  updatedAt?: string;
}
export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  expiresAt: number | null;
}

export interface UserPreferences {
  notifications: boolean;
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
}
