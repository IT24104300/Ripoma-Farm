import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import { 
  WaveIcon, HenIcon, FishingNetIcon, FeatherIcon, 
  SunFieldIcon, BasketIcon, CrateIcon, QRTraceIcon, WaxSealBadge 
} from '../components/FarmIcons';
import { ArrowRight, Star, AlertTriangle } from 'lucide-react';
import { NotificationContext } from '../context/NotificationContext';

import RipomaLogo from '../components/RipomaLogo';

const Home = () => {
  const { showToast } = useContext(NotificationContext);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newsEmail, setNewsEmail] = useState('');
  const [newsError, setNewsError] = useState('');
  const [subscribedEmails, setSubscribedEmails] = useState(['newsletter@ripomafarm.com', 'admin@ripomafarm.com']);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get('/api/products');
        // Show first 4 products
        setFeaturedProducts(data.slice(0, 4));
      } catch (err) {
        console.error('Error fetching featured products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-[#F6EFE3] flex flex-col items-center justify-center gap-4">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: [0.7, 1.1, 1], opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <RipomaLogo variant="icon" color="color" height={72} className="animate-pulse" />
        </motion.div>
        <span className="text-[10px] uppercase tracking-widest text-[#2F4B3C] font-bold">
          RIPOMA Farm — Freshness Gate
        </span>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#F6EFE3] overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[92vh] flex items-center bg-[#2F4B3C] text-white py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background texture & image */}
        <div className="absolute inset-0 z-0 opacity-15 mix-blend-overlay">
          <img 
            src="https://images.unsplash.com/photo-1548550022-cbf418b711d9?auto=format&fit=crop&w=1600&q=80" 
            alt="Sunrise over farm fields" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-texture-linen opacity-10 z-0 pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div 
            className="lg:col-span-7 space-y-8 text-left"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 border border-white/20 px-3.5 py-1 rounded-full bg-white/5 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#2F4B3C] animate-pulse"></span>
              <span className="text-xs uppercase tracking-widest text-[#F6EFE3]">Fresh from coop & coast today</span>
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp} 
              className="text-4xl sm:text-6xl font-serif text-white tracking-tight leading-[1.1] max-w-2xl font-semibold"
            >
              Farm Fresh Products Delivered With Quality <span className="text-[#2F4B3C] italic font-normal">You Can Trust</span>
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp} 
              className="text-base sm:text-lg text-[#F6EFE3]/80 max-w-xl font-light leading-relaxed font-sans"
            >
              Today's catch, this morning's eggs, pasture-raised chicken — packed fresh, delivered honest. Gathered with care, shipped straight to your doorstep.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-wrap gap-4 pt-2">
              <Link 
                to="/catalog" 
                className="bg-[#A65D3D] hover:bg-[#A65D3D]/90 text-white font-medium px-8 py-3.5 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2 tracking-wide font-sans text-sm"
              >
                Shop Products <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                to="/about" 
                className="bg-transparent hover:bg-white/5 border border-white/30 text-white font-medium px-8 py-3.5 rounded-lg transition-all tracking-wide font-sans text-sm"
              >
                Learn Our Process
              </Link>
            </motion.div>
          </motion.div>

          {/* Hero Featured Visual */}
          <motion.div 
            className="lg:col-span-5 relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 aspect-[4/5] max-w-sm mx-auto lg:max-w-none">
              <img 
                src="https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=800&q=80" 
                alt="Farmer holding fresh egg basket in morning light" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2F4B3C]/70 via-transparent to-transparent"></div>
              
              {/* Floating Wax Badge */}
              <div className="absolute bottom-6 right-6">
                <WaxSealBadge text="HAND PICKED" className="w-20 h-20" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. OUR FARM STORY STRIP */}
      <section className="bg-texture-linen py-20 px-4 sm:px-6 lg:px-8 border-b border-[#8A6A4B]/10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-5">
            <div className="rounded-2xl overflow-hidden border border-[#8A6A4B]/10 shadow-lg aspect-square">
              <img 
                src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=700&q=80" 
                alt="Poultry grazing on green pastures" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="md:col-span-7 space-y-6 text-left">
            <span className="text-xs uppercase tracking-widest text-[#A65D3D] font-bold">Rooted in Sourcing</span>
            <h2 className="text-3xl font-serif text-[#2F4B3C] font-semibold leading-tight">Gathered from the Coast, Soil, and Open Grasslands</h2>
            <p className="text-[#8A6A4B] font-sans font-light leading-relaxed text-sm">
              We wake up when the mist is still hanging over the coops. We pull nets from the salt-sprayed tides at dawn, and collect warm eggs from pasture-raised hens before the sun hits the fields. No shortcuts, no artificial enhancers. Just food raised with soil, wind, and honest hands.
            </p>
            <Link to="/about" className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-bold text-[#2F4B3C] hover:text-[#A65D3D] transition-colors">
              Meet the Farmers <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. PRODUCT CATEGORIES SECTION */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <span className="text-xs uppercase tracking-widest text-[#A65D3D] font-bold">Harvest Categories</span>
            <h2 className="text-3xl sm:text-4xl font-serif text-[#2F4B3C] font-semibold">Honest Sourcing, Distinct Identities</h2>
            <p className="text-gray-500 font-light text-sm">Every category carries its own rhythm—matured by sea air, sun warmth, or lush pasture greens.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Dry Fish Card */}
            <Link to="/catalog?category=Dry Fish" className="group block space-y-4 text-left">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-gray-100 shadow-md transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=600&q=80" 
                  alt="Sun drying anchovies" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-[#3E6B6B]/10 mix-blend-multiply group-hover:opacity-0 transition-opacity"></div>
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3.5 py-1 rounded-full border border-gray-200">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#3E6B6B]">Slate Blue Tone</span>
                </div>
              </div>
              <div className="px-1 space-y-1">
                <div className="flex items-center gap-2">
                  <WaveIcon className="w-5 h-5 text-[#3E6B6B]" />
                  <h3 className="text-lg font-bold text-gray-900 font-sans">Premium Dry Fish</h3>
                </div>
                <p className="text-xs text-gray-500 font-light">Coastal air-cured, dried 3 days under solar protection. Rich, clean flavor.</p>
                <span className="inline-block text-xs font-bold text-[#3E6B6B] pt-1">Explore Sourcing &rarr;</span>
              </div>
            </Link>

            {/* Eggs Card */}
            <Link to="/catalog?category=Eggs" className="group block space-y-4 text-left">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-gray-100 shadow-md transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=600&q=80" 
                  alt="Brown farm eggs in nest" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-[#C99A3A]/10 mix-blend-multiply group-hover:opacity-0 transition-opacity"></div>
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3.5 py-1 rounded-full border border-gray-200">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#A65D3D]">Warm Straw Gold</span>
                </div>
              </div>
              <div className="px-1 space-y-1">
                <div className="flex items-center gap-2">
                  <HenIcon className="w-5 h-5 text-[#A65D3D]" />
                  <h3 className="text-lg font-bold text-gray-900 font-sans">Farm Eggs</h3>
                </div>
                <p className="text-xs text-gray-500 font-light">Free-range, grain-fed brown eggs collected every morning before daylight.</p>
                <span className="inline-block text-xs font-bold text-[#A65D3D] pt-1">Explore Sourcing &rarr;</span>
              </div>
            </Link>

            {/* Chicken Card */}
            <Link to="/catalog?category=Chicken" className="group block space-y-4 text-left">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-gray-100 shadow-md transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=600&q=80" 
                  alt="Raw organic chicken breast cuts" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-[#2F4B3C]/10 mix-blend-multiply group-hover:opacity-0 transition-opacity"></div>
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3.5 py-1 rounded-full border border-gray-200">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#2F4B3C]">Pasture Sage</span>
                </div>
              </div>
              <div className="px-1 space-y-1">
                <div className="flex items-center gap-2">
                  <FeatherIcon className="w-5 h-5 text-[#2F4B3C]" />
                  <h3 className="text-lg font-bold text-gray-900 font-sans">Organic Chicken</h3>
                </div>
                <p className="text-xs text-gray-500 font-light">Succulent dressed broiler cuts and whole options. Corn-fed, hormone-free.</p>
                <span className="inline-block text-xs font-bold text-[#2F4B3C] pt-1">Explore Sourcing &rarr;</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE US (WHITE SPACE & WHITESPACE-ORIENTED CARDS) */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-texture-kraft border-t border-b border-[#8A6A4B]/10">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <span className="text-xs uppercase tracking-widest text-[#A65D3D] font-bold font-sans">Quality Foundations</span>
            <h2 className="text-3xl font-serif text-[#2F4B3C] font-semibold">Grown Honest, Delivered Whole</h2>
            <p className="text-[#8A6A4B]/70 font-light text-sm font-sans">Minimalism rooted in soil. Four core values guiding every package we send.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Card 1: Farm Fresh */}
            <div className="bg-white border border-[#8A6A4B]/10 rounded-2xl p-8 space-y-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#F6EFE3] rounded-xl flex items-center justify-center text-[#2F4B3C]">
                <FeatherIcon className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-[#2F4B3C] font-sans">Farm Fresh Quality</h3>
                <p className="text-xs text-[#8A6A4B]/80 font-light leading-relaxed">
                  Harvested at sunrise, packaged at noon, dispatched by night. You taste freshness, not refrigeration storage.
                </p>
              </div>
            </div>

            {/* Card 2: Sustainable */}
            <div className="bg-white border border-[#8A6A4B]/10 rounded-2xl p-8 space-y-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#F6EFE3] rounded-xl flex items-center justify-center text-[#2F4B3C]">
                <SunFieldIcon className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-[#2F4B3C] font-sans">Sustainable Rearing</h3>
                <p className="text-xs text-[#8A6A4B]/80 font-light leading-relaxed">
                  Small-boat coastal fish nets, humane free-range hen barns, and solar-cured clean drying domes.
                </p>
              </div>
            </div>

            {/* Card 3: Fast Delivery */}
            <div className="bg-white border border-[#8A6A4B]/10 rounded-2xl p-8 space-y-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#F6EFE3] rounded-xl flex items-center justify-center text-[#2F4B3C]">
                <CrateIcon className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-[#2F4B3C] font-sans">Direct Dispatch</h3>
                <p className="text-xs text-[#8A6A4B]/80 font-light leading-relaxed">
                  Temp-controlled boxes bypass third-party warehouses to deliver straight from coop doors to your doorstep.
                </p>
              </div>
            </div>

            {/* Card 4: Full Traceability */}
            <div className="bg-white border border-[#8A6A4B]/10 rounded-2xl p-8 space-y-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#F6EFE3] rounded-xl flex items-center justify-center text-[#2F4B3C]">
                <QRTraceIcon className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-[#2F4B3C] font-sans">Full Traceability</h3>
                <p className="text-xs text-[#8A6A4B]/80 font-light leading-relaxed">
                  Every package highlights its specific coop of origin, batch identification, and exact harvest date.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. FEATURED PRODUCTS SECTION */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-gray-100 pb-6 gap-4">
            <div className="text-left space-y-1.5">
              <span className="text-xs uppercase tracking-widest text-[#A65D3D] font-bold font-sans">Freshly Sourced Picks</span>
              <h2 className="text-3xl font-serif text-[#2F4B3C] font-semibold">This Morning's Harvest</h2>
            </div>
            <Link to="/catalog" className="text-[#2F4B3C] hover:text-[#A65D3D] font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 transition-colors">
              Browse Full Catalog <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="bg-[#F6EFE3]/50 rounded-2xl h-80 animate-pulse border border-[#8A6A4B]/5"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 6. SEASONAL / HARVEST HIGHLIGHT SECTION */}
      <section className="relative py-20 bg-[#2F4B3C] text-white overflow-hidden">
        {/* Background grain */}
        <div className="absolute inset-0 bg-texture-wood opacity-5 z-0 pointer-events-none"></div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="text-xs uppercase tracking-widest text-[#2F4B3C] font-bold font-sans">Seasonal Highlight</span>
          <h2 className="text-3xl sm:text-5xl font-serif max-w-3xl mx-auto font-medium">
            This Week's Harvest: Fresh Catch from the Morning Tide
          </h2>
          <p className="text-sm text-[#F6EFE3]/80 font-light max-w-xl mx-auto font-sans leading-relaxed">
            Our coastal fishermen harvested fresh, premium anchovies off the shore line this week. Cured immediately under our solar drying beds for clean flavor.
          </p>
          <div className="pt-2">
            <Link 
              to="/catalog?category=Dry Fish" 
              className="bg-[#A65D3D] hover:bg-[#A65D3D]/90 text-white font-medium px-8 py-3 rounded-lg text-xs uppercase tracking-widest font-sans inline-block transition-colors"
            >
              Shop This Week's Catch
            </Link>
          </div>
        </div>
      </section>

      {/* 7. SUSTAINABILITY & PRACTICES */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-texture-linen border-t border-b border-[#8A6A4B]/10 text-left">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-7 space-y-12">
            <div className="space-y-4">
              <span className="text-xs uppercase tracking-widest text-[#A65D3D] font-bold">Traceable Commitments</span>
              <h2 className="text-3xl font-serif text-[#2F4B3C] font-semibold">How We Respect the Land & Sea</h2>
              <p className="text-gray-500 font-light text-sm max-w-xl">
                We believe premium food starts with healthy soil and clean oceans. We commit to strict environmental and humane standards across our farming practices.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-2">
                <span className="text-sm font-bold text-[#2F4B3C] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A65D3D]"></span> Free-Range Humane Barns
                </span>
                <p className="text-xs text-[#8A6A4B] font-light leading-relaxed">
                  Our birds roam free with natural daylight, fresh water, and pasture grasses. No cages, no overcrowding.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-bold text-[#2F4B3C] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A65D3D]"></span> Coastal Artisanal Fishing
                </span>
                <p className="text-xs text-[#8A6A4B] font-light leading-relaxed">
                  Partnered with local fishermen using line catches and non-invasive nets that respect marine biodiversity.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-bold text-[#2F4B3C] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A65D3D]"></span> Compostable Kraft Packs
                </span>
                <p className="text-xs text-[#8A6A4B] font-light leading-relaxed">
                  Low-waste wrapping, kraft box shipments, and biodegradable liners to decrease downstream pollution.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-bold text-[#2F4B3C] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A65D3D]"></span> Zero Hormones or Short-cuts
                </span>
                <p className="text-xs text-[#8A6A4B] font-light leading-relaxed">
                  Only natural feeds and sun cures. No growth chemicals, water-weight injections, or preservatives.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-6">
            <WaxSealBadge text="ORGANIC CERTIFIED" className="w-36 h-36" />
            <div className="text-center">
              <span className="text-xs font-bold text-[#2F4B3C] block font-serif">Original Seal of Freshness</span>
              <span className="text-[10px] text-gray-400 block font-sans">Guaranteed direct farm dispatch</span>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CUSTOMER REVIEWS */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white text-left">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <span className="text-xs uppercase tracking-widest text-[#A65D3D] font-bold">Honest Feedbacks</span>
            <h2 className="text-3xl font-serif text-[#2F4B3C] font-semibold">Shared by Our Table</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Review 1 */}
            <div className="border border-gray-100 bg-[#F6EFE3]/30 rounded-2xl p-8 space-y-6 text-left">
              <div className="flex text-[#A65D3D]">
                {[1,2,3,4,5].map(x => <Star key={x} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-xs text-[#8A6A4B] italic leading-relaxed">
                "The sun-dried anchovies are by far the cleanest dry fish I have ever purchased. No sand grit whatsoever and the packaging keeps the smell sealed. Perfect!"
              </p>
              <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                <div className="w-8 h-8 rounded-full bg-[#2F4B3C] text-white flex items-center justify-center font-bold text-xs">
                  M
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#2F4B3C]">Marcus K.</h4>
                  <p className="text-[10px] text-gray-400">Regular Sourcing Customer</p>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="border border-gray-100 bg-[#F6EFE3]/30 rounded-2xl p-8 space-y-6 text-left">
              <div className="flex text-[#A65D3D]">
                {[1,2,3,4,5].map(x => <Star key={x} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-xs text-[#8A6A4B] italic leading-relaxed">
                "We buy the box of 300 eggs every month for our bakery. The yolks are rich and deep orange, indicating real organic free-range poultry. Excellent service!"
              </p>
              <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                <div className="w-8 h-8 rounded-full bg-[#2F4B3C] text-white flex items-center justify-center font-bold text-xs">
                  S
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#2F4B3C]">Sarah C.</h4>
                  <p className="text-[10px] text-gray-400">Home Baker</p>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="border border-gray-100 bg-[#F6EFE3]/30 rounded-2xl p-8 space-y-6 text-left">
              <div className="flex text-[#A65D3D]">
                {[1,2,3,4,5].map(x => <Star key={x} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-xs text-[#8A6A4B] italic leading-relaxed">
                "The boneless chicken breasts are tender and clean cut. Perfect portioning for meal prep, vacuum-packed to keep them frozen fresh. RIPOMA is my go-to."
              </p>
              <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                <div className="w-8 h-8 rounded-full bg-[#2F4B3C] text-white flex items-center justify-center font-bold text-xs">
                  D
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#2F4B3C]">David R.</h4>
                  <p className="text-[10px] text-gray-400">Fitness Coach</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. NEWSLETTER SECTION */}
      <section className="bg-texture-kraft py-20 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="text-xs uppercase tracking-widest text-[#A65D3D] font-bold">Homestead Newsletter</span>
          <h2 className="text-2xl sm:text-3xl font-serif text-[#2F4B3C] font-semibold">Join the Weekly Harvest List</h2>
          <p className="text-xs text-[#8A6A4B] max-w-md mx-auto font-light leading-relaxed">
            Get weekly harvest updates, coastal arrivals, and fresh coop availability directly in your inbox. Raised honest, sent clean.
          </p>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (!newsEmail.trim()) {
                setNewsError('Email address is required');
                return;
              }
              if (!/\S+@\S+\.\S+/.test(newsEmail)) {
                setNewsError('Invalid email address format');
                return;
              }
              if (subscribedEmails.includes(newsEmail.toLowerCase().trim())) {
                showToast("You're already subscribed!", 'info');
                setNewsError('');
                setNewsEmail('');
                return;
              }
              setSubscribedEmails([...subscribedEmails, newsEmail.toLowerCase().trim()]);
              showToast('Subscribed to harvest list successfully!', 'success');
              setNewsEmail('');
              setNewsError('');
            }}
            className="max-w-md mx-auto space-y-2 pt-2"
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <input 
                type="email" 
                placeholder="Your email address" 
                value={newsEmail}
                onChange={(e) => {
                  setNewsEmail(e.target.value);
                  if (newsError) setNewsError('');
                }}
                className={`w-full bg-white text-xs border outline-none rounded-md px-4 py-3 text-gray-800 transition-all font-sans input-field ${
                  newsError ? 'input-invalid' : 'border-gray-300 focus:border-[#2F4B3C] focus:ring-1'
                }`}
              />
              <button 
                type="submit" 
                className="w-full sm:w-auto bg-[#2F4B3C] hover:bg-[#A65D3D] text-white font-bold px-6 py-3 rounded-md text-xs uppercase tracking-wider transition-colors shrink-0 font-sans cursor-pointer"
              >
                Subscribe
              </button>
            </div>
            {newsError && (
              <span className="text-red-500 font-bold text-[9px] tracking-wide flex items-center gap-1 justify-center animate-pulse pt-1 select-none">
                <AlertTriangle className="w-3 h-3 shrink-0" /> {newsError}
              </span>
            )}
          </form>
        </div>
      </section>

    </div>
  );
};

export default Home;
