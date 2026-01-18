import { apiClient } from './client';
import { PaymentRecord } from '../types';

export interface CreateCheckoutResponse {
  checkoutUrl: string;
}

export const paymentsApi = {
  createCheckout: (packageName: string) =>
    apiClient.post<CreateCheckoutResponse>('/payments/checkout', { packageName }),

  getPaymentHistory: () =>
    apiClient.get<PaymentRecord[]>('/payments/history'),
};
