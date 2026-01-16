import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { FeedbackSession, CreateSessionDto } from '../types';
import { feedbackApi } from '../api/feedback';

interface FeedbackState {
  sessions: FeedbackSession[];
  currentSession: FeedbackSession | null;
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;
}

const initialState: FeedbackState = {
  sessions: [],
  currentSession: null,
  isLoading: false,
  isGenerating: false,
  error: null,
};

export const fetchSessions = createAsyncThunk(
  'feedback/fetchSessions',
  async (_, { rejectWithValue }) => {
    try {
      return await feedbackApi.getSessions();
    } catch (error) {
      return rejectWithValue('Failed to fetch sessions');
    }
  }
);

export const fetchSession = createAsyncThunk(
  'feedback/fetchSession',
  async (id: string, { rejectWithValue }) => {
    try {
      return await feedbackApi.getSession(id);
    } catch (error) {
      return rejectWithValue('Failed to fetch session');
    }
  }
);

export const createSession = createAsyncThunk(
  'feedback/createSession',
  async (dto: CreateSessionDto, { rejectWithValue }) => {
    try {
      return await feedbackApi.createSession(dto);
    } catch (error) {
      return rejectWithValue('Failed to create session');
    }
  }
);

export const generateFeedback = createAsyncThunk(
  'feedback/generateFeedback',
  async (
    { sessionId, personaIds }: { sessionId: string; personaIds?: string[] },
    { rejectWithValue }
  ) => {
    try {
      const results = await feedbackApi.generateFeedback(sessionId, personaIds);
      return { sessionId, results };
    } catch (error) {
      return rejectWithValue('Failed to generate feedback');
    }
  }
);

export const fetchSummary = createAsyncThunk(
  'feedback/fetchSummary',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const { summary } = await feedbackApi.getSummary(sessionId);
      return { sessionId, summary };
    } catch (error) {
      return rejectWithValue('Failed to fetch summary');
    }
  }
);

const feedbackSlice = createSlice({
  name: 'feedback',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentSession: (state) => {
      state.currentSession = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSessions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sessions = action.payload;
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchSession.fulfilled, (state, action) => {
        state.currentSession = action.payload;
      })
      .addCase(createSession.fulfilled, (state, action) => {
        state.sessions.unshift(action.payload);
        state.currentSession = action.payload;
      })
      .addCase(generateFeedback.pending, (state) => {
        state.isGenerating = true;
      })
      .addCase(generateFeedback.fulfilled, (state, action) => {
        state.isGenerating = false;
        if (state.currentSession?.id === action.payload.sessionId) {
          state.currentSession.results = action.payload.results;
          state.currentSession.status = 'completed';
        }
      })
      .addCase(generateFeedback.rejected, (state, action) => {
        state.isGenerating = false;
        state.error = action.payload as string;
      })
      .addCase(fetchSummary.fulfilled, (state, action) => {
        if (state.currentSession?.id === action.payload.sessionId) {
          state.currentSession.summary = action.payload.summary;
        }
      });
  },
});

export const { clearError, clearCurrentSession } = feedbackSlice.actions;
export default feedbackSlice.reducer;
