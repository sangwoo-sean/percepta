import apiClient from './client';
import type { FeedbackSession, FeedbackResult, CreateSessionDto } from '../types';

export const feedbackApi = {
  getSessions: async (): Promise<FeedbackSession[]> => {
    const response = await apiClient.get<FeedbackSession[]>('/feedback/sessions');
    return response.data;
  },

  getSession: async (id: string): Promise<FeedbackSession> => {
    const response = await apiClient.get<FeedbackSession>(`/feedback/sessions/${id}`);
    return response.data;
  },

  createSession: async (dto: CreateSessionDto): Promise<FeedbackSession> => {
    const response = await apiClient.post<FeedbackSession>('/feedback/sessions', dto);
    return response.data;
  },

  generateFeedback: async (
    sessionId: string,
    personaIds?: string[],
    locale?: string
  ): Promise<FeedbackResult[]> => {
    const response = await apiClient.post<FeedbackResult[]>(
      `/feedback/sessions/${sessionId}/generate`,
      { personaIds, locale }
    );
    return response.data;
  },

  getSummary: async (sessionId: string, locale?: string): Promise<{ summary: string }> => {
    const params = locale ? `?locale=${locale}` : '';
    const response = await apiClient.get<{ summary: string }>(
      `/feedback/sessions/${sessionId}/summary${params}`
    );
    return response.data;
  },
};
