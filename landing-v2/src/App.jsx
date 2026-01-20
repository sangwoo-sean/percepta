import { getTranslation } from './i18n/translations';
import {
  HeroSection,
  SocialProofSection,
  ProblemSection,
  DemoSection,
  HowItWorksSection,
  PricingSection,
  CTASection,
  Footer,
  LanguageToggle,
} from './components';

const APP_URL = 'https://perceptaai.vercel.app/';

export function App({ locale = 'en' }) {
  const t = getTranslation(locale);

  return (
    <div className="bg-slate-900 min-h-screen">
      {/* Language Toggle */}
      <LanguageToggle locale={locale} t={t} />

      {/* Hero */}
      <HeroSection t={t} appUrl={APP_URL} />

      {/* Social Proof */}
      <SocialProofSection t={t} />

      {/* Problem */}
      <ProblemSection t={t} />

      {/* Demo */}
      <DemoSection t={t} locale={locale} />

      {/* How It Works */}
      <HowItWorksSection t={t} />

      {/* Pricing */}
      <PricingSection t={t} appUrl={APP_URL} />

      {/* CTA */}
      <CTASection t={t} appUrl={APP_URL} />

      {/* Footer */}
      <Footer t={t} />
    </div>
  );
}
