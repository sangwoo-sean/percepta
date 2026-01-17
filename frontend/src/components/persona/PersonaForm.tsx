import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { CreatePersonaDto, UpdatePersonaDto, AgeGroup, Gender, Persona } from '../../types';
import { Button, Input, Select, TagInput } from '../common';

interface PersonaFormProps {
  mode: 'create' | 'edit';
  initialData?: Persona;
  onSubmit: (data: CreatePersonaDto | UpdatePersonaDto) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const AGE_GROUP_KEYS: AgeGroup[] = ['10s', '20s', '30s', '40s', '50s', '60+'];
const GENDER_KEYS: Gender[] = ['male', 'female'];

const PERSONALITY_TRAIT_KEYS = [
  'Analytical',
  'Creative',
  'Curious',
  'Detail-oriented',
  'Early adopter',
  'Frugal',
  'Health-conscious',
  'Impulsive',
  'Practical',
  'Quality-focused',
  'Social',
  'Tech-savvy',
  'Trendy',
  'Value-driven',
];

interface FormData {
  name: string;
  ageGroup: AgeGroup;
  gender: Gender | '';
  occupation: string;
  location: string;
  education: string;
  incomeLevel: string;
  dailyPattern: string;
  personalityTraits: string[];
  strengths: string[];
  weaknesses: string[];
  description: string;
}

export const PersonaForm: React.FC<PersonaFormProps> = ({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const { t } = useTranslation('persona');
  const { t: tCommon } = useTranslation('common');

  const [formData, setFormData] = useState<FormData>({
    name: '',
    ageGroup: '20s',
    gender: '',
    occupation: '',
    location: '',
    education: '',
    incomeLevel: '',
    dailyPattern: '',
    personalityTraits: [],
    strengths: [],
    weaknesses: [],
    description: '',
  });

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData({
        name: initialData.data.name || '',
        ageGroup: initialData.data.ageGroup,
        gender: initialData.data.gender || '',
        occupation: initialData.data.occupation,
        location: initialData.data.location || '',
        education: initialData.data.education || '',
        incomeLevel: initialData.data.incomeLevel || '',
        dailyPattern: initialData.data.dailyPattern || '',
        personalityTraits: initialData.data.personalityTraits || [],
        strengths: initialData.data.strengths || [],
        weaknesses: initialData.data.weaknesses || [],
        description: initialData.data.description || '',
      });
    }
  }, [mode, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'create') {
      const dto: CreatePersonaDto = {
        data: {
          name: formData.name || undefined,
          ageGroup: formData.ageGroup,
          gender: formData.gender || undefined,
          occupation: formData.occupation,
          location: formData.location || undefined,
          education: formData.education || undefined,
          incomeLevel: formData.incomeLevel || undefined,
          dailyPattern: formData.dailyPattern || undefined,
          personalityTraits: formData.personalityTraits.length > 0 ? formData.personalityTraits : undefined,
          strengths: formData.strengths.length > 0 ? formData.strengths : undefined,
          weaknesses: formData.weaknesses.length > 0 ? formData.weaknesses : undefined,
          description: formData.description || undefined,
        },
      };
      onSubmit(dto);
    } else {
      const dto: UpdatePersonaDto = {
        data: {
          name: formData.name || undefined,
          ageGroup: formData.ageGroup,
          gender: formData.gender || undefined,
          occupation: formData.occupation,
          location: formData.location || undefined,
          education: formData.education || undefined,
          incomeLevel: formData.incomeLevel || undefined,
          dailyPattern: formData.dailyPattern || undefined,
          personalityTraits: formData.personalityTraits,
          strengths: formData.strengths,
          weaknesses: formData.weaknesses,
          description: formData.description || undefined,
        },
      };
      onSubmit(dto);
    }
  };

  const toggleTrait = (trait: string) => {
    setFormData((prev) => ({
      ...prev,
      personalityTraits: prev.personalityTraits.includes(trait)
        ? prev.personalityTraits.filter((t) => t !== trait)
        : [...prev.personalityTraits, trait],
    }));
  };

  const ageGroupOptions = AGE_GROUP_KEYS.map((key) => ({
    value: key,
    label: t(`form.ageGroup.options.${key}`),
  }));

  const genderOptions = [
    { value: '', label: t('form.gender.placeholder') },
    ...GENDER_KEYS.map((key) => ({
      value: key,
      label: t(`form.gender.options.${key}`),
    })),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info Section */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          {t('form.section.basic')}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t('form.name.label')}
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            placeholder={t('form.name.placeholder')}
          />
          <Select
            label={t('form.ageGroup.label')}
            options={ageGroupOptions}
            value={formData.ageGroup}
            onChange={(value) => setFormData((prev) => ({ ...prev, ageGroup: value as AgeGroup }))}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Select
            label={t('form.gender.label')}
            options={genderOptions}
            value={formData.gender}
            onChange={(value) => setFormData((prev) => ({ ...prev, gender: value as Gender | '' }))}
          />
          <Input
            label={t('form.occupation.label')}
            value={formData.occupation}
            onChange={(e) => setFormData((prev) => ({ ...prev, occupation: e.target.value }))}
            placeholder={t('form.occupation.placeholder')}
            required
          />
        </div>
      </div>

      {/* Demographics Section */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          {t('form.section.demographics')}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t('form.location.label')}
            value={formData.location}
            onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
            placeholder={t('form.location.placeholder')}
          />
          <Input
            label={t('form.education.label')}
            value={formData.education}
            onChange={(e) => setFormData((prev) => ({ ...prev, education: e.target.value }))}
            placeholder={t('form.education.placeholder')}
          />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Input
            label={t('form.incomeLevel.label')}
            value={formData.incomeLevel}
            onChange={(e) => setFormData((prev) => ({ ...prev, incomeLevel: e.target.value }))}
            placeholder={t('form.incomeLevel.placeholder')}
          />
          <Input
            label={t('form.dailyPattern.label')}
            value={formData.dailyPattern}
            onChange={(e) => setFormData((prev) => ({ ...prev, dailyPattern: e.target.value }))}
            placeholder={t('form.dailyPattern.placeholder')}
          />
        </div>
      </div>

      {/* Traits Section */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          {t('form.section.traits')}
        </h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('form.personalityTraits.label')}
          </label>
          <div className="flex flex-wrap gap-2">
            {PERSONALITY_TRAIT_KEYS.map((trait) => (
              <button
                key={trait}
                type="button"
                onClick={() => toggleTrait(trait)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  formData.personalityTraits.includes(trait)
                    ? 'bg-primary-100 text-primary-700 border-primary-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } border`}
              >
                {t(`form.personalityTraits.traits.${trait}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <TagInput
            label={t('form.strengths.label')}
            value={formData.strengths}
            onChange={(strengths) => setFormData((prev) => ({ ...prev, strengths }))}
            placeholder={t('form.strengths.placeholder')}
            tagColor="green"
          />
          <TagInput
            label={t('form.weaknesses.label')}
            value={formData.weaknesses}
            onChange={(weaknesses) => setFormData((prev) => ({ ...prev, weaknesses }))}
            placeholder={t('form.weaknesses.placeholder')}
            tagColor="red"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('form.description.label')}
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            placeholder={t('form.description.placeholder')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows={3}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        {mode === 'edit' && onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            {tCommon('button.cancel')}
          </Button>
        )}
        <Button type="submit" isLoading={isLoading} className={mode === 'create' ? 'w-full' : ''}>
          {mode === 'create' ? t('form.submitButton') : t('form.updateButton')}
        </Button>
      </div>
    </form>
  );
};
