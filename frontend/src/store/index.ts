import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import personaReducer from './personaSlice';
import feedbackReducer from './feedbackSlice';
import creditsReducer from './creditsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    persona: personaReducer,
    feedback: feedbackReducer,
    credits: creditsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
