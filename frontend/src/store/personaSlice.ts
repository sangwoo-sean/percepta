import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Persona, CreatePersonaDto, GeneratePersonasDto, PersonaStats } from '../types';
import { personasApi } from '../api/personas';

interface PersonaState {
  personas: Persona[];
  stats: PersonaStats | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: PersonaState = {
  personas: [],
  stats: null,
  isLoading: false,
  error: null,
};

export const fetchPersonas = createAsyncThunk(
  'persona/fetchPersonas',
  async (_, { rejectWithValue }) => {
    try {
      return await personasApi.getAll();
    } catch (error) {
      return rejectWithValue('Failed to fetch personas');
    }
  }
);

export const createPersona = createAsyncThunk(
  'persona/createPersona',
  async (dto: CreatePersonaDto, { rejectWithValue }) => {
    try {
      return await personasApi.create(dto);
    } catch (error) {
      return rejectWithValue('Failed to create persona');
    }
  }
);

export const batchCreatePersonas = createAsyncThunk(
  'persona/batchCreatePersonas',
  async (personas: CreatePersonaDto[], { rejectWithValue }) => {
    try {
      return await personasApi.batchCreate(personas);
    } catch (error) {
      return rejectWithValue('Failed to create personas');
    }
  }
);

export const generatePersonas = createAsyncThunk(
  'persona/generatePersonas',
  async (dto: GeneratePersonasDto, { rejectWithValue }) => {
    try {
      return await personasApi.generate(dto);
    } catch (error) {
      return rejectWithValue('Failed to generate personas');
    }
  }
);

export const deletePersona = createAsyncThunk(
  'persona/deletePersona',
  async (id: string, { rejectWithValue }) => {
    try {
      await personasApi.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue('Failed to delete persona');
    }
  }
);

export const fetchPersonaStats = createAsyncThunk(
  'persona/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      return await personasApi.getStats();
    } catch (error) {
      return rejectWithValue('Failed to fetch stats');
    }
  }
);

const personaSlice = createSlice({
  name: 'persona',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPersonas.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPersonas.fulfilled, (state, action) => {
        state.isLoading = false;
        state.personas = action.payload;
      })
      .addCase(fetchPersonas.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createPersona.fulfilled, (state, action) => {
        state.personas.unshift(action.payload);
      })
      .addCase(batchCreatePersonas.fulfilled, (state, action) => {
        state.personas = [...action.payload, ...state.personas];
      })
      .addCase(generatePersonas.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generatePersonas.fulfilled, (state, action) => {
        state.isLoading = false;
        state.personas = [...action.payload, ...state.personas];
      })
      .addCase(generatePersonas.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(deletePersona.fulfilled, (state, action) => {
        state.personas = state.personas.filter((p) => p.id !== action.payload);
      })
      .addCase(fetchPersonaStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { clearError } = personaSlice.actions;
export default personaSlice.reducer;
