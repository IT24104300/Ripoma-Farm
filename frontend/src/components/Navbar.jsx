import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { Menu, X, ShoppingBag, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import RipomaLogo from './RipomaLogo';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartItems, setIsCartOpen } = useContext(CartContext);
  const [isOpen, setIsOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setProfileDropdown(false);
    navigate('/');
  };

  const totalCartItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav
      className="sticky top-0 z-40 text-white transition-all duration-300 shadow-sm"
      style={{
        background: isScrolled
          ? 'linear-gradient(90deg, #3A2B1D 0%, #5C4630 100%)'
          : 'linear-gradient(90deg, #5C4630 0%, #3A2B1D 100%)',
        borderBottom: '2px solid rgba(92,70,48,0.6)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
      }}
    >
      {/* Grain texture overlay */}
      <div className="absolute inset-0 bg-texture-basket opacity-10 pointer-events-none" aria-hidden="true" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? 'h-14' : 'h-20'}`}>

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center group">
              <div className="hidden sm:block">
                <RipomaLogo
                  variant={isScrolled ? 'compact' : 'full'}
                  color="white"
                  height={isScrolled ? 28 : 38}
                  className="transition-all duration-300"
                />
              </div>
              <div className="sm:hidden">
                <RipomaLogo
                  variant="icon"
                  color="white"
                  height={isScrolled ? 22 : 26}
                  className="transition-all duration-300"
                />
              </div>
            </Link>
          </div>

          {/* Desktop nav links — Caveat hand-lettered style */}
          <div className="hidden md:flex items-center space-x-7 font-handwritten text-base tracking-wide text-[#F2E8D5]/90">
            {[['/', 'Home'], ['/catalog', 'Shop'], ['/about', 'Our Story'], ['/contact', 'Contact']].map(([to, label]) => (
              <Link
                key={to}
                to={to}
                className="relative group py-1 hover:text-white transition-colors"
              >
                {label}
                {/* Chalk underline effect */}
                <span
                  className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full"
                  style={{ background: '#C99A3A', borderRadius: '1px' }}
                />
              </Link>
            ))}
          </div>

          {/* Icons & account block */}
          <div className="hidden md:flex items-center space-x-4">

            {/* Loyalty points */}
            {user && (
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-[#F2E8D5] font-handwritten font-bold"
                style={{ background: 'rgba(246,239,227,0.12)', border: '1px solid rgba(246,239,227,0.15)' }}
              >
                <RipomaLogo variant="icon" height={14} />
                <span>185 Pts</span>
              </div>
            )}

            {/* Cart button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 text-[#F2E8D5]/90 hover:text-white transition-colors rounded-full cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.08)' }}
              aria-label="Open Cart"
            >
              <ShoppingBag className="w-4.5 h-4.5 stroke-[1.5]" />
              {totalCartItems > 0 && (
                <span
                  className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-[9px] font-black leading-none text-white rounded-full border-2 border-[#5C4630] transform translate-x-1.5 -translate-y-1.5 font-sans"
                  style={{ background: '#B5484D' }}
                >
                  {totalCartItems}
                </span>
              )}
            </button>

            {/* Account dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdown(!profileDropdown)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors font-handwritten font-bold text-sm border cursor-pointer"
                  style={{ background: 'rgba(246,239,227,0.1)', border: '1px solid rgba(246,239,227,0.15)' }}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{user.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3 h-3 opacity-70" />
                </button>

                {profileDropdown && (
                  <div
                    className="absolute right-0 mt-2 w-48 rounded-xl shadow-xl py-1 z-50 border"
                    style={{ background: '#F2E8D5', borderColor: '#C5AD8C' }}
                  >
                    {(user.role === 'admin' || user.role === 'worker') && (
                      <Link
                        to="/admin"
                        onClick={() => setProfileDropdown(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold hover:bg-[#D9C4A3] transition-colors"
                        style={{ color: '#5C4630' }}
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#A65D3D]" />
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdown(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs hover:bg-[#D9C4A3] transition-colors"
                      style={{ color: '#3A2B1D' }}
                    >
                      <User className="w-4 h-4 text-[#8A6A4B]" />
                      My Dashboard
                    </Link>
                    <hr className="my-1 border-[#C5AD8C]/50" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#B5484D] hover:bg-red-50 text-left font-bold cursor-pointer transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/profile"
                className="font-handwritten font-bold text-sm px-5 py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md"
                style={{ background: '#2F4B3C', color: '#F2E8D5', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile buttons */}
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-white/90 hover:text-white"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
              {totalCartItems > 0 && (
                <span
                  className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-[9px] font-black text-white rounded-full transform translate-x-1 -translate-y-1"
                  style={{ background: '#B5484D' }}
                >
                  {totalCartItems}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md hover:bg-white/10 focus:outline-none cursor-pointer"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div
          className="md:hidden px-4 pt-2 pb-6 space-y-1 text-left animate-fade-in-up border-t"
          style={{ background: '#3A2B1D', borderColor: 'rgba(255,255,255,0.08)' }}
        >
          {[['/', 'Home'], ['/catalog', 'Shop Catalog'], ['/about', 'Our Story'], ['/contact', 'Contact']].map(([to, label]) => (
            <Link
              key={to}
              to={to}
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2.5 rounded-md font-handwritten font-bold text-base hover:bg-white/10 text-[#F2E8D5]"
            >
              {label}
            </Link>
          ))}
          <hr className="border-white/10 my-2" />
          {user ? (
            <>
              {(user.role === 'admin' || user.role === 'worker') && (
                <Link to="/admin" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 rounded-md font-bold font-handwritten text-[#C99A3A] text-base">Admin Dashboard</Link>
              )}
              <Link to="/profile" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 rounded-md font-handwritten text-base text-[#F2E8D5]">My Dashboard</Link>
              <button onClick={handleLogout} className="w-full text-left block px-3 py-2.5 rounded-md font-handwritten text-[#B5484D] text-base">Logout</button>
            </>
          ) : (
            <Link to="/profile" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 text-center font-handwritten font-bold text-base rounded-lg text-[#F2E8D5]" style={{ background: '#2F4B3C' }}>
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
