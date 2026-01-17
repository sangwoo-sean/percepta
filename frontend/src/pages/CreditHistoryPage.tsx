import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { fetchCreditTransactions } from '../store/creditsSlice';
import type { RootState } from '../store';
import type { TransactionType } from '../types';
import { Card } from '../components/common';

const getTransactionIcon = (type: TransactionType): React.ReactNode => {
  if (type.startsWith('deduct')) {
    return (
      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  if (type.startsWith('refund') || type === 'admin_add') {
    return (
      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  return (
    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
};

const getAmountColor = (amount: number): string => {
  if (amount > 0) return 'text-green-600';
  if (amount < 0) return 'text-red-600';
  return 'text-gray-600';
};

const formatAmount = (amount: number): string => {
  if (amount > 0) return `+${amount}`;
  return String(amount);
};

export const CreditHistoryPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { transactions, isLoading } = useSelector((state: RootState) => state.credits);
  const { t } = useTranslation('credits');
  const { t: tCommon } = useTranslation('common');

  useEffect(() => {
    dispatch(fetchCreditTransactions());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('history.title')}</h1>
        <p className="text-gray-600 mt-1">{t('history.subtitle')}</p>
      </div>

      {transactions.length === 0 ? (
        <Card className="text-center py-12">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('history.empty.title')}</h3>
          <p className="text-gray-500">{t('history.empty.description')}</p>
        </Card>
      ) : (
        <Card>
          <div className="divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getTransactionIcon(transaction.transactionType)}
                  <div>
                    <p className="font-medium text-gray-900">
                      {t(`transactionType.${transaction.transactionType}`)}
                    </p>
                    {transaction.description && (
                      <p className="text-sm text-gray-500">{transaction.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(transaction.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${getAmountColor(transaction.amount)}`}>
                    {formatAmount(transaction.amount)} {tCommon('header.credits', { count: Math.abs(transaction.amount) }).replace(String(Math.abs(transaction.amount)), '').trim()}
                  </p>
                  <p className="text-xs text-gray-400">
                    {t('history.balance')}: {transaction.balanceAfter}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
