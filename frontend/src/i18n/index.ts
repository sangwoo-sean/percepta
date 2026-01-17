import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import koCommon from '../locales/ko/common.json';
import koAuth from '../locales/ko/auth.json';
import koDashboard from '../locales/ko/dashboard.json';
import koPersona from '../locales/ko/persona.json';
import koFeedback from '../locales/ko/feedback.json';

import enCommon from '../locales/en/common.json';
import enAuth from '../locales/en/auth.json';
import enDashboard from '../locales/en/dashboard.json';
import enPersona from '../locales/en/persona.json';
import enFeedback from '../locales/en/feedback.json';

const resources = {
  ko: {
    common: koCommon,
    auth: koAuth,
    dashboard: koDashboard,
    persona: koPersona,
    feedback: koFeedback,
  },
  en: {
    common: enCommon,
    auth: enAuth,
    dashboard: enDashboard,
    persona: enPersona,
    feedback: enFeedback,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ko',
    defaultNS: 'common',
    ns: ['common', 'auth', 'dashboard', 'persona', 'feedback'],
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
