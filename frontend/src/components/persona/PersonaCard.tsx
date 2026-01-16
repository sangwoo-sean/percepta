import React from 'react';
import type { Persona } from '../../types';
import { Card, Button } from '../common';

interface PersonaCardProps {
  persona: Persona;
  onDelete?: (id: string) => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
}

export const PersonaCard: React.FC<PersonaCardProps> = ({
  persona,
  onDelete,
  selectable,
  selected,
  onSelect,
}) => {
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

      <div className="flex items-start gap-4">
        {persona.avatarUrl ? (
          <img
            src={persona.avatarUrl}
            alt={persona.name}
            className="w-16 h-16 rounded-full"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-xl font-bold text-primary-600">{persona.name[0]}</span>
          </div>
        )}

        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{persona.name}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {persona.ageGroup} | {persona.occupation}
          </p>

          {persona.personalityTraits.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {persona.personalityTraits.slice(0, 3).map((trait, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                >
                  {trait}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {onDelete && !selectable && (
        <div className="mt-4 flex justify-end">
          <Button
            variant="danger"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(persona.id);
            }}
          >
            Delete
          </Button>
        </div>
      )}
    </Card>
  );
};
