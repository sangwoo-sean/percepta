import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Card } from '../common';
import type { PersonaStats, AgeGroup } from '../../types';

interface PersonaStatsChartsProps {
  stats: PersonaStats;
}

const AGE_GROUP_ORDER: AgeGroup[] = ['10s', '20s', '30s', '40s', '50s', '60+'];
const GENDER_COLORS: Record<'male' | 'female' | 'unknown', string> = {
  male: '#3B82F6',
  female: '#EC4899',
  unknown: '#9CA3AF',
};
const BAR_COLOR = '#6366F1';

export const PersonaStatsCharts: React.FC<PersonaStatsChartsProps> = ({ stats }) => {
  const { t } = useTranslation('persona');

  const ageGroupData = AGE_GROUP_ORDER.map((ageGroup) => ({
    name: t(`form.ageGroup.options.${ageGroup}`, { defaultValue: ageGroup }),
    value: stats.byAgeGroup[ageGroup] || 0,
  }));

  const genderData = (['male', 'female', 'unknown'] as const)
    .filter((gender) => stats.byGender[gender] > 0)
    .map((gender) => ({
      name: gender === 'unknown'
        ? t('stats.unknown')
        : t(`card.genderOptions.${gender}`),
      value: stats.byGender[gender],
      color: GENDER_COLORS[gender],
    }));

  const hasGenderData = genderData.length > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="flex flex-col items-center justify-center py-6">
        <p className="text-5xl font-bold text-primary-600">{stats.total}</p>
        <p className="text-sm text-gray-500 mt-2">{t('stats.total')}</p>
      </Card>

      <Card className="py-4">
        <p className="text-sm font-medium text-gray-700 mb-3 px-4">{t('stats.byAgeGroup')}</p>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={ageGroupData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={30}
            />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: 'none',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
            />
            <Bar dataKey="value" fill={BAR_COLOR} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="py-4">
        <p className="text-sm font-medium text-gray-700 mb-3 px-4">{t('stats.byGender')}</p>
        {hasGenderData ? (
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={55}
                paddingAngle={2}
                dataKey="value"
              >
                {genderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[150px] text-gray-400 text-sm">
            {t('stats.unknown')}
          </div>
        )}
      </Card>
    </div>
  );
};
