import React, { useState } from 'react';
import type { CreatePersonaDto, AgeGroup } from '../../types';
import { Button, Select } from '../common';

interface PersonaBatchCreateFormProps {
  onSubmit: (personas: CreatePersonaDto[]) => void;
  isLoading?: boolean;
}

const AGE_GROUPS: AgeGroup[] = ['10s', '20s', '30s', '40s', '50s', '60+'];

const AGE_GROUP_OPTIONS: { value: AgeGroup; label: string }[] = AGE_GROUPS.map(
  (age) => ({ value: age, label: age })
);

const OCCUPATIONS = [
  'Student',
  'Software Engineer',
  'Designer',
  'Marketing Manager',
  'Teacher',
  'Doctor',
  'Nurse',
  'Accountant',
  'Sales Representative',
  'Entrepreneur',
  'Freelancer',
  'Researcher',
  'Consultant',
  'Project Manager',
  'Data Analyst',
  'Content Creator',
  'Photographer',
  'Chef',
  'Lawyer',
  'Real Estate Agent',
];

const PERSONALITY_TRAITS = [
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

const COUNT_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1),
}));

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomTraits(): string[] {
  const count = Math.floor(Math.random() * 3) + 1;
  const shuffled = [...PERSONALITY_TRAITS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function getAgeGroupsInRange(from: AgeGroup, to: AgeGroup): AgeGroup[] {
  const fromIdx = AGE_GROUPS.indexOf(from);
  const toIdx = AGE_GROUPS.indexOf(to);
  return AGE_GROUPS.slice(fromIdx, toIdx + 1);
}

export const PersonaBatchCreateForm: React.FC<PersonaBatchCreateFormProps> = ({
  onSubmit,
  isLoading,
}) => {
  const [ageGroupFrom, setAgeGroupFrom] = useState<AgeGroup>('10s');
  const [ageGroupTo, setAgeGroupTo] = useState<AgeGroup>('60+');
  const [count, setCount] = useState('5');

  const handleAgeGroupFromChange = (value: AgeGroup) => {
    setAgeGroupFrom(value);
    const fromIdx = AGE_GROUPS.indexOf(value);
    const toIdx = AGE_GROUPS.indexOf(ageGroupTo);
    if (fromIdx > toIdx) {
      setAgeGroupTo(value);
    }
  };

  const handleAgeGroupToChange = (value: AgeGroup) => {
    setAgeGroupTo(value);
    const fromIdx = AGE_GROUPS.indexOf(ageGroupFrom);
    const toIdx = AGE_GROUPS.indexOf(value);
    if (toIdx < fromIdx) {
      setAgeGroupFrom(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const availableAgeGroups = getAgeGroupsInRange(ageGroupFrom, ageGroupTo);
    const personas: CreatePersonaDto[] = Array.from(
      { length: parseInt(count, 10) },
      () => ({
        ageGroup: getRandomItem(availableAgeGroups),
        occupation: getRandomItem(OCCUPATIONS),
        personalityTraits: getRandomTraits(),
      })
    );

    onSubmit(personas);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-sm text-gray-600">
        Quickly generate multiple personas with random attributes. Names and
        avatars are automatically generated.
      </p>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Age Group
        </label>
        <div className="flex items-center gap-2">
          <Select
            options={AGE_GROUP_OPTIONS}
            value={ageGroupFrom}
            onChange={(value) => handleAgeGroupFromChange(value as AgeGroup)}
          />
          <span className="text-gray-500">~</span>
          <Select
            options={AGE_GROUP_OPTIONS}
            value={ageGroupTo}
            onChange={(value) => handleAgeGroupToChange(value as AgeGroup)}
          />
        </div>
      </div>

      <Select
        label="Number of Personas"
        options={COUNT_OPTIONS}
        value={count}
        onChange={setCount}
      />

      <Button type="submit" className="w-full" isLoading={isLoading}>
        Generate {count} Persona{parseInt(count, 10) > 1 ? 's' : ''}
      </Button>
    </form>
  );
};
