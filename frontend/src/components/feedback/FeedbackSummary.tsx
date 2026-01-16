import React from 'react';
import type { FeedbackSession } from '../../types';
import { Card, CardHeader } from '../common';

interface FeedbackSummaryProps {
  session: FeedbackSession;
}

export const FeedbackSummary: React.FC<FeedbackSummaryProps> = ({ session }) => {
  if (!session.results || session.results.length === 0) {
    return null;
  }

  const avgScore =
    session.results.reduce((sum, r) => sum + Number(r.score), 0) / session.results.length;

  const sentimentCounts = session.results.reduce(
    (acc, r) => {
      acc[r.sentiment] = (acc[r.sentiment] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const intentCounts = session.results.reduce(
    (acc, r) => {
      acc[r.purchaseIntent] = (acc[r.purchaseIntent] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <Card className="mb-6">
      <CardHeader
        title="Summary"
        subtitle={`Based on ${session.results.length} persona feedbacks`}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-primary-50 rounded-lg">
          <p className="text-3xl font-bold text-primary-600">{avgScore.toFixed(1)}</p>
          <p className="text-sm text-gray-600">Avg. Score</p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <p className="text-3xl font-bold text-green-600">{sentimentCounts.positive || 0}</p>
          <p className="text-sm text-gray-600">Positive</p>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-3xl font-bold text-gray-600">{sentimentCounts.neutral || 0}</p>
          <p className="text-sm text-gray-600">Neutral</p>
        </div>
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <p className="text-3xl font-bold text-red-600">{sentimentCounts.negative || 0}</p>
          <p className="text-sm text-gray-600">Negative</p>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Purchase Intent Distribution</h4>
        <div className="flex gap-2">
          {(['high', 'medium', 'low', 'none'] as const).map((intent) => {
            const count = intentCounts[intent] || 0;
            const percentage = session.results.length > 0
              ? Math.round((count / session.results.length) * 100)
              : 0;
            const colors = {
              high: 'bg-green-500',
              medium: 'bg-yellow-500',
              low: 'bg-orange-500',
              none: 'bg-red-500',
            };

            return (
              <div key={intent} className="flex-1">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-1">
                  <div
                    className={`h-full ${colors[intent]}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 text-center capitalize">
                  {intent}: {count}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {session.summary && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">AI Analysis</h4>
          <div className="prose prose-sm text-gray-700 whitespace-pre-wrap">
            {session.summary}
          </div>
        </div>
      )}
    </Card>
  );
};
