import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { fetchSessions } from '../store/feedbackSlice';
import type { RootState } from '../store';
import { Card, Button } from '../components/common';

export const FeedbackHistoryPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { sessions, isLoading } = useSelector((state: RootState) => state.feedback);
  const { t } = useTranslation('feedback');
  const { t: tCommon } = useTranslation('common');

  useEffect(() => {
    dispatch(fetchSessions());
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('history.title')}</h1>
          <p className="text-gray-600 mt-1">
            {t('history.subtitle')}
          </p>
        </div>
        <Link to="/feedback/new">
          <Button>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('history.newFeedback')}
          </Button>
        </Link>
      </div>

      {sessions.length === 0 ? (
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('history.empty.title')}</h3>
          <p className="text-gray-500 mb-4">
            {t('history.empty.description')}
          </p>
          <Link to="/feedback/new">
            <Button>{t('history.empty.createButton')}</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => {
            const avgScore = session.results?.length
              ? session.results.reduce((sum, r) => sum + Number(r.score), 0) /
                session.results.length
              : null;

            return (
              <Link key={session.id} to={`/feedback/${session.id}`}>
                <Card className="hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            session.inputType === 'text'
                              ? 'bg-blue-100 text-blue-800'
                              : session.inputType === 'url'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {tCommon(`inputType.${session.inputType}`)}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            session.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : session.status === 'processing'
                              ? 'bg-yellow-100 text-yellow-800'
                              : session.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {tCommon(`status.${session.status}`)}
                        </span>
                      </div>
                      <p className="text-gray-700 line-clamp-2">
                        {session.inputContent.substring(0, 200)}
                        {session.inputContent.length > 200 && '...'}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                        <span>{t('history.feedbackCount', { count: session.results?.length || 0 })}</span>
                        <span>{t('history.creditsUsed', { count: session.creditsUsed })}</span>
                      </div>
                    </div>
                    {avgScore !== null && (
                      <div className="text-right ml-4">
                        <div className="flex items-center gap-1 text-yellow-500">
                          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                          <span className="font-medium text-gray-700">
                            {avgScore.toFixed(1)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{t('history.avgScore')}</p>
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
