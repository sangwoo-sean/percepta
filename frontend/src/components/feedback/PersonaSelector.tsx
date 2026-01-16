import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { fetchPersonas } from '../../store/personaSlice';
import type { RootState } from '../../store';
import { PersonaCard } from '../persona/PersonaCard';
import { Button } from '../common';

interface PersonaSelectorProps {
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onConfirm: () => void;
  creditsPerPersona?: number;
}

export const PersonaSelector: React.FC<PersonaSelectorProps> = ({
  selectedIds,
  onSelectionChange,
  onConfirm,
  creditsPerPersona = 1,
}) => {
  const dispatch = useAppDispatch();
  const { personas, isLoading } = useSelector((state: RootState) => state.persona);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(fetchPersonas());
  }, [dispatch]);

  const handleToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === personas.length) {
      onSelectionChange([]);
    } else {
      const maxSelect = Math.floor((user?.credits || 0) / creditsPerPersona);
      onSelectionChange(personas.slice(0, maxSelect).map((p) => p.id));
    }
  };

  const totalCredits = selectedIds.length * creditsPerPersona;
  const hasEnoughCredits = (user?.credits || 0) >= totalCredits;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (personas.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">
          You don't have any personas yet. Create some personas first to get feedback.
        </p>
        <Button onClick={() => (window.location.href = '/personas')}>
          Create Personas
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Select Personas</h3>
          <p className="text-sm text-gray-500">
            Choose which personas should review your content
          </p>
        </div>
        <button
          onClick={handleSelectAll}
          className="text-sm text-primary-600 hover:text-primary-700"
        >
          {selectedIds.length === personas.length ? 'Deselect all' : 'Select all'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {personas.map((persona) => (
          <PersonaCard
            key={persona.id}
            persona={persona}
            selectable
            selected={selectedIds.includes(persona.id)}
            onSelect={handleToggle}
          />
        ))}
      </div>

      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
        <div>
          <p className="font-medium text-gray-900">
            {selectedIds.length} persona{selectedIds.length !== 1 ? 's' : ''} selected
          </p>
          <p className="text-sm text-gray-500">
            Cost: {totalCredits} credit{totalCredits !== 1 ? 's' : ''} | You have: {user?.credits || 0} credits
          </p>
        </div>
        <Button
          onClick={onConfirm}
          disabled={selectedIds.length === 0 || !hasEnoughCredits}
        >
          {!hasEnoughCredits ? 'Insufficient Credits' : 'Continue'}
        </Button>
      </div>
    </div>
  );
};
