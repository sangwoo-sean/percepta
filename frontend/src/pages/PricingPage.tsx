import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, Button } from '../components/common';
import { useAuth } from '../hooks/useAuth';
import { paymentsApi } from '../api/payments';

interface CreditPackage {
  name: string;
  credits: number;
  price: number;
  priceUSD: number;
  pricePerCredit: number;
  pricePerCreditUSD: number;
  discount: number;
  isFree?: boolean;
  isPopular?: boolean;
  originalCredits?: number;
  isPromotion?: boolean;
  isPurchasable?: boolean;
}

const creditPackages: CreditPackage[] = [
  { name: 'trial', credits: 50, price: 0, priceUSD: 0, pricePerCredit: 0, pricePerCreditUSD: 0, discount: 0, isFree: true, originalCredits: 30, isPromotion: true },
  { name: 'basic', credits: 200, price: 2000, priceUSD: 1.49, pricePerCredit: 10, pricePerCreditUSD: 0.0075, discount: 0, isPopular: true, isPurchasable: true },
  { name: 'large', credits: 500, price: 4500, priceUSD: 2.99, pricePerCredit: 9, pricePerCreditUSD: 0.006, discount: 10, isPurchasable: true },
  { name: 'premium', credits: 1000, price: 8000, priceUSD: 4.99, pricePerCredit: 8, pricePerCreditUSD: 0.005, discount: 20, isPurchasable: true },
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
  const { t, i18n } = useTranslation('pricing');
  const isEnglish = i18n.language === 'en';
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loadingPackage, setLoadingPackage] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price);
  };

  const getCurrencySymbol = () => '$';
  const getPrice = (pkg: CreditPackage) => pkg.priceUSD;
  const getPricePerCredit = (pkg: CreditPackage) => pkg.pricePerCreditUSD;

  const handlePurchase = async (packageName: string) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setLoadingPackage(packageName);
    try {
      const response = await paymentsApi.createCheckout(packageName);
      window.location.href = response.data.checkoutUrl;
    } catch (error) {
      console.error('Failed to create checkout:', error);
      setLoadingPackage(null);
    }
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {creditPackages.map((pkg) => (
            <div
              key={pkg.name}
              className={`relative rounded-lg border-2 p-5 transition-all ${pkg.isPromotion ? 'border-amber-500 bg-amber-50' : pkg.isPopular ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}
            >
              {pkg.isPromotion && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                  🎉 {t('packages.openBeta')}
                </span>
              )}
              {pkg.isPopular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-xs font-semibold px-3 py-1 rounded-full">{t('packages.popular')}</span>
              )}
              {pkg.discount > 0 && <span className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-semibold px-2 py-1 rounded">-{pkg.discount}%</span>}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">{t(`packages.names.${pkg.name}`)}</h3>
                <div className="mt-3">
                  <span className="text-3xl font-bold text-gray-900">{pkg.isFree ? t('packages.free') : `${getCurrencySymbol()}${formatPrice(getPrice(pkg))}`}</span>
                </div>
                <div className="mt-2 text-gray-500">
                  {pkg.isPromotion && pkg.originalCredits ? (
                    <>
                      <span className="text-base text-gray-400 line-through mr-2">{formatPrice(pkg.originalCredits)}</span>
                      <span className="text-xl font-semibold text-amber-600">{formatPrice(pkg.credits)}</span>
                    </>
                  ) : (
                    <span className="text-xl font-semibold text-primary-600">{formatPrice(pkg.credits)}</span>
                  )}
                  <span className="ml-1">{t('packages.credits')}</span>
                </div>
                {pkg.isPromotion && (
                  <p className="mt-2 text-xs text-amber-600 font-medium">{t('packages.openBetaNote')}</p>
                )}
                {!pkg.isFree && <p className="mt-2 text-sm text-gray-500">{t('packages.perCredit', { price: formatPrice(getPricePerCredit(pkg)) })}</p>}
                {pkg.isPurchasable && (
                  <Button
                    className="mt-4 w-full"
                    variant={pkg.isPopular ? 'primary' : 'outline'}
                    onClick={() => handlePurchase(pkg.name)}
                    disabled={loadingPackage === pkg.name}
                  >
                    {loadingPackage === pkg.name ? t('packages.processing') : t('packages.purchase')}
                  </Button>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('usage.action')}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('usage.creditsUsed')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {creditUsages.map((usage) => (
                <tr key={usage.action}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{t(`usage.actions.${usage.action}`)}</td>
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
      <Card>
        <CardHeader title={t('payment.title')} />
        <p className="text-sm text-gray-600">{t('payment.bankTransfer')}</p>
        <p className="text-sm text-gray-400 mt-2">{t('payment.comingSoon')}</p>
      </Card>

      {/* Customer Support */}
      <div className="text-center text-sm text-gray-500">
        <p>{t('support.contact')}: tkddn3367@gmail.com</p>
      </div>
    </div>
  );
};
