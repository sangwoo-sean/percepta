import apiClient from './client';
import type { User } from '../types';

export const authApi = {
  getMe: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  getGoogleAuthUrl: (): string => {
    const baseUrl = import.meta.env.VITE_API_URL || '';
    return `${baseUrl}/auth/google`;
  },
};
