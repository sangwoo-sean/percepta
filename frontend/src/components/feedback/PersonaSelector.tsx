import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('feedback');

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
          {t('selector.empty.message')}
        </p>
        <Button onClick={() => (window.location.href = '/personas')}>
          {t('selector.empty.createButton')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{t('selector.title')}</h3>
          <p className="text-sm text-gray-500">
            {t('selector.subtitle')}
          </p>
        </div>
        <button
          onClick={handleSelectAll}
          className="text-sm text-primary-600 hover:text-primary-700"
        >
          {selectedIds.length === personas.length ? t('selector.deselectAll') : t('selector.selectAll')}
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
            {selectedIds.length === 1
              ? t('selector.selected', { count: selectedIds.length })
              : t('selector.selectedPlural', { count: selectedIds.length })}
          </p>
          <p className="text-sm text-gray-500">
            {totalCredits === 1
              ? t('selector.cost', { count: totalCredits })
              : t('selector.costPlural', { count: totalCredits })} | {t('selector.available', { count: user?.credits || 0 })}
          </p>
        </div>
        <Button
          onClick={onConfirm}
          disabled={selectedIds.length === 0 || !hasEnoughCredits}
        >
          {!hasEnoughCredits ? t('selector.insufficientCredits') : t('selector.continue')}
        </Button>
      </div>
    </div>
  );
};
