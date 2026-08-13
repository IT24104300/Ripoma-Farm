import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Globe, ArrowUp } from 'lucide-react';

const InstagramIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const FacebookIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);
import RipomaLogo from './RipomaLogo';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#2F4B3C] text-white/80 border-t border-white/5 font-sans">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        
        {/* Upper section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-white/5">
          
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-6">
            <Link to="/" className="inline-block">
              <RipomaLogo variant="full" color="white" height={40} />
            </Link>
            <p className="text-xs text-[#F6EFE3]/70 font-light leading-relaxed max-w-sm">
              Rooted in real soil, coastal tides, and honest hands. Delivering premium, clean Dry Fish, fresh pasture Eggs, and free-range Chicken straight from our gate to your doorstep.
            </p>
            <div className="flex space-x-3.5 pt-1">
              <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/75 hover:text-[#2F4B3C] hover:bg-white/10 transition-all">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/75 hover:text-[#2F4B3C] hover:bg-white/10 transition-all">
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/75 hover:text-[#2F4B3C] hover:bg-white/10 transition-all">
                <FacebookIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-xs uppercase tracking-widest text-[#A65D3D] font-bold">Navigation</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/" className="hover:text-white transition-colors font-light">Home</Link></li>
              <li><Link to="/catalog" className="hover:text-white transition-colors font-light">Shop Catalog</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors font-light">Our Farm Story</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors font-light">Get in Touch</Link></li>
            </ul>
          </div>

          {/* Specialties */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs uppercase tracking-widest text-[#A65D3D] font-bold">Our Harvests</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/catalog?category=Dry Fish" className="hover:text-white transition-colors font-light">Hygienic Sun-Dried Fish</Link></li>
              <li><Link to="/catalog?category=Eggs" className="hover:text-white transition-colors font-light">Organic Pasture Eggs</Link></li>
              <li><Link to="/catalog?category=Chicken" className="hover:text-white transition-colors font-light">Free-Range Dressed Chicken</Link></li>
            </ul>
          </div>

          {/* Sourcing Office */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs uppercase tracking-widest text-[#A65D3D] font-bold">Homestead Office</h4>
            <ul className="space-y-3.5 text-xs">
              <li className="flex items-start gap-2 text-white/70">
                <MapPin className="w-4 h-4 text-[#A65D3D] shrink-0 mt-0.5" />
                <span className="font-light">10 Organic Way, Agro Valley, GreenState</span>
              </li>
              <li className="flex items-center gap-2 text-white/70">
                <Phone className="w-4 h-4 text-[#A65D3D] shrink-0" />
                <span className="font-light">+1 (555) 747-6622</span>
              </li>
              <li className="flex items-center gap-2 text-white/70">
                <Mail className="w-4 h-4 text-[#A65D3D] shrink-0" />
                <span className="font-light">support@ripomafarm.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Lower section */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-8 text-[11px] text-white/40 font-light">
          <p>© {new Date().getFullYear()} Ripoma Farm & Foods. All rights reserved.</p>
          <div className="flex items-center gap-6 mt-4 sm:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <button 
              onClick={scrollToTop} 
              className="flex items-center gap-1 hover:text-white text-white/50 transition-colors uppercase tracking-widest text-[9px] font-bold font-sans cursor-pointer"
            >
              Top <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
