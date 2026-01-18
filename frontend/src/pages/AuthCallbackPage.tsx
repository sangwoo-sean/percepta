import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { actionLogger } from '../services/actionLogger';

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const { t } = useTranslation('auth');

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      actionLogger.authEvent('auth_login_success');
      login(token);
      navigate('/', { replace: true });
    } else {
      actionLogger.authEvent('auth_login_failed');
      navigate('/login', { replace: true });
    }
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
        <p className="text-gray-600">{t('callback.authenticating')}</p>
      </div>
    </div>
  );
};
