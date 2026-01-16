import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
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
          <h1 className="text-2xl font-bold text-gray-900">Feedback Results</h1>
          <p className="text-gray-600 mt-1">
            Created on {new Date(currentSession.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-3">
          {!currentSession.summary && currentSession.results.length > 0 && (
            <Button
              onClick={handleGenerateSummary}
              isLoading={isGeneratingSummary}
              variant="outline"
            >
              Generate AI Summary
            </Button>
          )}
          <Link to="/feedback/new">
            <Button>New Feedback</Button>
          </Link>
        </div>
      </div>

      {/* Input Content Preview */}
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
                View original source
              </a>
            )}
          </div>
        </div>
      </Card>

      {/* Summary */}
      {(currentSession.summary || currentSession.results.length > 0) && (
        <FeedbackSummary session={currentSession} />
      )}

      {/* Individual Feedback Cards */}
      {currentSession.results.length > 0 ? (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Individual Feedback ({currentSession.results.length})
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {currentSession.results.map((result) => (
              <FeedbackCard key={result.id} result={result} />
            ))}
          </div>
        </div>
      ) : (
        <Card className="text-center py-8">
          <p className="text-gray-600">No feedback results yet.</p>
        </Card>
      )}
    </div>
  );
};
