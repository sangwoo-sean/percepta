import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader } from '../components/common';

interface CreditPackage {
  name: string;
  credits: number;
  price: number;
  pricePerCredit: number;
  discount: number;
  isFree?: boolean;
  isPopular?: boolean;
}

const creditPackages: CreditPackage[] = [
  { name: 'trial', credits: 10, price: 0, pricePerCredit: 0, discount: 0, isFree: true },
  { name: 'small', credits: 50, price: 500, pricePerCredit: 10, discount: 0 },
  { name: 'basic', credits: 200, price: 1800, pricePerCredit: 9, discount: 10, isPopular: true },
  { name: 'large', credits: 500, price: 4000, pricePerCredit: 8, discount: 20 },
  { name: 'premium', credits: 1000, price: 7000, pricePerCredit: 7, discount: 30 },
  { name: 'business', credits: 5000, price: 30000, pricePerCredit: 6, discount: 40 },
];

interface CreditUsage {
  action: string;
  credits: number;
}

const creditUsages: CreditUsage[] = [
  { action: 'feedback', credits: 1 },
  { action: 'summary', credits: 1 },
  { action: 'personaGeneration', credits: 1 },
];

export const PricingPage: React.FC = () => {
  const { t } = useTranslation('pricing');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-600 mt-1">{t('subtitle')}</p>
      </div>

      {/* Credit Packages */}
      <Card>
        <CardHeader title={t('packages.title')} subtitle={t('packages.subtitle')} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {creditPackages.map((pkg) => (
            <div
              key={pkg.name}
              className={`relative rounded-lg border-2 p-5 transition-all ${
                pkg.isPopular
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {pkg.isPopular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {t('packages.popular')}
                </span>
              )}
              {pkg.discount > 0 && (
                <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
                  -{pkg.discount}%
                </span>
              )}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t(`packages.names.${pkg.name}`)}
                </h3>
                <div className="mt-3">
                  <span className="text-3xl font-bold text-gray-900">
                    {pkg.isFree ? t('packages.free') : `₩${formatPrice(pkg.price)}`}
                  </span>
                </div>
                <div className="mt-2 text-gray-500">
                  <span className="text-xl font-semibold text-primary-600">
                    {formatPrice(pkg.credits)}
                  </span>
                  <span className="ml-1">{t('packages.credits')}</span>
                </div>
                {!pkg.isFree && (
                  <p className="mt-2 text-sm text-gray-500">
                    {t('packages.perCredit', { price: pkg.pricePerCredit })}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Credit Usage */}
      <Card>
        <CardHeader title={t('usage.title')} subtitle={t('usage.subtitle')} />
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('usage.action')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('usage.creditsUsed')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {creditUsages.map((usage) => (
                <tr key={usage.action}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {t(`usage.actions.${usage.action}`)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-primary-600">
                    {usage.credits} {t('usage.credit')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Payment Info */}
      <p className="text-center text-sm text-gray-400">
        {t('payment.info')}
      </p>
    </div>
  );
};
