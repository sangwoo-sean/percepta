import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { createSession, generateFeedback } from '../store/feedbackSlice';
import { fetchCurrentUser } from '../store/authSlice';
import type { InputType } from '../types';
import { Card, CardHeader, Button } from '../components/common';
import { FileUpload, PersonaSelector } from '../components/feedback';

type WizardStep = 'content' | 'personas' | 'generating';

export const NewFeedbackPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [step, setStep] = useState<WizardStep>('content');
  const [content, setContent] = useState('');
  const [inputType, setInputType] = useState<InputType>('text');
  const [inputUrl, setInputUrl] = useState<string | undefined>();
  const [selectedPersonaIds, setSelectedPersonaIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleContentReady = (newContent: string, type: InputType, url?: string) => {
    setContent(newContent);
    setInputType(type);
    setInputUrl(url);
    setStep('personas');
  };

  const handleGenerateFeedback = async () => {
    setError(null);
    setStep('generating');

    try {
      const session = await dispatch(
        createSession({
          inputType,
          inputContent: content,
          inputUrl,
          personaIds: selectedPersonaIds,
        })
      ).unwrap();

      await dispatch(
        generateFeedback({
          sessionId: session.id,
          personaIds: selectedPersonaIds,
        })
      ).unwrap();

      // Refresh user credits
      dispatch(fetchCurrentUser());

      navigate(`/feedback/${session.id}`);
    } catch (err) {
      setError('Failed to generate feedback. Please try again.');
      setStep('personas');
    }
  };

  const steps = [
    { id: 'content', label: 'Add Content' },
    { id: 'personas', label: 'Select Personas' },
    { id: 'generating', label: 'Generate Feedback' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Feedback Session</h1>
        <p className="text-gray-600 mt-1">
          Get AI-powered feedback from your personas
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between max-w-2xl">
        {steps.map((s, index) => (
          <React.Fragment key={s.id}>
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                  step === s.id
                    ? 'bg-primary-600 text-white'
                    : steps.findIndex((x) => x.id === step) > index
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {steps.findIndex((x) => x.id === step) > index ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-600 hidden sm:block">
                {s.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 mx-4 h-0.5 bg-gray-200" />
            )}
          </React.Fragment>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Step Content */}
      <Card>
        {step === 'content' && (
          <>
            <CardHeader
              title="Step 1: Add Your Content"
              subtitle="Enter the content you want to get feedback on"
            />
            <FileUpload onContentReady={handleContentReady} />
          </>
        )}

        {step === 'personas' && (
          <>
            <CardHeader
              title="Step 2: Select Personas"
              subtitle="Choose which personas should review your content"
              action={
                <Button variant="outline" size="sm" onClick={() => setStep('content')}>
                  Back
                </Button>
              }
            />
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Content preview:</strong> {content.substring(0, 200)}
                {content.length > 200 && '...'}
              </p>
            </div>
            <PersonaSelector
              selectedIds={selectedPersonaIds}
              onSelectionChange={setSelectedPersonaIds}
              onConfirm={handleGenerateFeedback}
            />
          </>
        )}

        {step === 'generating' && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Generating Feedback...
            </h3>
            <p className="text-gray-600">
              Our AI personas are reviewing your content. This may take a moment.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};
