import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { fetchSession, fetchSummary } from '../store/feedbackSlice';
import type { RootState } from '../store';
import { Card, Button } from '../components/common';
import { FeedbackCard, FeedbackSummary } from '../components/feedback';

export const FeedbackResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { currentSession, isLoading } = useSelector(
    (state: RootState) => state.feedback
  );
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const { t } = useTranslation('feedback');

  useEffect(() => {
    if (id) {
      dispatch(fetchSession(id));
    }
  }, [id, dispatch]);

  const handleGenerateSummary = async () => {
    if (!id) return;

    setIsGeneratingSummary(true);
    try {
      await dispatch(fetchSummary(id)).unwrap();
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  if (isLoading || !currentSession) {
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
          <h1 className="text-2xl font-bold text-gray-900">{t('result.title')}</h1>
          <p className="text-gray-600 mt-1">
            {t('result.createdOn', { date: new Date(currentSession.createdAt).toLocaleDateString() })}
          </p>
        </div>
        <div className="flex gap-3">
          {!currentSession.summary && currentSession.results.length > 0 && (
            <Button
              onClick={handleGenerateSummary}
              isLoading={isGeneratingSummary}
              variant="outline"
            >
              {t('result.generateSummary')}
            </Button>
          )}
          <Link to="/feedback/new">
            <Button>{t('result.newFeedback')}</Button>
          </Link>
        </div>
      </div>

      <Card>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
              currentSession.inputType === 'text'
                ? 'bg-blue-100 text-blue-800'
                : currentSession.inputType === 'url'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-green-100 text-green-800'
            }`}>
              {currentSession.inputType}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-gray-700 whitespace-pre-wrap">
              {currentSession.inputContent.substring(0, 500)}
              {currentSession.inputContent.length > 500 && '...'}
            </p>
            {currentSession.inputUrl && (
              <a
                href={currentSession.inputUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary-600 hover:text-primary-700 mt-2 inline-block"
              >
                {t('result.viewSource')}
              </a>
            )}
          </div>
        </div>
      </Card>

      {currentSession.status === 'failed' ? (
        <Card className="text-center py-12">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('result.failed.title')}
          </h3>
          <p className="text-gray-600 mb-6">
            {t('result.failed.description')}
          </p>
          <Link to="/feedback/new">
            <Button>{t('result.failed.retry')}</Button>
          </Link>
        </Card>
      ) : (
        <>
          {(currentSession.summary || currentSession.results.length > 0) && (
            <FeedbackSummary session={currentSession} />
          )}

          {currentSession.results.length > 0 ? (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {t('result.individualFeedback', { count: currentSession.results.length })}
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {currentSession.results.map((result) => (
                  <FeedbackCard key={result.id} result={result} />
                ))}
              </div>
            </div>
          ) : (
            <Card className="text-center py-8">
              <p className="text-gray-600">{t('result.noResults')}</p>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
