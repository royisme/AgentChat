import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import jwtDecode from 'jwt-decode';
import { authService } from '@/services/authService';
import type { User } from '@/types/auth';
import { auth } from '@/plugins/firebase';
import { type User as FirebaseUser, onAuthStateChanged, signOut } from 'firebase/auth';

const APP_TOKEN_KEY = 'app_auth_token';
const APP_REFRESH_TOKEN_KEY = 'app_refresh_token';
const USER_KEY = 'user_data';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const appToken = ref<string | null>(null); // Renamed for clarity
  const appRefreshToken = ref<string | null>(null); // Renamed for clarity
  const appTokenExpiresAt = ref<number | null>(null); // Renamed for clarity
  const firebaseUser = ref<FirebaseUser | null>(null); // Track Firebase user state
  let unsubscribeAuthStateListener: (() => void) | null = null; // To clean up listener

  const isAuthenticated = computed(() => !!appToken.value && !isInternalTokenExpired.value);
  /*
    * Checks if the internal token is expired.
    * @returns {boolean} - True if the token is expired, false otherwise.
    */
  const isInternalTokenExpired = computed(() => {
    if (!appTokenExpiresAt.value) return true;
    return Date.now() >= appTokenExpiresAt.value;
  });
  /*
    * Checks if the token is expiring soon (within 5 minutes).
    * @returns {boolean} - True if the token is expiring soon, false otherwise.
    */
  const isTokenExpiringSoon = computed(() => {
    if (!appTokenExpiresAt.value) return false;
    // 计算距离过期还有多少毫秒
    const timeToExpiry = appTokenExpiresAt.value - Date.now();
    // 如果小于5分钟(300000毫秒)，则视为即将过期
    return timeToExpiry > 0 && timeToExpiry < 300000;
  });

  /*
    * Sets the user data and stores it in localStorage.
    * @param {User | null} mappedUserData - The user data to set.
    */
  function setUserData (mappedUserData: User | null) {
    user.value = mappedUserData;
    if (mappedUserData) {
      localStorage.setItem(USER_KEY, JSON.stringify(mappedUserData));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }
  /*
    * Sets the internal token and stores it in localStorage.
    * @param {string | null} tokenValue - The token value to set.
    */
  function setInternalToken (tokenValue: string | null) {
    appToken.value = tokenValue;
    if (tokenValue) {
      localStorage.setItem(APP_TOKEN_KEY, tokenValue);
      try {
        const decoded: any = jwtDecode(tokenValue);
        if (decoded.exp) {
          appTokenExpiresAt.value = decoded.exp * 1000;
        } else {
          appTokenExpiresAt.value = null; // No expiration in token
        }
      } catch (error) {
        console.warn('Failed to decode internal token:', error);
        clearAuthData(); // Clear if token is invalid
        appTokenExpiresAt.value = null;
      }
    } else {
      localStorage.removeItem(APP_TOKEN_KEY);
      appTokenExpiresAt.value = null;
    }
  }
  /*
    * Sets the internal refresh token and stores it in localStorage.
    * @param {string | null} tokenValue - The refresh token value to set.
    */
  function setInternalRefreshToken (tokenValue: string | null) {
    appRefreshToken.value = tokenValue;
    if (tokenValue) {
      localStorage.setItem(APP_REFRESH_TOKEN_KEY, tokenValue);
    } else {
      localStorage.removeItem(APP_REFRESH_TOKEN_KEY);
    }
  }

  async function login (appTokenData: { token: string; refreshToken?: string; user: User }) {
    setInternalToken(appTokenData.token);
    if (appTokenData.refreshToken) {
      setInternalRefreshToken(appTokenData.refreshToken);
    }
    const mappedUser = mapRawUserToUser(appTokenData.user);
    setUserData(mappedUser);
  }

  // Logout action
  async function logout () {
    try {
      await signOut(auth); // Sign out from Firebase
      await authService.logout(); // Call your backend logout (optional)
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      clearAuthData(); // Clear local state regardless of API call success
    }
  }

  /*
  * Clears all authentication data from localStorage and state.
  */
  function clearAuthData () {
    setInternalToken(null);
    setInternalRefreshToken(null);
    setUserData(null);
  }

  /*
    * Refreshes the internal token using the refresh token.
    * @returns {Promise<boolean>} - True if the token was refreshed successfully, false otherwise.
    *
  */
  async function refreshInternalToken () {
    if (!appRefreshToken.value) {
      clearAuthData();
      return false;
    }
    try {
      const response = await authService.refreshToken(appRefreshToken.value);
      if (response.data?.token) {
        setInternalToken(response.data.token);
        return true;
      }
      console.warn('Internal token refresh failed, clearing auth.');
      clearAuthData();
      return false;
    } catch (error) {
      console.error('Error refreshing internal token:', error);
      clearAuthData(); // Clear auth on refresh error
      return false;
    }
  }
  /*
    * Verifies the internal token with the backend.
    * @returns {Promise<boolean>} - True if the token is valid, false otherwise.
    *
    */
  async function verifyToken (): Promise<boolean> {
    try {
      const token = appToken.value;
      if (!token) {
        console.warn('No token available for verification.');
        return false;
      }
      const isValid = await authService.verifyToken(token);
      return isValid;
    } catch (error) {
      console.error('Error verifying token:', error);
      return false;
    }
  } 
  function initializeAuth () {
    if (!unsubscribeAuthStateListener) {
      unsubscribeAuthStateListener = onAuthStateChanged(auth, async fbUser => {
        firebaseUser.value = fbUser;
        if (fbUser) {
          const storedInternalToken = localStorage.getItem(APP_TOKEN_KEY);
          const storedUserRaw = localStorage.getItem(USER_KEY); // Get raw stored data

          if (storedInternalToken) {
            setInternalToken(storedInternalToken); // This will check expiry via setter
            if (isInternalTokenExpired.value) {
              console.log('Internal token expired, attempting refresh...');
              await refreshInternalToken();
            } else {
              setInternalRefreshToken(localStorage.getItem(APP_REFRESH_TOKEN_KEY));
              const mappedUser = storedUserRaw ? mapRawUserToUser(JSON.parse(storedUserRaw)) : null;
              setUserData(mappedUser);
            }
          } else {

            console.log('Firebase user logged in, but no internal token found.');
            clearAuthData();
          }
        } else {
          // Firebase user logged out, clear our internal session too.
          console.log('Firebase user logged out, clearing internal auth.');
          clearAuthData();
        }
      });
    }
  }


  initializeAuth();


  return {
    // State
    user,
    appToken,
    appRefreshToken,
    firebaseUser,

    // Getters
    isAuthenticated,
    isInternalTokenExpired,
    isTokenExpiringSoon,
    // Actions
    login,
    logout,
    refreshInternalToken,
    initializeAuth,
    clearAuthData,
    verifyToken,
  };
});

/*
  * Maps raw user data from the API to the User interface.
  * @param {any} rawUserData - The raw user data from the API.
  * @returns {User | null} - The mapped user data or null if invalid.
  */
function mapRawUserToUser (rawUserData: any): User | null {
  if (!rawUserData || !rawUserData.id) {
    // Basic validation: return null if essential data is missing
    return null;
  }

  // Perform the mapping from snake_case (in rawUserData) to camelCase (for User interface)
  const mappedUser: User = {
    id: rawUserData.id,
    email: rawUserData.email,
    name: rawUserData.name,
    picture: rawUserData.picture,
    preferences: rawUserData.preferences,
    createdAt: rawUserData.created_at,
    updatedAt: rawUserData.updated_at,
  };


  return mappedUser;
}
