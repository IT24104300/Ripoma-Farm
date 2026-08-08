import React from 'react';
import { Award, ShieldCheck, Sun, CheckCircle } from 'lucide-react';

const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-20">
      
      {/* 1. Page Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight">Our Story & Farming Ethics</h1>
        <p className="text-gray-500 text-lg leading-relaxed">
          RIPOMA Farm was founded on a simple belief: everyone deserves access to clean, organic, and ethically sourced farm foods.
        </p>
      </section>

      {/* 2. Brand Story / Pillars Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <span className="text-xs bg-farm-green-light text-farm-green font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider">
            Since 2012
          </span>
          <h2 className="text-3xl font-black text-gray-900 leading-tight">How It All Started</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Starting with a small flock of free-range chickens, RIPOMA Farm quickly earned a reputation for producing eggs with rich, deep-orange yolks. Over the years, we expanded into organic broiler chickens and built custom solar-drying domes to dry coastal fish in pristine, insect-free conditions.
          </p>
          <p className="text-gray-500 text-sm leading-relaxed">
            Today, RIPOMA represents a trusted name in farm e-commerce, linking traditional organic agriculture with modern hygienic standards.
          </p>
        </div>

        <div className="relative rounded-3xl overflow-hidden h-80">
          <img 
            src="https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=600" 
            alt="Farm Animals" 
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* 3. Farming Practices */}
      <section className="space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <h2 className="text-3xl font-black text-gray-900">Our Agricultural Standard</h2>
          <p className="text-gray-500">We implement strict quality parameters to guarantee healthy, safe harvests.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Practice 1 */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 space-y-4 shadow-sm">
            <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center font-bold">
              <Sun className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-950">Solar Dry Fish Domes</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              We never dry fish on open sands. Our marine catches are processed inside solar-drying domes, protecting them from dust, bugs, and humidity while retaining perfect salt and nutrition levels.
            </p>
          </div>

          {/* Practice 2 */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 space-y-4 shadow-sm">
            <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-2xl flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-950">Free Range Poultry</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Our hens and broiler chickens are raised in spacious, grass-covered fields. They feed on organic corn and grains without hormone injections or unnecessary antibiotics.
            </p>
          </div>

          {/* Practice 3 */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 space-y-4 shadow-sm">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-950">Strict Quality Grading</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Every single egg is gathered, inspected, and categorized into Grade A or Grade B under sanitary guidelines. Only spotless, high-grade eggs make it to our storefront boxes.
            </p>
          </div>

        </div>
      </section>

      {/* 4. Certifications */}
      <section className="bg-farm-green text-white p-8 sm:p-12 rounded-3xl grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black mb-4">Certified for Safety and Purity</h2>
          <p className="text-emerald-100 text-sm leading-relaxed">
            We are fully registered with national agriculture councils and comply with international food processing guidelines. Every purchase is backed by our purity guarantee.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 border border-white/10 rounded-2xl p-4 text-center">
            <CheckCircle className="w-6 h-6 text-farm-gold mx-auto mb-2" />
            <h4 className="font-bold text-sm">FDA Registered</h4>
            <span className="text-[10px] text-gray-300">Food Safety Compliant</span>
          </div>
          <div className="bg-white/10 border border-white/10 rounded-2xl p-4 text-center">
            <CheckCircle className="w-6 h-6 text-farm-gold mx-auto mb-2" />
            <h4 className="font-bold text-sm">100% Organic</h4>
            <span className="text-[10px] text-gray-300">Certified Crops & Poultry</span>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;
