import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import type { RootState, AppDispatch } from '../store';
import { fetchCurrentUser, logout as logoutAction, setToken } from '../store/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading, isAuthenticated, error } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !isAuthenticated && !isLoading) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, isAuthenticated, isLoading]);

  const login = (token: string) => {
    dispatch(setToken(token));
    dispatch(fetchCurrentUser());
  };

  const logout = () => {
    dispatch(logoutAction());
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    login,
    logout,
  };
};
