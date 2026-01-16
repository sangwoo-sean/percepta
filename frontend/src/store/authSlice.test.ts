import { describe, it, expect, vi, beforeEach } from 'vitest';
import authReducer, { setToken, logout, updateCredits, fetchCurrentUser } from './authSlice';
import type { User } from '../types';

describe('authSlice', () => {
  const mockUser: User = {
    id: 'test-uuid',
    email: 'test@example.com',
    name: 'Test User',
    avatarUrl: 'https://example.com/avatar.jpg',
    credits: 10,
    createdAt: '2024-01-01T00:00:00.000Z',
  };

  const initialState = {
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  };

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should return the initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('setToken', () => {
    it('should store token in localStorage', () => {
      const token = 'test-token';
      authReducer(initialState, setToken(token));
      expect(localStorage.getItem('token')).toBe(token);
    });
  });

  describe('logout', () => {
    it('should clear user and set isAuthenticated to false', () => {
      const stateWithUser = {
        ...initialState,
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
      };

      const newState = authReducer(stateWithUser, logout());

      expect(newState.user).toBeNull();
      expect(newState.isAuthenticated).toBe(false);
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('updateCredits', () => {
    it('should update user credits', () => {
      const stateWithUser = {
        ...initialState,
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
      };

      const newState = authReducer(stateWithUser, updateCredits(20));

      expect(newState.user?.credits).toBe(20);
    });

    it('should do nothing if no user', () => {
      const newState = authReducer(initialState, updateCredits(20));
      expect(newState.user).toBeNull();
    });
  });

  describe('fetchCurrentUser', () => {
    it('should set isLoading to true on pending', () => {
      const action = { type: fetchCurrentUser.pending.type };
      const newState = authReducer(initialState, action);
      expect(newState.isLoading).toBe(true);
      expect(newState.error).toBeNull();
    });

    it('should set user and isAuthenticated on fulfilled', () => {
      const action = { type: fetchCurrentUser.fulfilled.type, payload: mockUser };
      const newState = authReducer(initialState, action);
      expect(newState.user).toEqual(mockUser);
      expect(newState.isAuthenticated).toBe(true);
      expect(newState.isLoading).toBe(false);
    });

    it('should set error and clear auth on rejected', () => {
      const action = { type: fetchCurrentUser.rejected.type, payload: 'Error' };
      const newState = authReducer(initialState, action);
      expect(newState.error).toBe('Error');
      expect(newState.isAuthenticated).toBe(false);
      expect(newState.isLoading).toBe(false);
    });
  });
});
