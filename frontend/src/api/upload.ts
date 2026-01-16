import apiClient from './client';
import type { UploadResult, ScrapedContent } from '../types';

export const uploadApi = {
  uploadFile: async (file: File): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<UploadResult>('/upload/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  scrapeUrl: async (url: string): Promise<ScrapedContent> => {
    const response = await apiClient.post<ScrapedContent>('/upload/url', { url });
    return response.data;
  },
};
