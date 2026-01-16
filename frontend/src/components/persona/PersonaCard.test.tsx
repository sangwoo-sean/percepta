import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PersonaCard } from './PersonaCard';
import type { Persona } from '../../types';

describe('PersonaCard', () => {
  const mockPersona: Persona = {
    id: 'persona-uuid',
    userId: 'user-uuid',
    name: 'Test Persona',
    avatarUrl: 'https://example.com/avatar.jpg',
    ageGroup: '20s',
    occupation: 'Developer',
    personalityTraits: ['Analytical', 'Creative', 'Tech-savvy'],
    description: 'Test description',
    createdAt: '2024-01-01T00:00:00.000Z',
  };

  it('renders persona name correctly', () => {
    render(<PersonaCard persona={mockPersona} />);
    expect(screen.getByText('Test Persona')).toBeInTheDocument();
  });

  it('renders age group and occupation', () => {
    render(<PersonaCard persona={mockPersona} />);
    expect(screen.getByText('20s | Developer')).toBeInTheDocument();
  });

  it('renders personality traits', () => {
    render(<PersonaCard persona={mockPersona} />);
    expect(screen.getByText('Analytical')).toBeInTheDocument();
    expect(screen.getByText('Creative')).toBeInTheDocument();
    expect(screen.getByText('Tech-savvy')).toBeInTheDocument();
  });

  it('renders avatar image when avatarUrl is provided', () => {
    render(<PersonaCard persona={mockPersona} />);
    const img = screen.getByAltText('Test Persona');
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('renders fallback avatar when no avatarUrl', () => {
    const personaWithoutAvatar = { ...mockPersona, avatarUrl: null };
    render(<PersonaCard persona={personaWithoutAvatar} />);
    expect(screen.getByText('T')).toBeInTheDocument(); // First letter of name
  });

  it('calls onDelete when delete button is clicked', () => {
    const handleDelete = vi.fn();
    render(<PersonaCard persona={mockPersona} onDelete={handleDelete} />);

    fireEvent.click(screen.getByText('Delete'));
    expect(handleDelete).toHaveBeenCalledWith('persona-uuid');
  });

  it('does not render delete button when selectable', () => {
    const handleDelete = vi.fn();
    render(
      <PersonaCard
        persona={mockPersona}
        onDelete={handleDelete}
        selectable
        selected={false}
        onSelect={() => {}}
      />
    );

    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('shows selected state when selected', () => {
    render(
      <PersonaCard
        persona={mockPersona}
        selectable
        selected={true}
        onSelect={() => {}}
      />
    );

    // Check for selected ring style
    const card = screen.getByText('Test Persona').closest('.card, [class*="ring-2"]');
    expect(card).toBeTruthy();
  });

  it('calls onSelect when clicked in selectable mode', () => {
    const handleSelect = vi.fn();
    render(
      <PersonaCard
        persona={mockPersona}
        selectable
        selected={false}
        onSelect={handleSelect}
      />
    );

    fireEvent.click(screen.getByText('Test Persona'));
    expect(handleSelect).toHaveBeenCalledWith('persona-uuid');
  });
});
