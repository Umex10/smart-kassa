import { Preferences } from "@capacitor/preferences";
import { Capacitor } from "@capacitor/core";

const isMobile = Capacitor.isNativePlatform();

/**
 * Secure storage utility that uses Capacitor Preferences on mobile
 * and localStorage on web
 */
export const SecureStorage = {
  /**
   * Set a value in secure storage
   */
  async set(key: string, value: string): Promise<void> {
    if (isMobile) {
      console.log("Set Token");
      console.log(`key: ${key}, value: ${value}`);
      await Preferences.set({ key: key, value: value });
    } else {
      console.log("Local Storage lil bro");
      localStorage.setItem(key, value);
    }
  },

  /**
   * Get a value from secure storage
   */
  async get(key: string): Promise<string | null> {
    if (isMobile) {
      console.log("Get Token");
      const { value } = await Preferences.get({ key: key });
      if (value) {
        console.log(`Gefundener Value: ${value}`);
      } else {
        console.log("Value not found");
      }
      return value;
    } else {
      return localStorage.getItem(key);
    }
  },

  /**
   * Remove a value from secure storage
   */
  async remove(key: string): Promise<void> {
    if (isMobile) {
      await Preferences.remove({ key: key });
    } else {
      localStorage.removeItem(key);
    }
  },

  /**
   * Clear all values from secure storage
   */
  async clear(): Promise<void> {
    if (isMobile) {
      await Preferences.clear();
    } else {
      localStorage.clear();
    }
  },
};

/**
 * Auth storage utility for tokens
 */
export const AuthStorage = {
  /**
   * Save access and refresh tokens
   */
  async setTokens(accessToken: string, refreshToken?: string): Promise<void> {
    console.log("Function Secure Storage Fired, of setTokens");
    await SecureStorage.set("accessToken", accessToken);
    if (refreshToken) {
      await SecureStorage.set("refreshToken", refreshToken);
    }
  },

  /**
   * Get the access token
   */
  async getAccessToken(): Promise<string | null> {
    console.log("Function Secure Storage Fired, of getAccessToken");
    return await SecureStorage.get("accessToken");
  },

  /**
   * Get the refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    return await SecureStorage.get("refreshToken");
  },

  async clearAccessToken(): Promise<void> {
    await SecureStorage.remove("accessToken");
  },

  /**
   * Remove all tokens (for logout)
   */
  async clearTokens(): Promise<void> {
    console.log("Function Secure Storage Fired, of clearTokens");
    await SecureStorage.remove("accessToken");
    await SecureStorage.remove("refreshToken");
  },
};
