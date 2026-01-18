import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { fetchCurrentUser } from '../store/authSlice';
import { Card, Button } from '../components/common';

export const PaymentSuccessPage: React.FC = () => {
  const { t } = useTranslation('payment');
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full text-center">
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t('success.title')}</h1>
          <p className="text-gray-600">{t('success.description')}</p>
          <p className="text-sm text-gray-500">{t('success.creditsAdded')}</p>
          <div className="flex gap-3 mt-4">
            <Link to="/">
              <Button>{t('success.goToDashboard')}</Button>
            </Link>
            <Link to="/credits/history">
              <Button variant="outline">{t('success.viewCredits')}</Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};
