import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { usePersonaFilter } from '../hooks/usePersonaFilter';
import {
  fetchPersonas,
  createPersona,
  generatePersonas,
  deletePersona,
  updatePersona,
  fetchPersonaStats,
} from '../store/personaSlice';
import type { RootState } from '../store';
import type { CreatePersonaDto, UpdatePersonaDto, GeneratePersonasDto, Persona } from '../types';
import { Card, Button, Modal, PersonaFilter } from '../components/common';
import {
  PersonaCard,
  PersonaForm,
  PersonaBatchCreateForm,
  PersonaStatsCharts,
} from '../components/persona';

export const PersonasPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { personas, stats, isLoading } = useSelector((state: RootState) => state.persona);
  const {
    filter,
    setAgeGroups,
    setGenders,
    resetFilter,
    filteredPersonas,
    hasActiveFilter,
  } = usePersonaFilter(personas);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation('persona');

  useEffect(() => {
    dispatch(fetchPersonas());
    dispatch(fetchPersonaStats());
  }, [dispatch]);

  const handleCreate = async (data: CreatePersonaDto | UpdatePersonaDto) => {
    setIsCreating(true);
    setError(null);
    try {
      await dispatch(createPersona(data as CreatePersonaDto)).unwrap();
      setIsCustomModalOpen(false);
      dispatch(fetchPersonaStats());
    } catch {
      setIsCustomModalOpen(false);
      setError(t('error.create'));
    } finally {
      setIsCreating(false);
    }
  };

  const handleGenerate = async (dto: GeneratePersonasDto) => {
    setIsCreating(true);
    setError(null);
    try {
      await dispatch(generatePersonas(dto)).unwrap();
      setIsBatchModalOpen(false);
      dispatch(fetchPersonaStats());
    } catch {
      setIsBatchModalOpen(false);
      setError(t('error.generate'));
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

  const handleEdit = (persona: Persona) => {
    setEditingPersona(persona);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (data: CreatePersonaDto | UpdatePersonaDto) => {
    if (!editingPersona) return;

    setIsUpdating(true);
    setError(null);
    try {
      await dispatch(updatePersona({ id: editingPersona.id, dto: data as UpdatePersonaDto })).unwrap();
      setIsEditModalOpen(false);
      setEditingPersona(null);
    } catch {
      setIsEditModalOpen(false);
      setEditingPersona(null);
      setError(t('error.update'));
    } finally {
      setIsUpdating(false);
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

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {stats && <PersonaStatsCharts stats={stats} />}

      {personas.length > 0 && (
        <PersonaFilter
          filter={filter}
          onAgeGroupsChange={setAgeGroups}
          onGendersChange={setGenders}
          onReset={resetFilter}
          hasActiveFilter={hasActiveFilter}
        />
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
          {filteredPersonas.map((persona) => (
            <PersonaCard key={persona.id} persona={persona} onEdit={handleEdit} onDelete={handleDelete} />
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
        <PersonaForm mode="create" onSubmit={handleCreate} isLoading={isCreating} />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingPersona(null);
        }}
        title={t('form.editTitle')}
        size="lg"
      >
        {editingPersona && (
          <PersonaForm
            mode="edit"
            initialData={editingPersona}
            onSubmit={handleUpdate}
            onCancel={() => {
              setIsEditModalOpen(false);
              setEditingPersona(null);
            }}
            isLoading={isUpdating}
          />
        )}
      </Modal>
    </div>
  );
};
