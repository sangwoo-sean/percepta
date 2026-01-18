import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { uploadApi } from '../../api/upload';
import { Button, Input } from '../common';

interface FileUploadProps {
  onContentReady: (content: string, type: 'file' | 'url' | 'text' | 'image', url?: string, imageUrls?: string[]) => void;
}

type InputMode = 'text' | 'file' | 'url';

interface ImagePreview {
  file: File;
  previewUrl: string;
}

// TODO: file/URL features enabled after stabilization
// To enable, add modes to array: ['text', 'file', 'url']
const ENABLED_MODES: InputMode[] = ['text'];
const MAX_IMAGES = 3;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB per image
const MAX_TOTAL_SIZE = 15 * 1024 * 1024; // 15MB total

export const FileUpload: React.FC<FileUploadProps> = ({ onContentReady }) => {
  const { t } = useTranslation('feedback');
  const [mode, setMode] = useState<InputMode>('text');
  const [textContent, setTextContent] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

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

  const onImageDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);

    const currentCount = imagePreviews.length;
    const availableSlots = MAX_IMAGES - currentCount;

    if (availableSlots <= 0) {
      setError(t('upload.image.maxFilesError', { max: MAX_IMAGES }));
      return;
    }

    const filesToAdd = acceptedFiles.slice(0, availableSlots);
    const currentTotalSize = imagePreviews.reduce((sum, img) => sum + img.file.size, 0);

    const validFiles: File[] = [];
    let newTotalSize = currentTotalSize;

    for (const file of filesToAdd) {
      if (!file.type.startsWith('image/')) {
        setError(t('upload.image.typeError'));
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        setError(t('upload.image.sizeError', { max: '5MB' }));
        continue;
      }
      if (newTotalSize + file.size > MAX_TOTAL_SIZE) {
        setError(t('upload.image.totalSizeError', { max: '15MB' }));
        break;
      }
      validFiles.push(file);
      newTotalSize += file.size;
    }

    const newPreviews = validFiles.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setImagePreviews((prev) => [...prev, ...newPreviews]);
  }, [imagePreviews, t]);

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

  const { getRootProps: getImageRootProps, getInputProps: getImageInputProps, isDragActive: isImageDragActive } = useDropzone({
    onDrop: onImageDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    maxFiles: MAX_IMAGES,
    maxSize: MAX_IMAGE_SIZE,
  });

  const removeImage = (index: number) => {
    setImagePreviews((prev) => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index].previewUrl);
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

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

  const handleTextSubmit = async () => {
    const hasText = textContent.trim().length > 0;
    const hasImages = imagePreviews.length > 0;

    if (!hasText && !hasImages) {
      return;
    }

    setError(null);

    if (hasImages) {
      setIsUploadingImages(true);
      try {
        const files = imagePreviews.map((p) => p.file);
        const uploadResults = await uploadApi.uploadImages(files);
        const imageUrls = uploadResults.map((r) => r.url);

        // Determine input type based on content
        const inputType = hasText ? 'image' : 'image';
        onContentReady(textContent || '', inputType, undefined, imageUrls);
      } catch (err) {
        setError(t('upload.image.uploadError'));
      } finally {
        setIsUploadingImages(false);
      }
    } else {
      onContentReady(textContent, 'text');
    }
  };

  const canSubmit = textContent.trim().length > 0 || imagePreviews.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {ENABLED_MODES.map((m) => (
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

          {/* Image Upload Section */}
          <div className="border-t pt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              {t('upload.image.title')}
            </p>
            <div
              {...getImageRootProps()}
              className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
                isImageDragActive
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-primary-400'
              }`}
            >
              <input {...getImageInputProps()} />
              <div className="flex flex-col items-center">
                <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-600">
                  {isImageDragActive
                    ? t('upload.image.dropzoneActive')
                    : t('upload.image.dropzone')}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {t('upload.image.limits', { maxFiles: MAX_IMAGES, maxSize: '5MB' })}
                </p>
              </div>
            </div>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {imagePreviews.map((preview, index) => (
                  <div key={preview.previewUrl} className="relative group">
                    <img
                      src={preview.previewUrl}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <p className="text-xs text-gray-500 mt-1 truncate">{preview.file.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            onClick={handleTextSubmit}
            disabled={!canSubmit}
            isLoading={isUploadingImages}
          >
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
