import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { CreditTransaction } from '../types';
import { creditsApi } from '../api/credits';

interface CreditsState {
  transactions: CreditTransaction[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CreditsState = {
  transactions: [],
  isLoading: false,
  error: null,
};

export const fetchCreditTransactions = createAsyncThunk(
  'credits/fetchTransactions',
  async (_, { rejectWithValue }) => {
    try {
      return await creditsApi.getTransactions();
    } catch (error) {
      return rejectWithValue('Failed to fetch credit transactions');
    }
  }
);

const creditsSlice = createSlice({
  name: 'credits',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCreditTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCreditTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchCreditTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = creditsSlice.actions;
export default creditsSlice.reducer;
