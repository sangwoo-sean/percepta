import React from 'react';
import { useTranslation } from 'react-i18next';
import type { FeedbackResult } from '../../types';
import { Card } from '../common';

interface FeedbackCardProps {
  result: FeedbackResult;
}

const sentimentColors = {
  positive: 'bg-green-100 text-green-800',
  neutral: 'bg-gray-100 text-gray-800',
  negative: 'bg-red-100 text-red-800',
};

const intentColors = {
  high: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-orange-100 text-orange-800',
  none: 'bg-red-100 text-red-800',
};

export const FeedbackCard: React.FC<FeedbackCardProps> = ({ result }) => {
  const { t } = useTranslation('feedback');

  return (
    <Card>
      <div className="flex items-start gap-4 mb-4">
        {result.persona?.avatarUrl ? (
          <img
            src={result.persona.avatarUrl}
            alt={result.persona.name}
            className="w-12 h-12 rounded-full"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="font-bold text-primary-600">
              {result.persona?.name?.[0] || '?'}
            </span>
          </div>
        )}
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">
            {result.persona?.name || t('card.unknownPersona')}
          </h4>
          <p className="text-sm text-gray-500">
            {result.persona?.ageGroup} | {result.persona?.occupation}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-yellow-500">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${i < Math.round(Number(result.score)) ? 'fill-current' : 'stroke-current fill-none'}`}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            ))}
            <span className="text-sm text-gray-600 ml-1">{Number(result.score).toFixed(1)}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${sentimentColors[result.sentiment]}`}>
          {t(`summary.${result.sentiment}`)}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${intentColors[result.purchaseIntent]}`}>
          {t('card.purchaseIntent', { intent: t(`summary.intent.${result.purchaseIntent}`) })}
        </span>
      </div>

      <p className="text-gray-700 mb-4">{result.feedbackText}</p>

      {result.keyPoints.length > 0 && (
        <div>
          <h5 className="text-sm font-medium text-gray-900 mb-2">{t('card.keyPoints')}</h5>
          <ul className="list-disc list-inside space-y-1">
            {result.keyPoints.map((point, index) => (
              <li key={index} className="text-sm text-gray-600">
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};
