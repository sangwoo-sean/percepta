import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { uploadApi } from '../../api/upload';
import { Button, Input } from '../common';

interface FileUploadProps {
  onContentReady: (content: string, type: 'file' | 'url' | 'text', url?: string) => void;
}

type InputMode = 'text' | 'file' | 'url';

export const FileUpload: React.FC<FileUploadProps> = ({ onContentReady }) => {
  const { t } = useTranslation('feedback');
  const [mode, setMode] = useState<InputMode>('text');
  const [textContent, setTextContent] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      if (file.type.startsWith('text/')) {
        const content = await file.text();
        setUploadedFile(file.name);
        onContentReady(content, 'file');
      } else {
        const result = await uploadApi.uploadFile(file);
        setUploadedFile(file.name);
        onContentReady(result.url, 'file', result.url);
      }
    } catch (err) {
      setError(t('upload.file.error'));
    } finally {
      setIsLoading(false);
    }
  }, [onContentReady, t]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/*': ['.txt', '.md', '.html'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const handleUrlSubmit = async () => {
    if (!urlInput) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await uploadApi.scrapeUrl(urlInput);
      onContentReady(result.content, 'url', urlInput);
    } catch (err) {
      setError(t('upload.url.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextSubmit = () => {
    if (textContent.trim()) {
      onContentReady(textContent, 'text');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {(['text', 'file', 'url'] as InputMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              mode === m
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t(`upload.modes.${m}`)}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {mode === 'text' && (
        <div className="space-y-4">
          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder={t('upload.text.placeholder')}
            className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
          <Button onClick={handleTextSubmit} disabled={!textContent.trim()}>
            {t('upload.text.continueButton')}
          </Button>
        </div>
      )}

      {mode === 'file' && (
        <div className="space-y-4">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
              isDragActive
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-primary-400'
            }`}
          >
            <input {...getInputProps()} />
            {isLoading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mb-3" />
                <p className="text-gray-600">{t('upload.file.uploading')}</p>
              </div>
            ) : uploadedFile ? (
              <div className="flex flex-col items-center">
                <svg className="w-10 h-10 text-green-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-900 font-medium">{uploadedFile}</p>
                <p className="text-sm text-gray-500">{t('upload.file.success')}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <svg className="w-10 h-10 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-gray-600 mb-1">
                  {isDragActive
                    ? t('upload.file.dropzoneActive')
                    : t('upload.file.dropzone')}
                </p>
                <p className="text-sm text-gray-400">
                  {t('upload.file.supportedFormats')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {mode === 'url' && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder={t('upload.url.placeholder')}
              className="flex-1"
            />
            <Button onClick={handleUrlSubmit} isLoading={isLoading} disabled={!urlInput}>
              {t('upload.url.fetchButton')}
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            {t('upload.url.description')}
          </p>
        </div>
      )}
    </div>
  );
};
