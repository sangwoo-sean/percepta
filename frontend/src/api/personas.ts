import apiClient from './client';
import type { Persona, CreatePersonaDto, PersonaStats } from '../types';

export const personasApi = {
  getAll: async (): Promise<Persona[]> => {
    const response = await apiClient.get<Persona[]>('/personas');
    return response.data;
  },

  getById: async (id: string): Promise<Persona> => {
    const response = await apiClient.get<Persona>(`/personas/${id}`);
    return response.data;
  },

  create: async (dto: CreatePersonaDto): Promise<Persona> => {
    const response = await apiClient.post<Persona>('/personas', dto);
    return response.data;
  },

  batchCreate: async (personas: CreatePersonaDto[]): Promise<Persona[]> => {
    const response = await apiClient.post<Persona[]>('/personas/batch', { personas });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/personas/${id}`);
  },

  getStats: async (): Promise<PersonaStats> => {
    const response = await apiClient.get<PersonaStats>('/personas/stats');
    return response.data;
  },
};
