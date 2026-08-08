import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { User, MapPin, ClipboardList, Bell, Calendar, Receipt, LogOut } from 'lucide-react';
import { HenIcon } from '../components/FarmIcons';

const Profile = () => {
  const { user, login, register, logout, updateProfile, loginWithGoogle } = useContext(AuthContext);
  const { showToast } = useContext(NotificationContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Redirect check (e.g. checkout redirect)
  const redirectTarget = searchParams.get('redirect') || '';

  // Signed out forms
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });

  // Real-time Validation Spec
  const [authErrors, setAuthErrors] = useState({});
  const [authTouched, setAuthTouched] = useState({});
  const [pwdStrength, setPwdStrength] = useState('');
  
  // Login Lockout Cooldown variables
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(null);

  const calculatePwdStrength = (pass) => {
    if (!pass) return '';
    if (pass.length < 8) return 'Weak';
    const hasNum = /[0-9]/.test(pass);
    const hasLetter = /[A-Za-z]/.test(pass);
    const hasSpecial = /[^A-Za-z0-9]/.test(pass);
    if (hasNum && hasLetter && hasSpecial) return 'Strong';
    if (hasNum && hasLetter) return 'Good';
    return 'Weak';
  };

  const validateAuthField = (name, value, isLogin = isLoginTab) => {
    let err = '';
    switch (name) {
      case 'name':
        if (!isLogin && !value.trim()) err = 'Full name is required';
        else if (!isLogin && (value.length < 2 || value.length > 60)) err = 'Name must be between 2 and 60 characters';
        break;
      case 'email':
        if (!value.trim()) err = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(value)) err = 'Invalid email address format';
        else if (!isLogin && value.toLowerCase().trim() === 'customer@ripomafarm.com') {
          err = 'Looks like you already have an account — log in instead?';
        }
        break;
      case 'password':
        if (!value) err = 'Password is required';
        else if (value.length < 8) err = 'Password must be at least 8 characters';
        break;
      default:
        break;
    }
    return err;
  };

  // Signed in tabs
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotif, setLoadingNotif] = useState(false);

  // Edit forms
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
  const [addressForm, setAddressForm] = useState({ street: '', city: '', state: '', zipCode: '', country: '' });

  // Invoice Modal
  const [activeInvoice, setActiveInvoice] = useState(null);

  // Initialize Google Sign In
  useEffect(() => {
    if (user) return;

    const initializeGoogle = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: 'your_google_client_id_here',
          callback: handleGoogleCredentialResponse,
        });

        const btnContainer = document.getElementById('google-signin-button');
        if (btnContainer) {
          window.google.accounts.id.renderButton(btnContainer, {
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
            width: '100%'
          });
        }
      } else {
        setTimeout(initializeGoogle, 1000);
      }
    };

    if (isLoginTab) {
      initializeGoogle();
    }
  }, [user, isLoginTab]);

  const handleGoogleCredentialResponse = async (response) => {
    const res = await loginWithGoogle(response.credential);
    if (res.success) {
      showToast('Logged in with Google successfully!', 'success');
      if (redirectTarget) navigate(`/${redirectTarget}`);
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleSimulateGoogleLogin = async () => {
    // base64 bypass simulation token for testing
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = btoa(JSON.stringify({
      email: "admin@ripomafarm.com",
      name: "Google Admin Developer",
      picture: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
    }));
    const mockToken = `${header}.${payload}.signature_placeholder`;

    showToast('Simulating Google Sign-In redirect...', 'info');
    setTimeout(async () => {
      const res = await loginWithGoogle(mockToken);
      if (res.success) {
        showToast('Logged in with Google Account (Admin Role)!', 'success');
        if (redirectTarget) navigate(`/${redirectTarget}`);
      } else {
        showToast(res.message, 'error');
      }
    }, 800);
  };

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || ''
      });
      setAddressForm({
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        zipCode: user.address?.zipCode || '',
        country: user.address?.country || 'USA'
      });
      fetchOrders();
      fetchNotifications();
    }
  }, [user]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const { data } = await axios.get('/api/orders/myorders');
      setOrders(data);
    } catch (err) {
      console.error('Error fetching customer orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchNotifications = async () => {
    setLoadingNotif(true);
    try {
      const { data } = await axios.get('/api/notifications');
      setNotifications(data);
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setLoadingNotif(false);
    }
  };

  const dismissNotification = async (id) => {
    try {
      await axios.put(`/api/notifications/${id}/read`);
      setNotifications(notifications.filter(n => n._id !== id));
      showToast('Notification dismissed', 'info');
    } catch (err) {
      console.error('Error dismissing notification:', err);
    }
  };

  const handleInputChange = (name, value) => {
    setAuthForm(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'password') {
        const strength = calculatePwdStrength(value);
        setPwdStrength(strength);
      }
      return updated;
    });

    if (authTouched[name]) {
      const err = validateAuthField(name, value);
      setAuthErrors(prev => ({ ...prev, [name]: err }));
    }
  };

  const handleAuthBlur = (name, value) => {
    setAuthTouched(prev => ({ ...prev, [name]: true }));
    const err = validateAuthField(name, value);
    setAuthErrors(prev => ({ ...prev, [name]: err }));
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();

    // Check Lockout Status
    if (isLoginTab && lockoutTime && Date.now() < lockoutTime) {
      const remainingMin = Math.ceil((lockoutTime - Date.now()) / 60000);
      showToast(`Too many failed login attempts. Try again in ${remainingMin} minutes.`, 'error');
      return;
    }

    // Run validations
    const allErrors = {
      email: validateAuthField('email', authForm.email),
      password: validateAuthField('password', authForm.password)
    };
    if (!isLoginTab) {
      allErrors.name = validateAuthField('name', authForm.name);
    }

    setAuthErrors(allErrors);
    setAuthTouched({ name: true, email: true, password: true });

    if (Object.values(allErrors).some(err => err !== '')) {
      showToast('Please correct validation warnings before submitting.', 'error');
      return;
    }

    let res;
    if (isLoginTab) {
      res = await login(authForm.email, authForm.password);
    } else {
      res = await register(authForm.name, authForm.email, authForm.password);
    }

    if (res.success) {
      showToast(isLoginTab ? 'Logged in successfully!' : 'Account registered successfully!', 'success');
      setFailedAttempts(0);
      setLockoutTime(null);
      if (redirectTarget) navigate(`/${redirectTarget}`);
    } else {
      if (isLoginTab) {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);
        if (nextAttempts >= 5) {
          const timeout = Date.now() + 15 * 60 * 1000;
          setLockoutTime(timeout);
          showToast('Too many failed attempts. Login locked for 15 minutes.', 'error');
        } else {
          showToast(`Invalid login credentials. Attempt ${nextAttempts} of 5.`, 'error');
        }
      } else {
        showToast(res.message, 'error');
      }
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const res = await updateProfile(profileForm.name, profileForm.phone, addressForm);
    if (res.success) {
      showToast('Profile updated successfully!', 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-emerald-50 text-emerald-800 border-emerald-100';
      case 'Shipped': return 'bg-blue-50 text-blue-800 border-blue-100';
      case 'Processing': return 'bg-amber-50 text-amber-800 border-amber-100';
      case 'Cancelled': return 'bg-red-50 text-red-800 border-red-100';
      default: return 'bg-gray-50 text-gray-800 border-gray-100';
    }
  };

  const getAuthInputClass = (fieldName) => {
    const baseClass = "w-full border outline-none rounded py-2 px-3 text-gray-800 input-field text-xs ";
    if (!authTouched[fieldName]) return baseClass + "border-gray-200 focus:border-[#2F4B3C]";
    return authErrors[fieldName] ? baseClass + "input-invalid" : baseClass + "input-valid";
  };

  /* ========================================================
     GUEST VIEW: SIGN IN / REGISTER
     ======================================================== */
  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 space-y-6 font-sans text-left bg-[#F6EFE3]">
        <div className="bg-white border border-[#8A6A4B]/10 rounded-xl shadow-sm overflow-hidden">
          
          {/* Tab Selector */}
          <div className="grid grid-cols-2 text-center border-b border-gray-100 select-none font-sans">
            <button
              onClick={() => { setIsLoginTab(true); setAuthErrors({}); setAuthTouched({}); }}
              className={`py-4 font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors ${
                isLoginTab ? 'text-[#2F4B3C] border-b border-[#2F4B3C] bg-white font-black' : 'text-gray-400 bg-gray-50'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLoginTab(false); setAuthErrors({}); setAuthTouched({}); }}
              className={`py-4 font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors ${
                !isLoginTab ? 'text-[#2F4B3C] border-b border-[#2F4B3C] bg-white font-black' : 'text-gray-400 bg-gray-50'
              }`}
            >
              Register
            </button>
          </div>

          {/* Form container */}
          <form onSubmit={handleAuthSubmit} className="p-6 sm:p-8 space-y-5">
            <div className="flex justify-center mb-1">
              <div className="w-10 h-10 rounded-full bg-[#2F4B3C]/5 flex items-center justify-center text-[#2F4B3C]">
                <HenIcon className="w-5 h-5 stroke-[1.5]" />
              </div>
            </div>
            
            <h3 className="text-xl font-serif text-[#2F4B3C] font-semibold text-center">
              {isLoginTab ? 'Welcome Back' : 'Create Farm Account'}
            </h3>
            <p className="text-xs text-gray-400 text-center max-w-xs mx-auto leading-relaxed font-light">
              {isLoginTab 
                ? 'Sign in to access your direct address directory and track shipments.' 
                : 'Join Ripoma Farm today to manage fresh coops deliveries.'}
            </p>

            {/* Lockout Notification Alert */}
            {lockoutTime && Date.now() < lockoutTime && (
              <div className="p-3 bg-red-50 border border-red-100 rounded text-[10px] font-bold text-red-700 flex items-center gap-2 select-none animate-pulse">
                <AlertTriangle className="w-4 h-4 text-red-750" />
                <span>Too many attempts. Locked out for {Math.ceil((lockoutTime - Date.now()) / 60000)} min.</span>
              </div>
            )}

            {!isLoginTab && (
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={authForm.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  onBlur={(e) => handleAuthBlur('name', e.target.value)}
                  className={getAuthInputClass('name')}
                />
                {authTouched.name && authErrors.name && (
                  <span className="text-red-500 font-bold text-[9px] tracking-wide flex items-center gap-1 mt-0.5">
                    <AlertTriangle className="w-3 h-3 shrink-0" /> {authErrors.name}
                  </span>
                )}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Email Address</label>
              <input
                type="email"
                placeholder="customer@ripomafarm.com"
                value={authForm.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onBlur={(e) => handleAuthBlur('email', e.target.value)}
                className={getAuthInputClass('email')}
              />
              {authTouched.email && authErrors.email && (
                <div className="flex flex-col gap-1.5 mt-0.5">
                  <span className="text-red-500 font-bold text-[9px] tracking-wide flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 shrink-0" /> {authErrors.email}
                  </span>
                  {!isLoginTab && authErrors.email.includes('already have an account') && (
                    <button
                      type="button"
                      onClick={() => { setIsLoginTab(true); setAuthErrors({}); setAuthTouched({}); }}
                      className="text-[#2F4B3C] hover:text-[#A65D3D] text-[9.5px] font-black uppercase tracking-wider text-left underline cursor-pointer"
                    >
                      Click here to Sign In instead &rarr;
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={authForm.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onBlur={(e) => handleAuthBlur('password', e.target.value)}
                className={getAuthInputClass('password')}
              />
              {authTouched.password && authErrors.password && (
                <span className="text-red-500 font-bold text-[9px] tracking-wide flex items-center gap-1 mt-0.5">
                  <AlertTriangle className="w-3 h-3 shrink-0" /> {authErrors.password}
                </span>
              )}
              
              {/* Password strength meter */}
              {!isLoginTab && authForm.password && (
                <div className="flex justify-between items-center text-[9px] pt-1 font-bold">
                  <span className="text-gray-400">Password Strength:</span>
                  <span className={`px-2 py-0.5 border rounded uppercase tracking-wider ${
                    pwdStrength === 'Strong' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' :
                    pwdStrength === 'Good' ? 'bg-[#3E6B6B]/10 text-[#3E6B6B] border-[#3E6B6B]/20' :
                    'bg-amber-50 text-amber-700 border-amber-100'
                  }`}>
                    {pwdStrength}
                  </span>
                </div>
              )}
            </div>

            {/* Forgot password simulation link */}
            {isLoginTab && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => showToast('Simulating: Reset instruction sent to your mailbox.', 'success')}
                  className="text-gray-400 hover:text-gray-600 hover:underline text-[9.5px] cursor-pointer"
                >
                  Forgot your password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={lockoutTime && Date.now() < lockoutTime}
              className="w-full bg-[#2F4B3C] hover:bg-[#A65D3D] disabled:bg-gray-300 text-white font-bold py-3 rounded text-xs uppercase tracking-widest transition-colors cursor-pointer mt-2"
            >
              {isLoginTab ? 'Sign In' : 'Create Account'}
            </button>

            {isLoginTab && (
              <div className="space-y-3 pt-3 border-t border-gray-100">
                <div className="text-center text-[9px] text-gray-400 font-bold uppercase tracking-wider">Social Login</div>
                
                {/* Google Sign-in */}
                <div id="google-signin-button" className="w-full flex justify-center"></div>
                
                {/* Developer simulation */}
                <button
                  type="button"
                  onClick={handleSimulateGoogleLogin}
                  className="w-full flex items-center justify-center gap-1.5 border border-dashed border-[#A65D3D] bg-[#A65D3D]/5 hover:bg-[#A65D3D]/10 text-[#8A6A4B] font-bold py-2 rounded text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                >
                  🚀 Simulated Google Admin Sourcing Bypass
                </button>
              </div>
            )}

            {isLoginTab && (
              <div className="text-center pt-2 border-t border-gray-50">
                <span className="text-[10px] text-gray-400 block font-light">Demo Customer account credentials:</span>
                <span className="text-[11px] text-[#2F4B3C] font-semibold block">customer@ripomafarm.com / customer123</span>
              </div>
            )}
          </form>
        </div>
      </div>
    );
  }

  /* ========================================================
     CUSTOMER DASHBOARD: SIGNED IN VIEW
     ======================================================== */
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans text-left bg-[#F6EFE3]">
      
      {/* Header bar */}
      <div className="bg-white border border-[#8A6A4B]/10 rounded-xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-14 h-14 bg-[#2F4B3C]/5 rounded-full flex items-center justify-center font-bold text-[#2F4B3C] text-xl border border-[#2F4B3C]/10 select-none">
            {user.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold text-[#2F4B3C] leading-snug">{user.name}</h1>
            <p className="text-xs text-gray-400 mt-1 font-light">{user.email} • Sourcing Level: <span className="font-semibold uppercase text-[#A65D3D]">{user.role}</span></p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold px-4 py-2.5 rounded text-[10px] uppercase tracking-widest transition-colors cursor-pointer shrink-0 border border-red-100"
        >
          <LogOut className="w-3.5 h-3.5" /> Log Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Navigation Tabs */}
        <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm flex flex-col gap-1 lg:col-span-3">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-3 rounded text-[10px] uppercase tracking-widest font-bold text-left transition-colors cursor-pointer ${
              activeTab === 'orders' ? 'bg-[#2F4B3C] text-white' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <ClipboardList className="w-4 h-4" /> Order History
          </button>
          
          <button
            onClick={() => setActiveTab('address')}
            className={`flex items-center gap-2 px-4 py-3 rounded text-[10px] uppercase tracking-widest font-bold text-left transition-colors cursor-pointer ${
              activeTab === 'address' ? 'bg-[#2F4B3C] text-white' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <MapPin className="w-4 h-4" /> Address Registry
          </button>
          
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-2 px-4 py-3 rounded text-[10px] uppercase tracking-widest font-bold text-left transition-colors cursor-pointer relative ${
              activeTab === 'notifications' ? 'bg-[#2F4B3C] text-white' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Alert Logs</span>
            {notifications.length > 0 && (
              <span className="absolute right-4 bg-[#A65D3D] text-white font-bold text-[9px] px-2 py-0.5 rounded">
                {notifications.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Viewport */}
        <div className="lg:col-span-9">
          
          {/* TAB: Order History */}
          {activeTab === 'orders' && (
            <div className="bg-white border border-gray-100 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="text-base font-serif text-[#2F4B3C] font-semibold flex items-center gap-2 border-b border-gray-50 pb-3">
                <ClipboardList className="w-4 h-4 text-[#A65D3D]" /> Order History
              </h3>

              {loadingOrders ? (
                <div className="space-y-4 animate-pulse">
                  {[1,2].map(n => <div key={n} className="h-16 bg-gray-50 rounded-lg"></div>)}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <span className="text-3xl block mb-2">🌾</span>
                  <p className="text-xs font-semibold font-sans">No Sourced Orders Registered</p>
                  <Link to="/catalog" className="text-[10px] text-[#2F4B3C] font-bold uppercase tracking-widest hover:text-[#A65D3D] block mt-2">Go Sourcing &rarr;</Link>
                </div>
              ) : (
                <div className="overflow-x-auto text-xs font-sans">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider text-[9px] pb-3">
                        <th className="pb-3">Invoice Slip</th>
                        <th className="pb-3">Order Date</th>
                        <th className="pb-3">Total Cost</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="py-4 font-bold text-gray-900">{order.invoiceNumber}</td>
                          <td className="py-4 text-gray-500 font-light">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="py-4 font-bold text-[#2F4B3C]">${order.total.toFixed(2)}</td>
                          <td className="py-4">
                            <span className={`px-2 py-0.5 border rounded text-[8px] font-bold uppercase tracking-wider ${getStatusColor(order.orderStatus)}`}>
                              {order.orderStatus}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <button
                              onClick={() => setActiveInvoice(order)}
                              className="bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold px-3 py-1.5 rounded border border-gray-200 transition-colors cursor-pointer text-[10px] uppercase tracking-wider"
                            >
                              Invoice
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB: Address Details */}
          {activeTab === 'address' && (
            <div className="bg-white border border-gray-100 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="text-base font-serif text-[#2F4B3C] font-semibold flex items-center gap-2 border-b border-gray-50 pb-3">
                <MapPin className="w-4 h-4 text-[#A65D3D]" /> Address Sourcing Profile
              </h3>

              <form onSubmit={handleProfileUpdate} className="space-y-6 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Full Contact Name</label>
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full border border-gray-200 focus:border-[#2F4B3C] focus:ring-1 focus:ring-[#2F4B3C] outline-none rounded py-2.5 px-3"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Mobile Number</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full border border-gray-200 focus:border-[#2F4B3C] focus:ring-1 focus:ring-[#2F4B3C] outline-none rounded py-2.5 px-3"
                    />
                  </div>
                </div>

                <div className="space-y-4 border-t border-gray-50 pt-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Street Sourcing Address</label>
                    <input
                      type="text"
                      placeholder="Barn road, building number, street name"
                      value={addressForm.street}
                      onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                      className="w-full border border-gray-200 focus:border-[#2F4B3C] focus:ring-1 focus:ring-[#2F4B3C] outline-none rounded py-2.5 px-3"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">City</label>
                      <input
                        type="text"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        className="w-full border border-gray-200 focus:border-[#2F4B3C] focus:ring-1 focus:ring-[#2F4B3C] outline-none rounded py-2.5 px-3"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">State</label>
                      <input
                        type="text"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        className="w-full border border-gray-200 focus:border-[#2F4B3C] focus:ring-1 focus:ring-[#2F4B3C] outline-none rounded py-2.5 px-3"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Zip Code</label>
                      <input
                        type="text"
                        value={addressForm.zipCode}
                        onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                        className="w-full border border-gray-200 focus:border-[#2F4B3C] focus:ring-1 focus:ring-[#2F4B3C] outline-none rounded py-2.5 px-3"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Country</label>
                      <input
                        type="text"
                        value={addressForm.country}
                        onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                        className="w-full border border-gray-200 focus:border-[#2F4B3C] focus:ring-1 focus:ring-[#2F4B3C] outline-none rounded py-2.5 px-3"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-[#2F4B3C] hover:bg-[#A65D3D] text-white font-bold py-2.5 px-6 rounded text-xs uppercase tracking-widest transition-colors cursor-pointer"
                >
                  Save Address
                </button>
              </form>
            </div>
          )}

          {/* TAB: Notifications */}
          {activeTab === 'notifications' && (
            <div className="bg-white border border-gray-100 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="text-base font-serif text-[#2F4B3C] font-semibold flex items-center gap-2 border-b border-gray-50 pb-3">
                <Bell className="w-4 h-4 text-[#A65D3D]" /> Farm Notification Logs
              </h3>

              {loadingNotif ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-14 bg-gray-50 rounded-lg"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-16 text-gray-400 text-xs">
                  <Bell className="w-8 h-8 mx-auto text-gray-300 mb-2 stroke-[1.5]" />
                  <p className="font-light">No notifications from the coops today.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((n) => (
                    <div
                      key={n._id}
                      className="border border-gray-100 rounded-xl p-4 flex justify-between items-start gap-4 hover:border-gray-200 transition-colors bg-[#F6EFE3]/30"
                    >
                      <div className="space-y-1">
                        <h4 className="font-bold text-gray-900 text-xs">{n.title}</h4>
                        <p className="text-[11px] text-gray-500 font-light leading-relaxed">{n.message}</p>
                        <span className="text-[9px] text-gray-400 font-light block pt-1">{new Date(n.createdAt).toLocaleString()}</span>
                      </div>
                      <button
                        onClick={() => dismissNotification(n._id)}
                        className="text-[9px] font-bold text-gray-400 hover:text-gray-600 cursor-pointer shrink-0 uppercase tracking-wider"
                      >
                        Dismiss
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Printable Invoice Modal Details */}
      {activeInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 sm:p-8 space-y-6 border border-gray-100 shadow-2xl relative animate-fade-in-up font-sans text-xs">
            
            {/* Modal header */}
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center gap-1.5">
                <Receipt className="w-4.5 h-4.5 text-[#2F4B3C]" />
                <h3 className="font-serif text-base font-bold text-[#2F4B3C]">Invoice details</h3>
              </div>
              <button
                onClick={() => setActiveInvoice(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Content sheet */}
            <div className="space-y-6 text-gray-600">
              
              {/* Brand info */}
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-sm font-serif font-bold text-[#2F4B3C] block tracking-wide">Ripoma Farm & Foods</span>
                  <span className="text-[10px] text-gray-400 font-light">10 Organic Way, Agro Valley</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-gray-800 block">{activeInvoice.invoiceNumber}</span>
                  <span className="text-[10px] text-gray-400">Date: {new Date(activeInvoice.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Delivery / Sourcing Info */}
              <div className="grid grid-cols-2 gap-4 border-y border-gray-50 py-4">
                <div>
                  <span className="font-bold text-[9px] text-gray-400 uppercase tracking-wider block mb-1">Delivered To</span>
                  <span className="font-bold text-gray-950 block">{activeInvoice.customerDetails.name}</span>
                  <span className="font-light">{activeInvoice.customerDetails.street}</span>
                  <span className="font-light block">{activeInvoice.customerDetails.city}, {activeInvoice.customerDetails.state} {activeInvoice.customerDetails.zipCode}</span>
                </div>
                <div>
                  <span className="font-bold text-[9px] text-gray-400 uppercase tracking-wider block mb-1">Payment Surcharges</span>
                  <span className="font-bold text-gray-950 block">{activeInvoice.paymentMethod}</span>
                  <span className="text-[9px] bg-emerald-50 text-emerald-800 px-2 py-0.5 border border-emerald-100 rounded font-bold uppercase inline-block mt-1 tracking-wider">
                    {activeInvoice.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Items details */}
              <div className="space-y-2">
                <div className="grid grid-cols-12 font-bold text-gray-400 border-b border-gray-50 pb-2 uppercase text-[8px] tracking-wider">
                  <span className="col-span-6">Harvest Item Description</span>
                  <span className="col-span-2 text-center">Unit Price</span>
                  <span className="col-span-2 text-center">Qty</span>
                  <span className="col-span-2 text-right">Subtotal</span>
                </div>
                
                {activeInvoice.items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 py-1 text-gray-800 items-center">
                    <div className="col-span-6 min-w-0">
                      <span className="font-semibold block truncate text-[11px]">{item.name}</span>
                      {item.variantName && <span className="text-[9px] text-gray-400 font-light block">{item.variantName}</span>}
                    </div>
                    <span className="col-span-2 text-center font-light">${item.price.toFixed(2)}</span>
                    <span className="col-span-2 text-center font-light">{item.quantity}</span>
                    <span className="col-span-2 text-right font-bold text-[#2F4B3C]">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Calculations breakdown */}
              <div className="border-t border-gray-100 pt-4 flex flex-col items-end gap-1 text-right">
                <div className="w-40 flex justify-between text-[11px]">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-gray-800">${activeInvoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="w-40 flex justify-between text-[11px]">
                  <span>Tax & Curing:</span>
                  <span className="font-semibold text-gray-800">${activeInvoice.tax.toFixed(2)}</span>
                </div>
                <div className="w-40 flex justify-between text-[11px]">
                  <span>Delivery:</span>
                  <span className="font-semibold text-gray-800">${activeInvoice.shippingFee.toFixed(2)}</span>
                </div>
                <div className="w-40 flex justify-between font-bold text-gray-950 border-t border-gray-100 pt-1.5 mt-1 text-xs">
                  <span>Total Amount:</span>
                  <span className="text-[#2F4B3C] font-bold">${activeInvoice.total.toFixed(2)}</span>
                </div>
              </div>

            </div>

            {/* Modal actions */}
            <div className="text-right pt-2 border-t border-gray-50">
              <button
                onClick={() => window.print()}
                className="bg-[#2F4B3C] hover:bg-[#A65D3D] text-white font-bold text-[10px] uppercase tracking-widest px-5 py-2.5 rounded transition-colors cursor-pointer"
              >
                Print Invoice Receipt
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
