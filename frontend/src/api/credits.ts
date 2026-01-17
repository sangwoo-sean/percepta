import apiClient from './client';
import type { CreditTransaction } from '../types';

export const creditsApi = {
  getTransactions: async (): Promise<CreditTransaction[]> => {
    const response = await apiClient.get<CreditTransaction[]>('/users/credits/transactions');
    return response.data;
  },
};
