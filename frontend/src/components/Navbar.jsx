import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { Menu, X, ShoppingBag, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { HenIcon } from './FarmIcons';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartItems, setIsCartOpen } = useContext(CartContext);
  const [isOpen, setIsOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setProfileDropdown(false);
    navigate('/');
  };

  const totalCartItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="bg-[#2F4B3C] text-white sticky top-0 z-40 border-b border-white/5 backdrop-blur-md bg-opacity-95 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo and Brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-full bg-[#F6EFE3]/10 flex items-center justify-center text-[#2F4B3C] transition-colors group-hover:bg-[#F6EFE3]/20">
                <HenIcon className="w-6 h-6 stroke-[1.25]" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xl font-serif font-semibold tracking-wide text-[#F6EFE3]">Ripoma Farm</span>
                <span className="text-[9px] uppercase tracking-widest text-[#2F4B3C] font-semibold leading-none">Coop & Coast</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Link items */}
          <div className="hidden md:flex items-center space-x-8 text-xs uppercase tracking-widest font-sans font-medium text-[#F6EFE3]/80">
            <Link to="/" className="hover:text-white transition-colors relative group py-2">
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#A65D3D] transition-all group-hover:w-full"></span>
            </Link>
            <Link to="/catalog" className="hover:text-white transition-colors relative group py-2">
              Shop
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#A65D3D] transition-all group-hover:w-full"></span>
            </Link>
            <Link to="/about" className="hover:text-white transition-colors relative group py-2">
              Our Story
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#A65D3D] transition-all group-hover:w-full"></span>
            </Link>
            <Link to="/contact" className="hover:text-white transition-colors relative group py-2">
              Contact
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#A65D3D] transition-all group-hover:w-full"></span>
            </Link>
          </div>

          {/* Icons & Account block */}
          <div className="hidden md:flex items-center space-x-5">
            
            {/* Harvest Loyalty Points Indicator */}
            {user && (
              <div className="flex items-center gap-1.5 bg-[#F6EFE3]/10 px-3 py-1.5 rounded-full border border-white/10 text-xs text-[#F6EFE3] animate-pop-scale">
                <HenIcon className="w-4 h-4 fill-current text-[#C99A3A]" />
                <span className="font-bold text-[11px] tracking-wide">185 Pts</span>
              </div>
            )}

            {/* Open Drawer Cart Trigger */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 text-[#F6EFE3]/85 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full cursor-pointer"
              aria-label="Open Cart"
            >
              <ShoppingBag className="w-4.5 h-4.5 stroke-[1.5]" />
              {totalCartItems > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-[9px] font-black leading-none text-white bg-[#A65D3D] rounded-full transform translate-x-1.5 -translate-y-1.5 border border-[#2F4B3C]">
                  {totalCartItems}
                </span>
              )}
            </button>

            {/* Profile actions dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdown(!profileDropdown)}
                  className="flex items-center gap-2 bg-[#F6EFE3]/10 hover:bg-[#F6EFE3]/15 px-4 py-2.5 rounded-lg transition-colors font-medium border border-white/5 cursor-pointer text-xs"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{user.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3 h-3 text-[#2F4B3C]" />
                </button>

                {profileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 text-gray-800 border border-gray-100 z-50">
                    {(user.role === 'admin' || user.role === 'worker') && (
                      <Link
                        to="/admin"
                        onClick={() => setProfileDropdown(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs hover:bg-[#F6EFE3] text-[#2F4B3C] font-semibold"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#A65D3D]" />
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdown(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs hover:bg-[#F6EFE3]"
                    >
                      <User className="w-4 h-4 text-[#2F4B3C]/50" />
                      My Dashboard
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 text-left font-medium cursor-pointer"
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
                className="bg-[#A65D3D] hover:bg-[#A65D3D]/90 text-white px-5 py-2.5 rounded-lg text-xs font-semibold transition-colors shadow-sm uppercase tracking-wider"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center gap-3">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-white/90 hover:text-white"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
              {totalCartItems > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-[9px] font-black text-white bg-[#A65D3D] rounded-full transform translate-x-1 -translate-y-1">
                  {totalCartItems}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md hover:bg-white/5 focus:outline-none cursor-pointer"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#2F4B3C] border-t border-white/5 px-4 pt-2 pb-6 space-y-2 text-left animate-fade-in-up">
          <Link to="/" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 rounded-md hover:bg-white/5 text-sm">Home</Link>
          <Link to="/catalog" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 rounded-md hover:bg-white/5 text-sm">Shop Catalog</Link>
          <Link to="/about" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 rounded-md hover:bg-white/5 text-sm">Our Story</Link>
          <Link to="/contact" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 rounded-md hover:bg-white/5 text-sm">Contact</Link>
          <hr className="border-white/10 my-2" />
          {user ? (
            <>
              {(user.role === 'admin' || user.role === 'worker') && (
                <Link to="/admin" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 rounded-md text-[#2F4B3C] font-bold text-sm">Admin Dashboard</Link>
              )}
              <Link to="/profile" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 rounded-md text-sm">My Dashboard</Link>
              <button onClick={handleLogout} className="w-full text-left block px-3 py-2.5 rounded-md text-red-400 text-sm">Logout</button>
            </>
          ) : (
            <Link to="/profile" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 text-center bg-[#A65D3D] text-white font-bold rounded-lg text-sm">Sign In</Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
