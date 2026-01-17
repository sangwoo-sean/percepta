import React from 'react';
import { useTranslation } from 'react-i18next';
import type { AgeGroup, Gender, PersonaFilterState } from '../../types';

interface PersonaFilterProps {
  filter: PersonaFilterState;
  onAgeGroupsChange: (ageGroups: AgeGroup[]) => void;
  onGendersChange: (genders: Gender[]) => void;
  onReset: () => void;
  hasActiveFilter: boolean;
}

const AGE_GROUPS: AgeGroup[] = ['10s', '20s', '30s', '40s', '50s', '60+'];
const GENDERS: Gender[] = ['male', 'female'];

export const PersonaFilter: React.FC<PersonaFilterProps> = ({
  filter,
  onAgeGroupsChange,
  onGendersChange,
  onReset,
  hasActiveFilter,
}) => {
  const { t } = useTranslation('persona');

  const toggleAgeGroup = (ageGroup: AgeGroup) => {
    if (filter.ageGroups.includes(ageGroup)) {
      onAgeGroupsChange(filter.ageGroups.filter((ag) => ag !== ageGroup));
    } else {
      onAgeGroupsChange([...filter.ageGroups, ageGroup]);
    }
  };

  const toggleGender = (gender: Gender) => {
    if (filter.genders.includes(gender)) {
      onGendersChange(filter.genders.filter((g) => g !== gender));
    } else {
      onGendersChange([...filter.genders, gender]);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('filter.ageGroup')}
          </label>
          <div className="flex flex-wrap gap-2">
            {AGE_GROUPS.map((ageGroup) => (
              <button
                key={ageGroup}
                onClick={() => toggleAgeGroup(ageGroup)}
                className={`
                  px-3 py-1.5 text-sm rounded-full font-medium transition-colors duration-200
                  ${
                    filter.ageGroups.includes(ageGroup)
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-primary-400'
                  }
                `}
              >
                {t(`form.ageGroup.options.${ageGroup}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-shrink-0">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('filter.gender')}
          </label>
          <div className="flex flex-wrap gap-2">
            {GENDERS.map((gender) => (
              <button
                key={gender}
                onClick={() => toggleGender(gender)}
                className={`
                  px-3 py-1.5 text-sm rounded-full font-medium transition-colors duration-200
                  ${
                    filter.genders.includes(gender)
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-primary-400'
                  }
                `}
              >
                {t(`form.gender.options.${gender}`)}
              </button>
            ))}
          </div>
        </div>

        {hasActiveFilter && (
          <div className="flex-shrink-0 self-end">
            <button
              onClick={onReset}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              {t('filter.reset')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
