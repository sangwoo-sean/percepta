export function PricingSection({ t, appUrl }) {
  return (
    <section id="pricing" className="py-20 bg-slate-950">
      <div className="max-w-6xl mx-auto px-6">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t.pricing.title}
          </h2>
          <p className="text-2xl text-violet-400 font-semibold">
            {t.pricing.subtitle}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {t.pricing.plans.map((plan, index) => (
            <div
              key={index}
              className={`relative p-6 rounded-2xl border transition-all duration-300 ${
                plan.popular
                  ? 'bg-gradient-to-b from-violet-900/50 to-slate-900 border-violet-500 scale-105 shadow-lg shadow-violet-500/20'
                  : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-violet-600 to-pink-600 rounded-full text-xs font-semibold text-white">
                  Popular
                </div>
              )}

              {/* Plan Name */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white mb-1">
                  {plan.name}
                </h3>
                <p className="text-slate-400 text-sm">
                  {plan.credits}
                </p>
              </div>

              {/* Price */}
              <div className="text-center mb-6">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
              </div>

              {/* Description */}
              <p className="text-slate-400 text-center text-sm mb-6">
                {plan.description}
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-2 text-slate-300 text-sm">
                    <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href={appUrl}
                className={`block w-full py-3 rounded-xl font-semibold text-center transition-all duration-300 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white'
                    : 'bg-slate-700 hover:bg-slate-600 text-white'
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        {/* Note */}
        <p className="text-center text-slate-400 text-sm mb-12">
          {t.pricing.note}
        </p>

        {/* Comparison */}
        <div className="max-w-md mx-auto">
          <h4 className="text-center text-white font-semibold mb-4">
            {t.pricing.comparison.title}
          </h4>
          <div className="space-y-2">
            {t.pricing.comparison.items.map((item, index) => (
              <div
                key={index}
                className={`flex justify-between items-center p-3 rounded-lg ${
                  item.highlight
                    ? 'bg-green-500/10 border border-green-500/30'
                    : 'bg-slate-800/50'
                }`}
              >
                <span className={item.highlight ? 'text-green-400 font-semibold' : 'text-slate-400'}>
                  {item.name}
                </span>
                <span className={item.highlight ? 'text-green-400 font-bold' : 'text-slate-500'}>
                  {item.price}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
