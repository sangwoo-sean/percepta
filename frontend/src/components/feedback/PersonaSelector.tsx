import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { usePersonaFilter } from '../../hooks/usePersonaFilter';
import { fetchPersonas } from '../../store/personaSlice';
import type { RootState } from '../../store';
import { PersonaCard } from '../persona/PersonaCard';
import { Button, PersonaFilter } from '../common';

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
  const {
    filter,
    setAgeGroups,
    setGenders,
    resetFilter,
    filteredPersonas,
    hasActiveFilter,
  } = usePersonaFilter(personas);

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

  const maxSelectByCredits = Math.floor((user?.credits || 0) / creditsPerPersona);
  const selectableCount = Math.min(maxSelectByCredits, filteredPersonas.length);

  const handleSelectAll = () => {
    const filteredSelectedIds = selectedIds.filter((id) =>
      filteredPersonas.some((p) => p.id === id)
    );
    if (filteredSelectedIds.length === selectableCount) {
      onSelectionChange(selectedIds.filter((id) => !filteredPersonas.some((p) => p.id === id)));
    } else {
      const newIds = filteredPersonas.slice(0, selectableCount).map((p) => p.id);
      const otherSelectedIds = selectedIds.filter((id) => !filteredPersonas.some((p) => p.id === id));
      onSelectionChange([...otherSelectedIds, ...newIds]);
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

  const filteredSelectedCount = selectedIds.filter((id) =>
    filteredPersonas.some((p) => p.id === id)
  ).length;

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
          {filteredSelectedCount === selectableCount
            ? t('selector.deselectAll')
            : selectableCount < filteredPersonas.length
              ? t('selector.selectAllLimited', { available: selectableCount, total: filteredPersonas.length })
              : t('selector.selectAll')}
        </button>
      </div>

      <PersonaFilter
        filter={filter}
        onAgeGroupsChange={setAgeGroups}
        onGendersChange={setGenders}
        onReset={resetFilter}
        hasActiveFilter={hasActiveFilter}
      />

      {filteredSelectedCount >= selectableCount && selectableCount < filteredPersonas.length && (
        <div className="bg-amber-50 text-amber-700 px-4 py-2 rounded-lg text-sm">
          {t('selector.creditLimitWarning', { count: user?.credits || 0 })}
        </div>
      )}

      <div className="flex flex-col gap-4">
        {filteredPersonas.map((persona) => (
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
