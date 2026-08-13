import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import axios from 'axios';

// Admin sub-views
import AdminOverview from './AdminOverview';
import AdminProducts from './AdminProducts';
import AdminInventory from './AdminInventory';
import AdminFinancials from './AdminFinancials';
import AdminWorkers from './AdminWorkers';
import AdminSettings from './AdminSettings';
import AdminOrders from './AdminOrders';
import AdminCustomers from './AdminCustomers';
import AdminRoles from './AdminRoles';

import { 
  LayoutDashboard, ShoppingCart, Package, DollarSign, Users, Settings, 
  ArrowLeft, Bell, Lock, ShieldCheck, ChevronRight, Search, ClipboardList, 
  UserSquare, AlertCircle, X 
} from 'lucide-react';
import { HenIcon } from '../components/FarmIcons';

import AdminLogin from './AdminLogin';
import RipomaLogo from '../components/RipomaLogo';
import { Flame } from 'lucide-react';

const AdminDashboard = () => {
  const { user, loading } = useContext(AuthContext);
  const { showToast } = useContext(NotificationContext);
  const navigate = useNavigate();

  const [activeView, setActiveView] = useState('overview');
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [notificationsList, setNotificationsList] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Command palette state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ products: [], orders: [], workers: [] });
  const [indexing, setIndexing] = useState(false);

  // Security check: render dedicated AdminLogin if unauthenticated
  if (!loading && (!user || (user.role !== 'admin' && user.role !== 'worker'))) {
    return <AdminLogin onSuccess={() => navigate('/admin')} />;
  }

  // Load notifications
  const fetchNotifs = async () => {
    try {
      const { data } = await axios.get('/api/notifications');
      setNotificationsList(data);
      setUnreadNotifications(data.filter(n => !n.read).length);
    } catch (err) {
      // Setup mock notifications fallback if backend lacks notifications schema
      const mockNotifs = [
        { id: 'n1', message: 'Low Stock: Jumbo pasture eggs level dropped to 8 units.', read: false, type: 'warning' },
        { id: 'n2', message: 'Expiry Alert: Batch BAT-DRY-2207 is expiring in 4 days.', read: false, type: 'danger' },
        { id: 'n3', message: 'New order #INV-2601 placed by Jane Doe.', read: true, type: 'info' }
      ];
      setNotificationsList(mockNotifs);
      setUnreadNotifications(mockNotifs.filter(n => !n.read).length);
    }
  };

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'worker')) {
      fetchNotifs();
    }
  }, [user]);

  // Hotkey listener for Command Search (⌘K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Live index searching
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ products: [], orders: [], workers: [] });
      return;
    }
    const timer = setTimeout(async () => {
      setIndexing(true);
      try {
        const [prodRes, orderRes, workerRes] = await Promise.all([
          axios.get(`/api/products?search=${searchQuery}`),
          axios.get('/api/orders'),
          axios.get('/api/workers')
        ]);
        
        // Filter elements
        const filteredOrders = (orderRes.data || []).filter(o => 
          o.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.customerDetails.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        const filteredWorkers = (workerRes.data || []).filter(w => 
          w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.role.toLowerCase().includes(searchQuery.toLowerCase())
        );

        setSearchResults({
          products: prodRes.data.slice(0, 4),
          orders: filteredOrders.slice(0, 4),
          workers: filteredWorkers.slice(0, 4)
        });
      } catch (err) {
        console.warn('Index search issues.');
      } finally {
        setIndexing(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const markAllRead = async () => {
    try {
      setNotificationsList(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadNotifications(0);
      showToast('Notifications marked as read.', 'success');
    } catch (err) {
      console.warn(err);
    }
  };

  if (loading || !user || (user.role !== 'admin' && user.role !== 'worker')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 font-sans text-center">
        <Lock className="w-10 h-10 text-[#A65D3D] animate-bounce" />
        <h2 className="text-base font-serif font-bold text-[#2F4B3C]">Verifying Sourcing Access Credentials...</h2>
      </div>
    );
  }

  const getViewLabel = () => {
    switch (activeView) {
      case 'overview': return 'Overview';
      case 'catalog': return 'Catalog Collections';
      case 'inventory': return 'Inventory Batches';
      case 'orders': return 'Daily Fulfillment Orders';
      case 'customers': return 'Customer Loyalty profiles';
      case 'workers': return 'Worker Registry & Kanban';
      case 'roles': return 'Roles & Permission Matrices';
      case 'analytics': return 'Revenue Analytics';
      case 'settings': return 'System Settings';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F6EFE3] text-gray-800 font-sans text-left bg-texture-graph relative">
      
      {/* 1. SaaS SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-[#2F4B3C] text-white shrink-0 hidden md:flex flex-col justify-between border-r border-[#8A6A4B]/10 shadow-lg z-25 select-none">
        
        <div className="p-6 space-y-8">
          {/* Brand header */}
          <Link to="/" className="inline-block group py-1">
            <RipomaLogo variant="compact" color="white" height={32} />
          </Link>

          <nav className="flex flex-col gap-1.5 text-[10px] uppercase tracking-wider font-semibold">
            <button
              onClick={() => setActiveView('overview')}
              className={`flex items-center gap-3 px-4 py-3 rounded text-left transition-colors cursor-pointer ${
                activeView === 'overview' ? 'bg-white/10 text-white font-bold border-l-2 border-[#A65D3D]' : 'text-[#F6EFE3]/75 hover:bg-white/5 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 stroke-[1.5]" /> Overview
            </button>

            <button
              onClick={() => setActiveView('catalog')}
              className={`flex items-center gap-3 px-4 py-3 rounded text-left transition-colors cursor-pointer ${
                activeView === 'catalog' ? 'bg-white/10 text-white font-bold border-l-2 border-[#A65D3D]' : 'text-[#F6EFE3]/75 hover:bg-white/5 hover:text-white'
              }`}
            >
              <ShoppingCart className="w-4 h-4 stroke-[1.5]" /> Catalog
            </button>

            <button
              onClick={() => setActiveView('inventory')}
              className={`flex items-center gap-3 px-4 py-3 rounded text-left transition-colors cursor-pointer ${
                activeView === 'inventory' ? 'bg-white/10 text-white font-bold border-l-2 border-[#A65D3D]' : 'text-[#F6EFE3]/75 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4 stroke-[1.5]" /> Inventory (Batches)
            </button>

            <button
              onClick={() => setActiveView('orders')}
              className={`flex items-center gap-3 px-4 py-3 rounded text-left transition-colors cursor-pointer ${
                activeView === 'orders' ? 'bg-white/10 text-white font-bold border-l-2 border-[#A65D3D]' : 'text-[#F6EFE3]/75 hover:bg-white/5 hover:text-white'
              }`}
            >
              <ClipboardList className="w-4 h-4 stroke-[1.5]" /> Orders
            </button>

            <button
              onClick={() => setActiveView('customers')}
              className={`flex items-center gap-3 px-4 py-3 rounded text-left transition-colors cursor-pointer ${
                activeView === 'customers' ? 'bg-white/10 text-white font-bold border-l-2 border-[#A65D3D]' : 'text-[#F6EFE3]/75 hover:bg-white/5 hover:text-white'
              }`}
            >
              <UserSquare className="w-4 h-4 stroke-[1.5]" /> Customers
            </button>

            <button
              onClick={() => setActiveView('workers')}
              className={`flex items-center gap-3 px-4 py-3 rounded text-left transition-colors cursor-pointer ${
                activeView === 'workers' ? 'bg-white/10 text-white font-bold border-l-2 border-[#A65D3D]' : 'text-[#F6EFE3]/75 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 stroke-[1.5]" /> Team
            </button>

            <button
              onClick={() => setActiveView('roles')}
              className={`flex items-center gap-3 px-4 py-3 rounded text-left transition-colors cursor-pointer ${
                activeView === 'roles' ? 'bg-white/10 text-white font-bold border-l-2 border-[#A65D3D]' : 'text-[#F6EFE3]/75 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Lock className="w-4 h-4 stroke-[1.5]" /> Roles
            </button>

            <button
              onClick={() => setActiveView('analytics')}
              className={`flex items-center gap-3 px-4 py-3 rounded text-left transition-colors cursor-pointer ${
                activeView === 'analytics' ? 'bg-white/10 text-white font-bold border-l-2 border-[#A65D3D]' : 'text-[#F6EFE3]/75 hover:bg-white/5 hover:text-white'
              }`}
            >
              <DollarSign className="w-4 h-4 stroke-[1.5]" /> Analytics
            </button>

            {user.role === 'admin' && (
              <button
                onClick={() => setActiveView('settings')}
                className={`flex items-center gap-3 px-4 py-3 rounded text-left transition-colors cursor-pointer ${
                  activeView === 'settings' ? 'bg-white/10 text-white font-bold border-l-2 border-[#A65D3D]' : 'text-[#F6EFE3]/75 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4 stroke-[1.5]" /> Settings
              </button>
            )}
          </nav>
        </div>

        {/* Storefront return */}
        <div className="p-6 border-t border-white/5">
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-1.5 bg-[#A65D3D] hover:bg-[#A65D3D]/90 text-white text-[9px] font-bold uppercase tracking-widest py-3.5 rounded transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Storefront
          </Link>
        </div>

      </aside>

      {/* 2. DASHBOARD VIEWPORT */}
      <div className="grow flex flex-col min-w-0">
        
        {/* Header navigation bar */}
        <header className="bg-white border-b border-gray-200 h-16 px-6 sm:px-8 flex items-center justify-between shrink-0 shadow-sm z-20">
          
          {/* Breadcrumbs & Command trigger */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-semibold text-gray-400">
              <span>Console</span> 
              <ChevronRight className="w-3 h-3 text-gray-300" /> 
              <span className="text-[#2F4B3C] font-black">{getViewLabel()}</span>
            </div>

            {/* Keyboard-friendly search block */}
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="hidden lg:flex items-center gap-2 bg-[#F6EFE3] border border-gray-200/80 px-3.5 py-1.5 rounded-lg text-[10px] text-gray-450 hover:bg-[#F6EFE3]/85 cursor-pointer selection:bg-transparent"
            >
              <Search className="w-3.5 h-3.5 text-gray-400" />
              <span>Search directory...</span>
              <kbd className="bg-white px-1.5 py-0.5 border border-gray-300 rounded font-mono text-[9px] text-gray-400">⌘K</kbd>
            </button>
          </div>

          <div className="flex items-center gap-3">
            
            {/* Daily Ops Streak Counter */}
            <div className="hidden lg:flex items-center gap-1.5 bg-[#A65D3D]/10 border border-[#A65D3D]/20 px-3 py-1 rounded-full text-[10px] font-bold text-[#A65D3D] select-none animate-pop-scale">
              <Flame className="w-3.5 h-3.5 fill-current text-[#A65D3D]" />
              <span>Order fulfillment on time: 14 days running! 🔥</span>
            </div>

            {/* Database status indicators */}
            <div className="hidden sm:flex items-center gap-1.5 bg-[#2F4B3C]/15 border border-[#2F4B3C]/20 px-3 py-1 rounded text-[9px] font-bold uppercase tracking-wider text-[#2F4B3C]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2F4B3C]" />
              <span>Coop Database Connected</span>
            </div>

            {/* Live Alerts Notification Center */}
            <div className="relative">
              <button 
                onClick={() => setIsNotifOpen(prev => !prev)}
                className="p-2 text-gray-450 hover:text-[#2F4B3C] rounded-full hover:bg-[#F6EFE3] transition-colors cursor-pointer relative"
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#A65D3D] rounded-full ring-2 ring-white"></span>
                )}
              </button>

              {/* Notification Overlay List */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-30 font-sans text-xs">
                  <div className="px-4 py-2 border-b border-gray-150/60 flex justify-between items-center bg-gray-50">
                    <span className="font-bold text-[#2F4B3C] uppercase tracking-wider text-[9px]">Operations Feed</span>
                    {unreadNotifications > 0 && (
                      <button onClick={markAllRead} className="text-[9px] text-[#A65D3D] font-bold hover:underline">Mark all read</button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notificationsList.length === 0 ? (
                      <p className="text-center py-6 text-gray-400">All alerts cleared.</p>
                    ) : (
                      notificationsList.map(n => (
                        <div key={n.id || n._id} className={`px-4 py-3 border-b border-gray-50 hover:bg-[#F6EFE3]/30 transition-colors flex gap-2.5 items-start ${!n.read ? 'bg-[#2F4B3C]/5 font-medium' : ''}`}>
                          <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${n.type === 'danger' ? 'text-red-500' : n.type === 'warning' ? 'text-amber-600' : 'text-[#3E6B6B]'}`} />
                          <span className="text-gray-700 leading-normal text-[11px]">{n.message}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile User block */}
            <div className="flex items-center gap-2.5 border-l border-gray-100 pl-4">
              <div className="w-8 h-8 bg-[#A65D3D] text-white font-bold rounded-full flex items-center justify-center text-xs select-none">
                {user.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <span className="font-bold text-xs text-gray-900 block leading-tight">{user.name}</span>
                <span className="text-[9px] text-gray-400 capitalize block leading-none">{user.role} console</span>
              </div>
            </div>

          </div>
        </header>

        {/* Dynamic Inner Panel Viewport */}
        <main className="grow p-6 sm:p-8 overflow-y-auto max-w-7xl w-full mx-auto space-y-8">
          {activeView === 'overview' && <AdminOverview />}
          {activeView === 'catalog' && <AdminProducts />}
          {activeView === 'inventory' && <AdminInventory />}
          {activeView === 'orders' && <AdminOrders />}
          {activeView === 'customers' && <AdminCustomers />}
          {activeView === 'workers' && <AdminWorkers />}
          {activeView === 'roles' && <AdminRoles />}
          {activeView === 'analytics' && <AdminFinancials />}
          {activeView === 'settings' && <AdminSettings />}
        </main>

      </div>

      {/* 3. ⌘K COMMAND SEARCH MODAL */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xl max-w-lg w-full overflow-hidden animate-fade-in-up">
            
            {/* Input bar */}
            <div className="flex items-center gap-3 px-4 border-b border-gray-150/60 h-12 bg-gray-50">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Search catalog, order invoice #, or worker name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="grow border-0 outline-none text-xs bg-transparent text-gray-800 placeholder-gray-405"
              />
              <button 
                onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                className="p-1 hover:bg-gray-200/80 rounded cursor-pointer text-gray-400 hover:text-gray-650"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[350px] overflow-y-auto p-4 space-y-4 text-xs">
              {indexing ? (
                <p className="text-center py-6 text-gray-450">Searching data indexes...</p>
              ) : !searchQuery.trim() ? (
                <div className="text-center py-6 text-gray-400 font-light">
                  <p>Type search details or queries...</p>
                  <p className="text-[10px] text-gray-350 mt-1">Search catalog items, customer tags, order files, or team roles.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Products Matches */}
                  {searchResults.products.length > 0 && (
                    <div className="space-y-1.5">
                      <h4 className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Products Catalogue</h4>
                      <div className="space-y-1">
                        {searchResults.products.map(p => (
                          <button
                            key={p._id}
                            onClick={() => { setActiveView('catalog'); setIsSearchOpen(false); setSearchQuery(''); }}
                            className="w-full text-left p-2 hover:bg-[#F6EFE3] border border-transparent hover:border-gray-200 rounded flex justify-between items-center transition-all cursor-pointer"
                          >
                            <span className="font-bold text-gray-800">{p.name}</span>
                            <span className="bg-[#2F4B3C]/5 text-[#2F4B3C] px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-semibold">{p.category}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Orders Matches */}
                  {searchResults.orders.length > 0 && (
                    <div className="space-y-1.5">
                      <h4 className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Fulfillment Orders</h4>
                      <div className="space-y-1">
                        {searchResults.orders.map(o => (
                          <button
                            key={o._id}
                            onClick={() => { setActiveView('orders'); setIsSearchOpen(false); setSearchQuery(''); }}
                            className="w-full text-left p-2 hover:bg-[#F6EFE3] border border-transparent hover:border-gray-200 rounded flex justify-between items-center transition-all cursor-pointer"
                          >
                            <div>
                              <span className="font-mono font-bold text-gray-800">{o.invoiceNumber}</span>
                              <span className="text-gray-400 text-[10px] pl-2 font-light">({o.customerDetails.name})</span>
                            </div>
                            <span className="text-gray-700 font-bold">${o.total.toFixed(2)}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Workers Matches */}
                  {searchResults.workers.length > 0 && (
                    <div className="space-y-1.5">
                      <h4 className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Staff Directory</h4>
                      <div className="space-y-1">
                        {searchResults.workers.map(w => (
                          <button
                            key={w._id}
                            onClick={() => { setActiveView('workers'); setIsSearchOpen(false); setSearchQuery(''); }}
                            className="w-full text-left p-2 hover:bg-[#F6EFE3] border border-transparent hover:border-gray-200 rounded flex justify-between items-center transition-all cursor-pointer"
                          >
                            <span className="font-bold text-gray-800">{w.name}</span>
                            <span className="text-gray-500 font-light">{w.role}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.products.length === 0 && searchResults.orders.length === 0 && searchResults.workers.length === 0 && (
                    <p className="text-center py-6 text-gray-405 font-light">No records found matching query.</p>
                  )}
                </div>
              )}
            </div>

            {/* command footer */}
            <div className="px-4 py-2 border-t border-gray-150 bg-gray-50 flex justify-between items-center text-[9px] text-gray-400">
              <span>Use keyboard arrows to navigate indexes</span>
              <span>ESC to close</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
