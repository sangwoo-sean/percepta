import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('feedback');
  const { t: tCommon } = useTranslation('common');
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

      dispatch(fetchCurrentUser());

      navigate(`/feedback/${session.id}`);
    } catch (err) {
      setError(t('new.error'));
      setStep('personas');
    }
  };

  const steps = [
    { id: 'content', label: t('new.steps.content') },
    { id: 'personas', label: t('new.steps.personas') },
    { id: 'generating', label: t('new.steps.generating') },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('new.title')}</h1>
        <p className="text-gray-600 mt-1">
          {t('new.subtitle')}
        </p>
      </div>

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

      <Card>
        {step === 'content' && (
          <>
            <CardHeader
              title={t('new.step1.title')}
              subtitle={t('new.step1.subtitle')}
            />
            <FileUpload onContentReady={handleContentReady} />
          </>
        )}

        {step === 'personas' && (
          <>
            <CardHeader
              title={t('new.step2.title')}
              subtitle={t('new.step2.subtitle')}
              action={
                <Button variant="outline" size="sm" onClick={() => setStep('content')}>
                  {tCommon('button.back')}
                </Button>
              }
            />
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>{t('new.step2.contentPreview')}</strong> {content.substring(0, 200)}
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
              {t('new.generating.title')}
            </h3>
            <p className="text-gray-600">
              {t('new.generating.description')}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};
