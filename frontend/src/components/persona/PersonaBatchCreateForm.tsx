import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { GeneratePersonasDto, AgeGroup } from '../../types';
import { Button, Select } from '../common';

interface PersonaBatchCreateFormProps {
  onSubmit: (dto: GeneratePersonasDto) => void;
  isLoading?: boolean;
}

const AGE_GROUPS: AgeGroup[] = ['10s', '20s', '30s', '40s', '50s', '60+'];

const COUNT_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1),
}));

export const PersonaBatchCreateForm: React.FC<PersonaBatchCreateFormProps> = ({
  onSubmit,
  isLoading,
}) => {
  const { t } = useTranslation('persona');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('20s');
  const [count, setCount] = useState('5');

  const ageGroupOptions = AGE_GROUPS.map((age) => ({
    value: age,
    label: t(`form.ageGroup.options.${age}`),
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ageGroup,
      count: parseInt(count, 10),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-sm text-gray-600">
        {t('batchForm.description')}
      </p>

      <Select
        label={t('form.ageGroup.label')}
        options={ageGroupOptions}
        value={ageGroup}
        onChange={(value) => setAgeGroup(value as AgeGroup)}
      />

      <Select
        label={t('batchForm.count')}
        options={COUNT_OPTIONS}
        value={count}
        onChange={setCount}
      />

      <Button type="submit" className="w-full" isLoading={isLoading}>
        {t('batchForm.generateButton', { count: parseInt(count, 10) })}
      </Button>
    </form>
  );
};
