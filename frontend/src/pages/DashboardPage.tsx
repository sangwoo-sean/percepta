import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAuth } from '../hooks/useAuth';
import { fetchPersonas, fetchPersonaStats } from '../store/personaSlice';
import { fetchSessions } from '../store/feedbackSlice';
import type { RootState } from '../store';
import { Card, CardHeader, Button } from '../components/common';

export const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { personas, stats } = useSelector((state: RootState) => state.persona);
  const { sessions } = useSelector((state: RootState) => state.feedback);
  const { t } = useTranslation('dashboard');
  const { t: tCommon } = useTranslation('common');

  useEffect(() => {
    dispatch(fetchPersonas());
    dispatch(fetchPersonaStats());
    dispatch(fetchSessions());
  }, [dispatch]);

  const recentSessions = sessions.slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {t('welcome', { name: user?.name })}
        </h1>
        <p className="text-gray-600 mt-1">
          {t('overview')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('stats.personas')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.total || 0}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('stats.feedbackSessions')}</p>
              <p className="text-2xl font-bold text-gray-900">{sessions.length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('stats.credits')}</p>
              <p className="text-2xl font-bold text-gray-900">{user?.credits || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title={t('quickActions.title')}
            subtitle={t('quickActions.subtitle')}
          />
          <div className="space-y-3">
            <Link to="/feedback/new">
              <Button className="w-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t('quickActions.newSession')}
              </Button>
            </Link>
            <Link to="/personas">
              <Button variant="outline" className="w-full">
                {t('quickActions.managePersonas')}
              </Button>
            </Link>
          </div>
        </Card>

        <Card>
          <CardHeader
            title={t('recentPersonas.title')}
            subtitle={t('recentPersonas.totalCount', { count: personas.length })}
            action={
              <Link to="/personas" className="text-sm text-primary-600 hover:text-primary-700">
                {tCommon('button.viewAll')}
              </Link>
            }
          />
          <div className="space-y-3">
            {personas.slice(0, 3).map((persona) => (
              <div key={persona.id} className="flex items-center gap-3">
                {persona.data.avatarUrl ? (
                  <img
                    src={persona.data.avatarUrl}
                    alt={persona.data.name}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-sm font-medium">{persona.data.name[0]}</span>
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{persona.data.name}</p>
                  <p className="text-sm text-gray-500">
                    {persona.data.ageGroup} | {persona.data.occupation}
                  </p>
                </div>
              </div>
            ))}
            {personas.length === 0 && (
              <p className="text-gray-500 text-sm">{t('recentPersonas.empty')}</p>
            )}
          </div>
        </Card>
      </div>

      {recentSessions.length > 0 && (
        <Card>
          <CardHeader
            title={t('recentFeedback.title')}
            subtitle={t('recentFeedback.subtitle')}
            action={
              <Link to="/feedback/history" className="text-sm text-primary-600 hover:text-primary-700">
                {tCommon('button.viewAll')}
              </Link>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b">
                  <th className="pb-3">{t('recentFeedback.columns.input')}</th>
                  <th className="pb-3">{t('recentFeedback.columns.type')}</th>
                  <th className="pb-3">{t('recentFeedback.columns.status')}</th>
                  <th className="pb-3">{t('recentFeedback.columns.date')}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentSessions.map((session) => (
                  <tr key={session.id}>
                    <td className="py-3 max-w-xs truncate">{session.inputContent.substring(0, 50)}...</td>
                    <td className="py-3">{tCommon(`inputType.${session.inputType}`)}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        session.status === 'completed' ? 'bg-green-100 text-green-800' :
                        session.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        session.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {tCommon(`status.${session.status}`)}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-gray-500">
                      {new Date(session.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
