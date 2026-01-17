import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Persona } from '../../types';
import { Card, Button } from '../common';

interface PersonaCardProps {
  persona: Persona;
  onDelete?: (id: string) => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
}

interface InfoRowProps {
  label: string;
  value: string | undefined | null;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => {
  if (!value) return null;
  return (
    <div className="flex">
      <span className="text-gray-500 w-24 flex-shrink-0">{label}</span>
      <span className="text-gray-900">{value}</span>
    </div>
  );
};

export const PersonaCard: React.FC<PersonaCardProps> = ({
  persona,
  onDelete,
  selectable,
  selected,
  onSelect,
}) => {
  const { t } = useTranslation('persona');
  const { t: tCommon } = useTranslation('common');
  const { data } = persona;

  return (
    <Card
      className={`relative ${selectable ? 'cursor-pointer' : ''} ${selected ? 'ring-2 ring-primary-500' : ''}`}
      onClick={selectable ? () => onSelect?.(persona.id) : undefined}
    >
      {selectable && (
        <div className="absolute top-4 right-4">
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
            selected ? 'border-primary-500 bg-primary-500' : 'border-gray-300'
          }`}>
            {selected && (
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-6">
        <div className="flex-shrink-0">
          {data.avatarUrl ? (
            <img
              src={data.avatarUrl}
              alt={data.name}
              className="w-20 h-20 rounded-full"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-600">{data.name[0]}</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-lg font-semibold text-gray-900">{data.name}</h3>
            <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-sm rounded-full">
              {t(`form.ageGroup.options.${data.ageGroup}`)}
            </span>
            {data.gender && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-sm rounded-full">
                {t(`card.genderOptions.${data.gender}`)}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 text-sm">
            <InfoRow label={t('form.occupation.label')} value={data.occupation} />
            <InfoRow label={t('card.location')} value={data.location} />
            <InfoRow label={t('card.education')} value={data.education} />
            <InfoRow label={t('card.incomeLevel')} value={data.incomeLevel} />
            <InfoRow label={t('card.dailyPattern')} value={data.dailyPattern} />
          </div>

          {data.personalityTraits && data.personalityTraits.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1">
              <span className="text-sm text-gray-500">{t('card.personalityTraits')}:</span>
              {data.personalityTraits.map((trait, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full"
                >
                  {trait}
                </span>
              ))}
            </div>
          )}

          {data.strengths && data.strengths.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-1">
              <span className="text-sm text-gray-500">{t('card.strengths')}:</span>
              {data.strengths.map((strength, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full"
                >
                  {strength}
                </span>
              ))}
            </div>
          )}

          {data.weaknesses && data.weaknesses.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-1">
              <span className="text-sm text-gray-500">{t('card.weaknesses')}:</span>
              {data.weaknesses.map((weakness, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-red-50 text-red-700 text-xs rounded-full"
                >
                  {weakness}
                </span>
              ))}
            </div>
          )}

          {data.description && (
            <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
              <span className="font-medium text-gray-700">{t('card.description')}: </span>
              {data.description}
            </div>
          )}
        </div>

        {onDelete && !selectable && (
          <div className="flex-shrink-0">
            <Button
              variant="danger"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(persona.id);
              }}
            >
              {tCommon('button.delete')}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
