import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../hooks/useAppDispatch';
import {
  fetchPersonas,
  createPersona,
  deletePersona,
  fetchPersonaStats,
} from '../store/personaSlice';
import type { RootState } from '../store';
import type { CreatePersonaDto } from '../types';
import { Card, Button, Modal } from '../components/common';
import { PersonaCard, PersonaCreateForm } from '../components/persona';

export const PersonasPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { personas, stats, isLoading } = useSelector((state: RootState) => state.persona);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    dispatch(fetchPersonas());
    dispatch(fetchPersonaStats());
  }, [dispatch]);

  const handleCreate = async (data: CreatePersonaDto) => {
    setIsCreating(true);
    try {
      await dispatch(createPersona(data)).unwrap();
      setIsModalOpen(false);
      dispatch(fetchPersonaStats());
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this persona?')) {
      await dispatch(deletePersona(id));
      dispatch(fetchPersonaStats());
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Personas</h1>
          <p className="text-gray-600 mt-1">
            Manage your AI feedback personas
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Persona
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center">
            <p className="text-3xl font-bold text-primary-600">{stats.total}</p>
            <p className="text-sm text-gray-500">Total Personas</p>
          </Card>
          {Object.entries(stats.byAgeGroup)
            .filter(([, count]) => count > 0)
            .slice(0, 3)
            .map(([ageGroup, count]) => (
              <Card key={ageGroup} className="text-center">
                <p className="text-3xl font-bold text-gray-700">{count}</p>
                <p className="text-sm text-gray-500">{ageGroup}</p>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">No personas yet</h3>
          <p className="text-gray-500 mb-4">
            Create your first persona to start getting AI-powered feedback.
          </p>
          <Button onClick={() => setIsModalOpen(true)}>Create Your First Persona</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {personas.map((persona) => (
            <PersonaCard key={persona.id} persona={persona} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Persona"
        size="lg"
      >
        <PersonaCreateForm onSubmit={handleCreate} isLoading={isCreating} />
      </Modal>
    </div>
  );
};
