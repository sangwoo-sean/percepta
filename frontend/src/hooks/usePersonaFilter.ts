import { useState, useMemo, useCallback } from 'react';
import type { Persona, AgeGroup, Gender, PersonaFilterState } from '../types';

interface UsePersonaFilterReturn {
  filter: PersonaFilterState;
  setAgeGroups: (ageGroups: AgeGroup[]) => void;
  setGenders: (genders: Gender[]) => void;
  resetFilter: () => void;
  filteredPersonas: Persona[];
  hasActiveFilter: boolean;
}

const initialFilter: PersonaFilterState = {
  ageGroups: [],
  genders: [],
};

export const usePersonaFilter = (personas: Persona[]): UsePersonaFilterReturn => {
  const [filter, setFilter] = useState<PersonaFilterState>(initialFilter);

  const setAgeGroups = useCallback((ageGroups: AgeGroup[]) => {
    setFilter((prev) => ({ ...prev, ageGroups }));
  }, []);

  const setGenders = useCallback((genders: Gender[]) => {
    setFilter((prev) => ({ ...prev, genders }));
  }, []);

  const resetFilter = useCallback(() => {
    setFilter(initialFilter);
  }, []);

  const hasActiveFilter = filter.ageGroups.length > 0 || filter.genders.length > 0;

  const filteredPersonas = useMemo(() => {
    return personas.filter((persona) => {
      const ageGroupMatch =
        filter.ageGroups.length === 0 ||
        filter.ageGroups.includes(persona.data.ageGroup);

      const genderMatch =
        filter.genders.length === 0 ||
        !persona.data.gender ||
        filter.genders.includes(persona.data.gender);

      return ageGroupMatch && genderMatch;
    });
  }, [personas, filter]);

  return {
    filter,
    setAgeGroups,
    setGenders,
    resetFilter,
    filteredPersonas,
    hasActiveFilter,
  };
};
