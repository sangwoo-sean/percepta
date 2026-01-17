import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CreatePersonaDto, AgeGroup } from '../../types';
import { Button, Input, Select } from '../common';

interface PersonaCreateFormProps {
  onSubmit: (data: CreatePersonaDto) => void;
  isLoading?: boolean;
}

const AGE_GROUP_KEYS: AgeGroup[] = ['10s', '20s', '30s', '40s', '50s', '60+'];

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

export const PersonaCreateForm: React.FC<PersonaCreateFormProps> = ({
  onSubmit,
  isLoading,
}) => {
  const { t } = useTranslation('persona');
  const [formData, setFormData] = useState<CreatePersonaDto>({
    name: '',
    ageGroup: '20s',
    occupation: '',
    personalityTraits: [],
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const toggleTrait = (trait: string) => {
    setFormData((prev) => ({
      ...prev,
      personalityTraits: prev.personalityTraits?.includes(trait)
        ? prev.personalityTraits.filter((t) => t !== trait)
        : [...(prev.personalityTraits || []), trait],
    }));
  };

  const ageGroupOptions = AGE_GROUP_KEYS.map((key) => ({
    value: key,
    label: t(`form.ageGroup.options.${key}`),
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label={t('form.name.label')}
        value={formData.name}
        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
        placeholder={t('form.name.placeholder')}
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          label={t('form.ageGroup.label')}
          options={ageGroupOptions}
          value={formData.ageGroup}
          onChange={(value) => setFormData((prev) => ({ ...prev, ageGroup: value as AgeGroup }))}
        />

        <Input
          label={t('form.occupation.label')}
          value={formData.occupation}
          onChange={(e) => setFormData((prev) => ({ ...prev, occupation: e.target.value }))}
          placeholder={t('form.occupation.placeholder')}
          required
        />
      </div>

      <div>
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
                formData.personalityTraits?.includes(trait)
                  ? 'bg-primary-100 text-primary-700 border-primary-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } border`}
            >
              {t(`form.personalityTraits.traits.${trait}`)}
            </button>
          ))}
        </div>
      </div>

      <div>
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

      <Button type="submit" className="w-full" isLoading={isLoading}>
        {t('form.submitButton')}
      </Button>
    </form>
  );
};
