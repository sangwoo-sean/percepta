import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import personaReducer from './personaSlice';
import feedbackReducer from './feedbackSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    persona: personaReducer,
    feedback: feedbackReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
