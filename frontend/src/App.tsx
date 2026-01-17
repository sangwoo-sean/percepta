import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { fetchCurrentUser, logout } from './store/authSlice';
import { Layout } from './components/layout';
import { LoginPage } from './pages/LoginPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { DashboardPage } from './pages/DashboardPage';
import { PersonasPage } from './pages/PersonasPage';
import { NewFeedbackPage } from './pages/NewFeedbackPage';
import { FeedbackResultPage } from './pages/FeedbackResultPage';
import { FeedbackHistoryPage } from './pages/FeedbackHistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { PricingPage } from './pages/PricingPage';

const AppContent: React.FC = () => {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      store.dispatch(fetchCurrentUser());
    } else {
      store.dispatch(logout());
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/personas" element={<PersonasPage />} />
          <Route path="/feedback/new" element={<NewFeedbackPage />} />
          <Route path="/feedback/history" element={<FeedbackHistoryPage />} />
          <Route path="/feedback/:id" element={<FeedbackResultPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;
