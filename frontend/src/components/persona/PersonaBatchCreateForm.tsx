import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getCurrentLocale } from '../../i18n';
import type { GeneratePersonasDto, AgeGroup } from '../../types';
import { Button, Select, RangeSlider } from '../common';

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
  const [ageRange, setAgeRange] = useState<[number, number]>([0, 5]);
  const [count, setCount] = useState('5');

  const ageGroupLabels = useMemo(
    () => AGE_GROUPS.map((age) => t(`form.ageGroup.options.${age}`)),
    [t]
  );

  const selectedAgeGroups = useMemo(
    () => AGE_GROUPS.slice(ageRange[0], ageRange[1] + 1),
    [ageRange]
  );

  const selectedRangeText = useMemo(() => {
    const startLabel = t(`form.ageGroup.options.${AGE_GROUPS[ageRange[0]]}`);
    const endLabel = t(`form.ageGroup.options.${AGE_GROUPS[ageRange[1]]}`);
    if (ageRange[0] === ageRange[1]) {
      return startLabel;
    }
    return `${startLabel} ~ ${endLabel}`;
  }, [ageRange, t]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ageGroups: selectedAgeGroups,
      count: parseInt(count, 10),
      locale: getCurrentLocale(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-sm text-gray-600">
        {t('batchForm.description')}
      </p>

      <div>
        <RangeSlider
          label={t('form.ageGroup.label')}
          min={0}
          max={5}
          value={ageRange}
          onChange={setAgeRange}
          labels={ageGroupLabels}
        />
        <div className="mt-2 text-sm text-blue-600 font-medium text-center">
          {selectedRangeText}
        </div>
      </div>

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
