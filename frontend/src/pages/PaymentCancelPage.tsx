import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, Button } from '../components/common';

export const PaymentCancelPage: React.FC = () => {
  const { t } = useTranslation('payment');

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full text-center">
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t('cancel.title')}</h1>
          <p className="text-gray-600">{t('cancel.description')}</p>
          <div className="flex gap-3 mt-4">
            <Link to="/pricing">
              <Button>{t('cancel.backToPricing')}</Button>
            </Link>
            <Link to="/">
              <Button variant="outline">{t('cancel.goToDashboard')}</Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};
