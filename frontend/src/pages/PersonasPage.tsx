import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '../hooks/useAppDispatch';
import {
  fetchPersonas,
  createPersona,
  generatePersonas,
  deletePersona,
  fetchPersonaStats,
} from '../store/personaSlice';
import type { RootState } from '../store';
import type { CreatePersonaDto, GeneratePersonasDto } from '../types';
import { Card, Button, Modal } from '../components/common';
import {
  PersonaCard,
  PersonaCreateForm,
  PersonaBatchCreateForm,
} from '../components/persona';

export const PersonasPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { personas, stats, isLoading } = useSelector((state: RootState) => state.persona);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { t } = useTranslation('persona');

  useEffect(() => {
    dispatch(fetchPersonas());
    dispatch(fetchPersonaStats());
  }, [dispatch]);

  const handleCreate = async (data: CreatePersonaDto) => {
    setIsCreating(true);
    try {
      await dispatch(createPersona(data)).unwrap();
      setIsCustomModalOpen(false);
      dispatch(fetchPersonaStats());
    } finally {
      setIsCreating(false);
    }
  };

  const handleGenerate = async (dto: GeneratePersonasDto) => {
    setIsCreating(true);
    try {
      await dispatch(generatePersonas(dto)).unwrap();
      setIsBatchModalOpen(false);
      dispatch(fetchPersonaStats());
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('deleteConfirm'))) {
      await dispatch(deletePersona(id));
      dispatch(fetchPersonaStats());
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 mt-1">
            {t('subtitle')}
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setIsBatchModalOpen(true)}>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {t('quickGenerate')}
          </Button>
          <Button variant="secondary" onClick={() => setIsCustomModalOpen(true)}>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            {t('createButton')}
          </Button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center">
            <p className="text-3xl font-bold text-primary-600">{stats.total}</p>
            <p className="text-sm text-gray-500">{t('stats.total')}</p>
          </Card>
          {Object.entries(stats.byAgeGroup)
            .filter(([, count]) => count > 0)
            .slice(0, 3)
            .map(([ageGroup, count]) => (
              <Card key={ageGroup} className="text-center">
                <p className="text-3xl font-bold text-gray-700">{count}</p>
                <p className="text-sm text-gray-500">{t(`form.ageGroup.options.${ageGroup}`, { defaultValue: ageGroup })}</p>
              </Card>
            ))}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      ) : personas.length === 0 ? (
        <Card className="text-center py-12">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('empty.title')}</h3>
          <p className="text-gray-500 mb-4">
            {t('empty.description')}
          </p>
          <div className="flex justify-center gap-3">
            <Button onClick={() => setIsBatchModalOpen(true)}>
              {t('quickGenerate')}
            </Button>
            <Button variant="secondary" onClick={() => setIsCustomModalOpen(true)}>
              {t('empty.createButton')}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {personas.map((persona) => (
            <PersonaCard key={persona.id} persona={persona} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <Modal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        title={t('batchForm.title')}
      >
        <PersonaBatchCreateForm
          onSubmit={handleGenerate}
          isLoading={isCreating}
        />
      </Modal>

      <Modal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        title={t('form.title')}
        size="lg"
      >
        <PersonaCreateForm onSubmit={handleCreate} isLoading={isCreating} />
      </Modal>
    </div>
  );
};
