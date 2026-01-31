import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import koCommon from '../locales/ko/common.json';
import koAuth from '../locales/ko/auth.json';
import koDashboard from '../locales/ko/dashboard.json';
import koPersona from '../locales/ko/persona.json';
import koFeedback from '../locales/ko/feedback.json';
import koPricing from '../locales/ko/pricing.json';
import koGuide from '../locales/ko/guide.json';
import koCredits from '../locales/ko/credits.json';
import koPayment from '../locales/ko/payment.json';

import enCommon from '../locales/en/common.json';
import enAuth from '../locales/en/auth.json';
import enDashboard from '../locales/en/dashboard.json';
import enPersona from '../locales/en/persona.json';
import enFeedback from '../locales/en/feedback.json';
import enPricing from '../locales/en/pricing.json';
import enGuide from '../locales/en/guide.json';
import enCredits from '../locales/en/credits.json';
import enPayment from '../locales/en/payment.json';

const resources = {
  ko: {
    common: koCommon,
    auth: koAuth,
    dashboard: koDashboard,
    persona: koPersona,
    feedback: koFeedback,
    pricing: koPricing,
    guide: koGuide,
    credits: koCredits,
    payment: koPayment,
  },
  en: {
    common: enCommon,
    auth: enAuth,
    dashboard: enDashboard,
    persona: enPersona,
    feedback: enFeedback,
    pricing: enPricing,
    guide: enGuide,
    credits: enCredits,
    payment: enPayment,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ko',
    defaultNS: 'common',
    ns: ['common', 'auth', 'dashboard', 'persona', 'feedback', 'pricing', 'guide', 'credits', 'payment'],
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export type SupportedLocale = 'ko' | 'en';

export function getCurrentLocale(): SupportedLocale {
  return i18n.language === 'en' ? 'en' : 'ko';
}

export default i18n;
