import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import {
  WaveIcon, HenIcon, FeatherIcon,
  SunFieldIcon, BasketIcon, CrateIcon, QRTraceIcon, WaxSealBadge
} from '../components/FarmIcons';
import {
  TornEdgeDivider, StampedSeal, WoodenCrateFrame
} from '../components/RusticComponents';
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
        setFeaturedProducts(data.slice(0, 4));
      } catch {
        // use empty state
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
  };
  const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4" style={{ background: '#F2E8D5' }}>
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: [0.7, 1.1, 1], opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          <RipomaLogo variant="icon" color="color" height={72} className="animate-pulse" />
        </motion.div>
        <span className="font-handwritten text-xl text-[#5C4630] tracking-wider">
          Gathering today's harvest…
        </span>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden" style={{ background: '#F2E8D5' }}>

      {/* ═══════════════════════════════════════
          1. HERO SECTION
      ═══════════════════════════════════════ */}
      <section className="relative min-h-[94vh] flex items-center overflow-hidden">
        {/* Full-bleed farm photo */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&w=1800&q=85"
            alt="RIPOMA farm at sunrise"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(10,10,10,0.65) 0%, rgba(10,10,10,0.30) 60%, rgba(10,10,10,0.10) 100%)' }} />
        </div>

        {/* Kraft-paper copy panel */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <motion.div
            className="lg:col-span-7"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            {/* Hand-stamped "today's arrival" badge */}
            <motion.div variants={fadeInUp} className="mb-6 inline-block">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest" style={{ background: 'rgba(217,196,163,0.15)', border: '1px solid rgba(217,196,163,0.3)', color: '#D9C4A3' }}>
                <span className="w-2 h-2 rounded-full bg-[#5FAE3E] animate-pulse inline-block" />
                Fresh from the coop & coast — today
              </div>
            </motion.div>

            {/* Hand-lettered hero headline */}
            <motion.h1
              variants={fadeInUp}
              className="font-handwritten text-5xl sm:text-7xl leading-tight mb-6"
              style={{ color: '#F2E8D5', textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
            >
              Real food,<br />
              <span style={{ color: '#C99A3A' }}>honest hands.</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-base sm:text-lg font-sans font-light leading-relaxed mb-8 max-w-xl"
              style={{ color: 'rgba(242,232,213,0.85)' }}
            >
              Today's catch, this morning's eggs, pasture-raised chicken — packed by hand,
              shipped honest. Gathered from RIPOMA's coastal fields directly to your table.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
              <Link
                to="/catalog"
                className="font-handwritten font-bold text-lg px-8 py-3.5 rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center gap-2 hover:-translate-y-0.5"
                style={{ background: '#5C4630', color: '#F2E8D5', border: '2px solid #3A2B1D' }}
              >
                Shop the Harvest <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/about"
                className="font-handwritten font-bold text-lg px-8 py-3.5 rounded-lg transition-all"
                style={{ background: 'rgba(242,232,213,0.1)', color: '#F2E8D5', border: '2px solid rgba(242,232,213,0.3)' }}
              >
                Our Story
              </Link>
            </motion.div>
          </motion.div>

          {/* Hero floating stamp card */}
          <motion.div
            className="lg:col-span-5 hidden lg:flex flex-col items-center gap-6"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
          >
            <div
              className="relative rounded-2xl overflow-hidden aspect-[4/5] max-w-xs w-full shadow-2xl"
              style={{ border: '4px solid #D9C4A3' }}
            >
              <img
                src="https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=700&q=80"
                alt="Fresh farm eggs in morning light"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(58,43,29,0.6) 0%, transparent 60%)' }} />
              <div className="absolute bottom-5 right-5">
                <StampedSeal label="Hand Picked" size={80} color="#C99A3A" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Torn paper edge between hero and next section */}
      <TornEdgeDivider color="#F2E8D5" />

      {/* ═══════════════════════════════════════
          2. FARM STORY STRIP
      ═══════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: '#F2E8D5' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-5">
            <div className="rounded-2xl overflow-hidden shadow-lg aspect-square" style={{ border: '3px solid #C5AD8C' }}>
              <img
                src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=700&q=80"
                alt="Poultry grazing on green pastures"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="md:col-span-7 space-y-5">
            <span className="font-handwritten font-bold text-lg" style={{ color: '#A65D3D' }}>Rooted in Honest Soil</span>
            <h2 className="font-handwritten text-4xl sm:text-5xl leading-tight font-bold" style={{ color: '#3A2B1D' }}>
              Gathered from coast,<br /> soil & open grass
            </h2>
            <p className="text-sm font-sans font-light leading-relaxed" style={{ color: '#5C4630' }}>
              We wake when the mist still hangs over the coops. We pull nets from salt-sprayed tides at dawn,
              collect warm eggs before the sun hits the fields. No shortcuts, no artificial enhancers.
              Just food raised with soil, wind, and honest hands.
            </p>
            <Link
              to="/about"
              className="inline-flex items-center gap-1.5 font-handwritten font-bold text-base hover:gap-3 transition-all"
              style={{ color: '#2F4B3C' }}
            >
              Meet the Farmers <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Torn paper edge */}
      <TornEdgeDivider color="#D9C4A3" />

      {/* ═══════════════════════════════════════
          3. HARVEST CATEGORIES — Hanging signs
      ═══════════════════════════════════════ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ background: '#D9C4A3' }}>
        <div className="max-w-7xl mx-auto space-y-14">
          <div className="text-center space-y-3">
            <span className="font-handwritten font-bold text-lg" style={{ color: '#A65D3D' }}>Harvest Categories</span>
            <h2 className="font-handwritten text-4xl sm:text-5xl font-bold" style={{ color: '#3A2B1D' }}>Honest Sourcing, Distinct Identities</h2>
            <p className="text-sm font-sans font-light" style={{ color: '#5C4630' }}>
              Each category carries its own rhythm — matured by sea air, sun warmth, or lush pasture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                to: '/catalog?category=Dry Fish',
                img: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=600&q=80',
                alt: 'Sun-drying anchovies on coastal racks',
                color: '#3E6B6B',
                Icon: WaveIcon,
                label: 'Coastal Air-Dried',
                title: 'Premium Dry Fish',
                desc: 'Coastal air-cured, dried 3 days under solar protection. Rich, clean flavor.',
              },
              {
                to: '/catalog?category=Eggs',
                img: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=600&q=80',
                alt: 'Brown farm eggs in straw nest',
                color: '#C99A3A',
                Icon: HenIcon,
                label: 'Warm Straw Gold',
                title: 'Farm Eggs',
                desc: 'Free-range grain-fed brown eggs collected every morning before daylight.',
              },
              {
                to: '/catalog?category=Chicken',
                img: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=600&q=80',
                alt: 'Free-range organic chicken cuts',
                color: '#2F4B3C',
                Icon: FeatherIcon,
                label: 'Pasture Sage',
                title: 'Organic Chicken',
                desc: 'Succulent dressed broiler cuts and whole options. Corn-fed, hormone-free.',
              },
            ].map(({ to, img, alt, color, Icon, label, title, desc }) => (
              <Link key={to} to={to} className="group block">
                {/* Twine hook at top of hanging sign */}
                <div className="flex justify-center mb-1" aria-hidden="true">
                  <svg viewBox="0 0 80 28" width="80" height="28">
                    <circle cx="40" cy="10" r="5" fill="#D9C4A3" stroke="#8A6A4B" strokeWidth="1.5" />
                    <line x1="40" y1="15" x2="40" y2="28" stroke="#8A6A4B" strokeWidth="1.2" />
                  </svg>
                </div>
                {/* Hanging sign card */}
                <div
                  className="rounded-xl overflow-hidden transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl"
                  style={{
                    background: '#F2E8D5',
                    border: '2px solid #C5AD8C',
                    boxShadow: '0 6px 18px rgba(92,70,48,0.15)',
                  }}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={img} alt={alt} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute top-3 left-3">
                      <span className="font-handwritten font-bold text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(242,232,213,0.9)', color }}>
                        {label}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 space-y-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5" style={{ color }} />
                      <h3 className="font-handwritten font-bold text-xl" style={{ color: '#3A2B1D' }}>{title}</h3>
                    </div>
                    <p className="text-xs text-[#5C4630] font-sans font-light leading-relaxed">{desc}</p>
                    <span className="font-handwritten font-bold text-sm" style={{ color }}>Explore →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Torn paper edge going into woven basket section */}
      <TornEdgeDivider color="#5C4630" />

      {/* ═══════════════════════════════════════
          4. WHY CHOOSE US — Woven basket bg + hand-drawn icons
      ═══════════════════════════════════════ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-texture-basket" style={{ background: '#5C4630' }}>
        <div className="max-w-7xl mx-auto space-y-14">
          <div className="text-center space-y-3">
            <span className="font-handwritten font-bold text-lg" style={{ color: '#C99A3A' }}>Quality Foundations</span>
            <h2 className="font-handwritten text-4xl sm:text-5xl font-bold" style={{ color: '#F2E8D5' }}>Grown Honest, Delivered Whole</h2>
            <p className="text-sm font-sans font-light" style={{ color: 'rgba(242,232,213,0.7)' }}>
              Four core values guiding every package we send — rooted in soil, not boardrooms.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { Icon: FeatherIcon, title: 'Farm Fresh Quality', desc: 'Harvested at sunrise, packaged at noon, dispatched by night. You taste freshness, not cold storage.' },
              { Icon: SunFieldIcon, title: 'Sustainable Rearing', desc: 'Small-boat fishing nets, humane free-range barns, and solar-cured clean drying domes.' },
              { Icon: CrateIcon, title: 'Direct Dispatch', desc: 'Temp-controlled boxes bypass third-party warehouses to your doorstep from our coop doors.' },
              { Icon: QRTraceIcon, title: 'Full Traceability', desc: 'Every package highlights its coop origin, batch ID, and exact harvest date.' },
            ].map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-xl p-7 space-y-4 transition-all hover:-translate-y-1 hover:shadow-xl"
                style={{
                  background: 'rgba(242,232,213,0.08)',
                  border: '1px solid rgba(242,232,213,0.15)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
                }}
              >
                {/* Hand-drawn icon in a sketchy circle */}
                <div
                  className="w-12 h-12 flex items-center justify-center rounded-full"
                  style={{ background: 'rgba(201,154,58,0.15)', border: '1.5px dashed #C99A3A' }}
                >
                  <Icon className="w-6 h-6" style={{ color: '#C99A3A', strokeWidth: 1.6 }} />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-handwritten font-bold text-lg" style={{ color: '#F2E8D5' }}>{title}</h3>
                  <p className="text-xs font-sans font-light leading-relaxed" style={{ color: 'rgba(242,232,213,0.65)' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Torn paper edge */}
      <TornEdgeDivider color="#F2E8D5" flip />

      {/* ═══════════════════════════════════════
          5. FEATURED PRODUCTS — Wooden crate frame
      ═══════════════════════════════════════ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ background: '#F2E8D5' }}>
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end pb-5 gap-4" style={{ borderBottom: '2px dashed #C5AD8C' }}>
            <div className="space-y-1">
              <span className="font-handwritten font-bold text-lg" style={{ color: '#A65D3D' }}>Freshly Sourced Picks</span>
              <h2 className="font-handwritten text-4xl sm:text-5xl font-bold" style={{ color: '#3A2B1D' }}>This Morning's Harvest</h2>
            </div>
            <Link
              to="/catalog"
              className="font-handwritten font-bold text-base flex items-center gap-1.5 hover:gap-3 transition-all"
              style={{ color: '#5C4630' }}
            >
              Browse Full Catalog <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <WoodenCrateFrame>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="rounded-xl h-80 animate-pulse" style={{ background: '#C5AD8C' }} />
                ))}
              </div>
            ) : featuredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
                {featuredProducts.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 space-y-3">
                <BasketIcon className="w-16 h-16 mx-auto" style={{ color: '#8A6A4B' }} />
                <p className="font-handwritten text-2xl" style={{ color: '#5C4630' }}>The basket is being filled…</p>
                <p className="text-sm font-sans font-light" style={{ color: '#8A6A4B' }}>Check back soon for today's harvest.</p>
                <Link to="/catalog" className="inline-block font-handwritten font-bold text-base mt-2" style={{ color: '#2F4B3C' }}>
                  Browse Full Catalog →
                </Link>
              </div>
            )}
          </WoodenCrateFrame>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          6. SEASONAL HIGHLIGHT — Barnwood dark banner
      ═══════════════════════════════════════ */}
      <section className="relative py-20 overflow-hidden" style={{ background: '#3A2B1D' }}>
        <div className="absolute inset-0 bg-texture-basket opacity-20 pointer-events-none" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="flex justify-center">
            <StampedSeal label="This Week's Catch" size={90} color="#C99A3A" />
          </div>
          <h2 className="font-handwritten text-4xl sm:text-5xl font-bold" style={{ color: '#F2E8D5' }}>
            Fresh Catch from the Morning Tide
          </h2>
          <p className="text-sm font-sans font-light max-w-xl mx-auto leading-relaxed" style={{ color: 'rgba(242,232,213,0.75)' }}>
            Our coastal fishermen harvested premium anchovies this week. Cured immediately under our solar drying beds for clean, rich flavor.
          </p>
          <Link
            to="/catalog?category=Dry Fish"
            className="inline-block font-handwritten font-bold text-lg px-8 py-3.5 rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
            style={{ background: '#5C4630', color: '#F2E8D5', border: '2px solid #8A6A4B' }}
          >
            Shop This Week's Catch
          </Link>
        </div>
      </section>

      {/* Torn paper edge */}
      <TornEdgeDivider color="#F2E8D5" />

      {/* ═══════════════════════════════════════
          7. SUSTAINABILITY & PRACTICES
      ═══════════════════════════════════════ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ background: '#F2E8D5' }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-7 space-y-10">
            <div className="space-y-4">
              <span className="font-handwritten font-bold text-lg" style={{ color: '#A65D3D' }}>Traceable Commitments</span>
              <h2 className="font-handwritten text-4xl sm:text-5xl font-bold leading-tight" style={{ color: '#3A2B1D' }}>How we respect the land & sea</h2>
              <p className="text-sm font-sans font-light max-w-xl leading-relaxed" style={{ color: '#5C4630' }}>
                We believe premium food starts with healthy soil and clean oceans. We commit to strict environmental and humane standards across every farming practice.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
              {[
                { title: 'Free-Range Humane Barns', desc: 'Our birds roam free with natural daylight, fresh water, and pasture grasses. No cages, no overcrowding.' },
                { title: 'Coastal Artisanal Fishing', desc: 'Partnered with local fishermen using line catches and non-invasive nets that respect marine biodiversity.' },
                { title: 'Compostable Kraft Packs', desc: 'Low-waste wrapping, kraft box shipments, and biodegradable liners to decrease downstream pollution.' },
                { title: 'Zero Hormones', desc: 'Only natural feeds and sun cures. No growth chemicals, water-weight injections, or preservatives.' },
              ].map(({ title, desc }) => (
                <div key={title} className="space-y-2">
                  <span className="font-handwritten font-bold text-base flex items-center gap-2" style={{ color: '#3A2B1D' }}>
                    <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#C99A3A' }} />
                    {title}
                  </span>
                  <p className="text-xs font-sans font-light leading-relaxed pl-4" style={{ color: '#5C4630' }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-4">
            <WaxSealBadge text="ORGANIC CERTIFIED" className="w-40 h-40" />
            <div className="text-center">
              <span className="font-handwritten font-bold text-lg block" style={{ color: '#3A2B1D' }}>Original Seal of Freshness</span>
              <span className="text-xs font-sans font-light block" style={{ color: '#8A6A4B' }}>Guaranteed direct farm dispatch</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          8. CUSTOMER REVIEWS
      ═══════════════════════════════════════ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-texture-kraft" style={{ background: '#D9C4A3' }}>
        <div className="max-w-7xl mx-auto space-y-14">
          <div className="text-center space-y-3">
            <span className="font-handwritten font-bold text-lg" style={{ color: '#A65D3D' }}>Honest Feedback</span>
            <h2 className="font-handwritten text-4xl sm:text-5xl font-bold" style={{ color: '#3A2B1D' }}>Shared by our table</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {[
              { initial: 'M', name: 'Marcus K.', role: 'Regular Customer', quote: '"The sun-dried anchovies are by far the cleanest dry fish I\'ve purchased. No grit and the packaging keeps the smell sealed perfectly!"' },
              { initial: 'S', name: 'Sarah C.', role: 'Home Baker', quote: '"We buy the 300-egg box every month for our bakery. The yolks are rich and deep orange — real organic free-range poultry. Excellent!"' },
              { initial: 'D', name: 'David R.', role: 'Fitness Coach', quote: '"The boneless chicken breasts are tender and clean cut. Perfect portioning for meal prep, vacuum-packed fresh. RIPOMA is my go-to."' },
            ].map(({ initial, name, role, quote }) => (
              <div
                key={name}
                className="rounded-xl p-7 space-y-5 transition-all hover:-translate-y-1 hover:shadow-lg"
                style={{
                  background: '#F2E8D5',
                  border: '1.5px solid #C5AD8C',
                  boxShadow: '0 3px 14px rgba(92,70,48,0.08)',
                }}
              >
                <div className="flex text-[#C99A3A]">
                  {[1,2,3,4,5].map(x => <Star key={x} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-sm font-sans italic leading-relaxed" style={{ color: '#5C4630' }}>{quote}</p>
                <div className="flex items-center gap-3 pt-2" style={{ borderTop: '1px dashed #C5AD8C' }}>
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center font-handwritten font-bold text-base text-[#F2E8D5]"
                    style={{ background: '#5C4630' }}
                  >
                    {initial}
                  </div>
                  <div>
                    <h4 className="font-handwritten font-bold text-sm" style={{ color: '#3A2B1D' }}>{name}</h4>
                    <p className="text-[10px] font-sans" style={{ color: '#8A6A4B' }}>{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Torn paper edge into newsletter */}
      <TornEdgeDivider color="#F2E8D5" />

      {/* ═══════════════════════════════════════
          9. NEWSLETTER — Postcard / note-card style
      ═══════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: '#F2E8D5' }}>
        <div className="max-w-2xl mx-auto">
          {/* The postcard card */}
          <div
            className="rounded-2xl p-10 text-center space-y-6 relative overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #F2E8D5 0%, #EAD9BE 100%)',
              border: '2px dashed #C5AD8C',
              boxShadow: '0 6px 32px rgba(92,70,48,0.15)',
            }}
          >
            {/* Top stamp decoration */}
            <div className="absolute top-4 right-4">
              <StampedSeal label="Join Us" size={58} color="#2F4B3C" />
            </div>

            <div className="space-y-2">
              <span className="font-handwritten font-bold text-lg" style={{ color: '#A65D3D' }}>Homestead Newsletter</span>
              <h2 className="font-handwritten text-4xl font-bold" style={{ color: '#3A2B1D' }}>Join the Farm Family</h2>
            </div>
            <p className="text-sm font-sans font-light leading-relaxed" style={{ color: '#5C4630' }}>
              Get weekly harvest updates, coastal arrivals, and fresh coop availability directly in your inbox.
              Raised honest, sent clean.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newsEmail.trim()) { setNewsError('Email address is required'); return; }
                if (!/\S+@\S+\.\S+/.test(newsEmail)) { setNewsError('Invalid email address format'); return; }
                if (subscribedEmails.includes(newsEmail.toLowerCase().trim())) {
                  showToast("You're already subscribed!", 'info');
                  setNewsError('');
                  setNewsEmail('');
                  return;
                }
                setSubscribedEmails([...subscribedEmails, newsEmail.toLowerCase().trim()]);
                showToast('Subscribed to harvest list!', 'success');
                setNewsEmail('');
                setNewsError('');
              }}
              className="space-y-3"
            >
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="email"
                  placeholder="Your email address"
                  value={newsEmail}
                  onChange={(e) => { setNewsEmail(e.target.value); if (newsError) setNewsError(''); }}
                  className={`w-full text-sm border outline-none rounded-lg px-4 py-3 font-sans transition-all ${
                    newsError
                      ? 'border-[#B5484D] ring-1 ring-[#B5484D]'
                      : 'border-[#C5AD8C] focus:border-[#5C4630] focus:ring-1 focus:ring-[#5C4630]'
                  }`}
                  style={{ background: '#FDFAF5', color: '#3A2B1D' }}
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto font-handwritten font-bold text-base px-7 py-3 rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer shrink-0"
                  style={{ background: '#5C4630', color: '#F2E8D5', border: '2px solid #3A2B1D' }}
                >
                  Subscribe
                </button>
              </div>
              {newsError && (
                <span className="text-[10px] font-bold text-[#B5484D] flex items-center gap-1 justify-center font-sans">
                  <AlertTriangle className="w-3 h-3 shrink-0" /> {newsError}
                </span>
              )}
            </form>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
