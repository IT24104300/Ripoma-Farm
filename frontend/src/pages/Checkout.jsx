import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { ShieldCheck, Truck, CreditCard, ChevronRight, CheckCircle, Lock, AlertTriangle } from 'lucide-react';

const Checkout = () => {
  const { cartItems, subtotal, tax, shippingFee, total, placeOrder } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { showToast } = useContext(NotificationContext);
  const navigate = useNavigate();

  // Address inputs state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA'
  });

  // Payment gateway simulation selection
  const [paymentMethod, setPaymentMethod] = useState('Stripe');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    holder: ''
  });

  // Validation States
  const [addressErrors, setAddressErrors] = useState({});
  const [addressTouched, setAddressTouched] = useState({});
  
  const [cardErrors, setCardErrors] = useState({});
  const [cardTouched, setCardTouched] = useState({});

  const [loading, setLoading] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);

  const serviceableCities = ['Organic City', 'Green Valley', 'Bay Area', 'Organic Hills'];

  // Prepopulate details
  useEffect(() => {
    if (!user) {
      navigate('/profile?redirect=checkout');
      return;
    }

    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      street: user.address?.street || '',
      city: user.address?.city || '',
      state: user.address?.state || '',
      zipCode: user.address?.zipCode || '',
      country: user.address?.country || 'USA'
    });
  }, [user, navigate]);

  // Luhn Check Card number validator
  const checkLuhn = (code) => {
    let cleanCode = code.replace(/\s+/g, '');
    if (!/^\d+$/.test(cleanCode)) return false;
    let len = cleanCode.length;
    let parity = len % 2;
    let sum = 0;
    for (let i = 0; i < len; i++) {
      let d = parseInt(cleanCode.charAt(i));
      if (i % 2 === parity) {
        d = d * 2;
        if (d > 9) d -= 9;
      }
      sum += d;
    }
    return (sum % 10) === 0;
  };

  const validateAddressField = (name, value) => {
    let err = '';
    switch (name) {
      case 'name':
        if (!value.trim()) err = 'Full name is required';
        else if (value.length < 2 || value.length > 60) err = 'Name must be 2 to 60 characters';
        break;
      case 'phone':
        if (!value.trim()) err = 'Contact phone is required';
        else if (!/^\+?[\d\s-]{7,15}$/.test(value)) err = 'Invalid phone format (e.g. +1 555-0199)';
        break;
      case 'street':
        if (!value.trim()) err = 'Street address is required';
        else if (value.length < 5) err = 'Street address must be at least 5 characters';
        break;
      case 'city':
        if (!value.trim()) err = 'City is required';
        else if (!serviceableCities.includes(value.trim())) {
          err = "We don't deliver here yet. (Available: Organic City, Green Valley, Bay Area)";
        }
        break;
      case 'zipCode':
        if (!value.trim()) err = 'Postal code is required';
        else if (!/^[a-zA-Z0-9\s-]{5,10}$/.test(value)) err = 'Invalid zip code format';
        break;
      default:
        break;
    }
    return err;
  };

  const validateCardField = (name, value) => {
    let err = '';
    switch (name) {
      case 'number':
        const cleanNum = value.replace(/\s+/g, '');
        if (!value.trim()) err = 'Card number is required';
        else if (cleanNum.length < 13 || cleanNum.length > 19) err = 'Number must be 13 to 19 digits';
        else if (!checkLuhn(cleanNum)) err = 'Invalid card number (Luhn check failed)';
        break;
      case 'expiry':
        if (!value.trim()) err = 'Expiry MM/YY required';
        else if (!/^\d{2}\/\d{2}$/.test(value)) err = 'Must be MM/YY format';
        else {
          const [m, y] = value.split('/').map(Number);
          const today = new Date();
          const currentYear = today.getFullYear() % 100;
          const currentMonth = today.getMonth() + 1;
          if (m < 1 || m > 12) err = 'Invalid month';
          else if (y < currentYear || (y === currentYear && m < currentMonth)) err = 'Card has expired';
        }
        break;
      case 'cvv':
        if (!value.trim()) err = 'CVV is required';
        else if (!/^\d{3,4}$/.test(value)) err = 'CVV must be 3 or 4 digits';
        break;
      case 'holder':
        if (!value.trim()) err = 'Holder name is required';
        break;
      default:
        break;
    }
    return err;
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (addressTouched[name]) {
      const err = validateAddressField(name, value);
      setAddressErrors(prev => ({ ...prev, [name]: err }));
    }
  };

  const handleFormBlur = (e) => {
    const { name, value } = e.target;
    setAddressTouched(prev => ({ ...prev, [name]: true }));
    const err = validateAddressField(name, value);
    setAddressErrors(prev => ({ ...prev, [name]: err }));
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({ ...prev, [name]: value }));

    if (cardTouched[name]) {
      const err = validateCardField(name, value);
      setCardErrors(prev => ({ ...prev, [name]: err }));
    }
  };

  const handleCardBlur = (e) => {
    const { name, value } = e.target;
    setCardTouched(prev => ({ ...prev, [name]: true }));
    const err = validateCardField(name, value);
    setCardErrors(prev => ({ ...prev, [name]: err }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      showToast('Your basket is empty', 'warning');
      return;
    }

    // Run address validations
    const allAddressErrors = {};
    Object.keys(formData).forEach(key => {
      const err = validateAddressField(key, formData[key]);
      if (err) allAddressErrors[key] = err;
    });
    setAddressErrors(allAddressErrors);
    setAddressTouched({ name: true, phone: true, street: true, city: true, zipCode: true });

    // Run card validations if Stripe
    let allCardErrors = {};
    if (paymentMethod === 'Stripe') {
      Object.keys(cardDetails).forEach(key => {
        const err = validateCardField(key, cardDetails[key]);
        if (err) allCardErrors[key] = err;
      });
      setCardErrors(allCardErrors);
      setCardTouched({ number: true, expiry: true, cvv: true, holder: true });
    }

    if (
      Object.values(allAddressErrors).some(err => err !== '') ||
      (paymentMethod === 'Stripe' && Object.values(allCardErrors).some(err => err !== ''))
    ) {
      showToast('Please fix checkout warnings before placing order.', 'error');
      return;
    }

    setLoading(true);

    // Simulate payment processing delay
    setTimeout(async () => {
      const response = await placeOrder(formData, paymentMethod);
      setLoading(false);
      
      if (response.success) {
        setSuccessOrder(response.order);
        showToast('Harvest order confirmed!', 'success');
      } else {
        showToast(response.message, 'error');
      }
    }, 1500);
  };

  const getAddressInputClass = (fieldName) => {
    const baseClass = "w-full border outline-none rounded py-2.5 px-3 text-xs leading-relaxed input-field ";
    if (!addressTouched[fieldName]) return baseClass + "border-gray-200 focus:border-[#2F4B3C]";
    return addressErrors[fieldName] ? baseClass + "input-invalid" : baseClass + "input-valid";
  };

  const getCardInputClass = (fieldName) => {
    const baseClass = "w-full bg-white border outline-none rounded py-2 px-3 text-xs input-field ";
    if (!cardTouched[fieldName]) return baseClass + "border-gray-200 focus:border-[#2F4B3C]";
    return cardErrors[fieldName] ? baseClass + "input-invalid" : baseClass + "input-valid";
  };

  const hasCheckoutErrors = 
    Object.values(addressErrors).some(e => e !== '') ||
    (paymentMethod === 'Stripe' && Object.values(cardErrors).some(e => e !== ''));

  if (successOrder) {
    return (
      <div className="max-w-xl mx-auto py-20 px-6 text-center space-y-8 animate-fade-in-up bg-white rounded-xl border border-gray-100 shadow-sm mt-12 font-sans">
        <CheckCircle className="w-14 h-14 text-emerald-800 mx-auto" />
        <h2 className="text-3xl font-serif text-[#2F4B3C] font-semibold">Order Confirmed</h2>
        <p className="text-xs text-gray-500 leading-relaxed max-w-sm mx-auto font-light">
          Your order has been queued for harvesting and packaging. We've sent a detailed invoice receipt to <span className="font-bold text-gray-800">{formData.email}</span>.
        </p>

        <div className="bg-[#F6EFE3] border border-[#8A6A4B]/10 rounded-lg p-5 text-left text-xs space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Order ID</span>
            <span className="font-mono text-gray-800">{successOrder._id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Invoice Reference</span>
            <span className="font-bold text-gray-800">{successOrder.invoiceNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Total Charged</span>
            <span className="font-bold text-[#2F4B3C]">${successOrder.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Order Status</span>
            <span className="bg-[#2F4B3C]/20 border border-[#2F4B3C]/30 text-[#2F4B3C] font-bold px-2.5 py-0.5 rounded text-[9px] uppercase tracking-wider">
              {successOrder.orderStatus}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
          <Link
            to="/profile"
            className="bg-[#2F4B3C] hover:bg-[#A65D3D] text-white font-bold px-6 py-3 rounded text-[10px] uppercase tracking-widest transition-colors"
          >
            My Orders Dashboard
          </Link>
          <Link
            to="/catalog"
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-6 py-3 rounded text-[10px] uppercase tracking-widest transition-colors"
          >
            Continue Sourcing
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left font-sans bg-[#F6EFE3]">
      
      {/* Checkout progress tracker */}
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-400 font-medium select-none">
        <Link to="/cart" className="hover:text-[#2F4B3C] transition-colors">Basket</Link> 
        <ChevronRight className="w-3 h-3" /> 
        <span className="text-[#2F4B3C] font-bold">Checkout & Sourcing Details</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Forms */}
        <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-6">
          
          {/* Sourcing/Delivery address info */}
          <div className="bg-white border border-gray-100 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-base font-serif text-[#2F4B3C] font-semibold flex items-center gap-2 border-b border-gray-50 pb-3">
              <Truck className="w-4 h-4 text-[#A65D3D]" /> Delivery Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  onBlur={handleFormBlur}
                  className={getAddressInputClass('name')}
                />
                {addressTouched.name && addressErrors.name && (
                  <span className="text-red-500 font-bold text-[9px] tracking-wide flex items-center gap-1 mt-0.5 animate-pulse">
                    <AlertTriangle className="w-3 h-3 shrink-0" /> {addressErrors.name}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  onBlur={handleFormBlur}
                  className={getAddressInputClass('phone')}
                />
                {addressTouched.phone && addressErrors.phone && (
                  <span className="text-red-500 font-bold text-[9px] tracking-wide flex items-center gap-1 mt-0.5 animate-pulse">
                    <AlertTriangle className="w-3 h-3 shrink-0" /> {addressErrors.phone}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Street Address</label>
                <input
                  type="text"
                  name="street"
                  placeholder="Apartment, unit, floor, door details..."
                  value={formData.street}
                  onChange={handleFormChange}
                  onBlur={handleFormBlur}
                  className={getAddressInputClass('street')}
                />
                {addressTouched.street && addressErrors.street && (
                  <span className="text-red-500 font-bold text-[9px] tracking-wide flex items-center gap-1 mt-0.5 animate-pulse">
                    <AlertTriangle className="w-3 h-3 shrink-0" /> {addressErrors.street}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1 col-span-2">
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleFormChange}
                    onBlur={handleFormBlur}
                    className={getAddressInputClass('city')}
                  />
                  {addressTouched.city && addressErrors.city && (
                    <span className="text-red-550 font-bold text-[9px] tracking-wide flex items-start gap-1 mt-0.5 animate-pulse">
                      <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" /> {addressErrors.city}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">State</label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleFormChange}
                    className="w-full border border-gray-200 outline-none rounded py-2.5 px-3 text-xs leading-relaxed focus:border-[#2F4B3C]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Zip Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleFormChange}
                    onBlur={handleFormBlur}
                    className={getAddressInputClass('zipCode')}
                  />
                  {addressTouched.zipCode && addressErrors.zipCode && (
                    <span className="text-red-500 font-bold text-[9px] tracking-wide flex items-center gap-1 mt-0.5 animate-pulse">
                      <AlertTriangle className="w-3 h-3 shrink-0" /> {addressErrors.zipCode}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Payment gateway */}
          <div className="bg-white border border-gray-100 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-base font-serif text-[#2F4B3C] font-semibold flex items-center gap-2 border-b border-gray-50 pb-3">
              <CreditCard className="w-4 h-4 text-[#A65D3D]" /> Payment Gateway
            </h3>

            {/* Methods Selection Tabs */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('Stripe')}
                className={`py-3.5 px-4 border rounded text-[10px] uppercase tracking-wider font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  paymentMethod === 'Stripe'
                    ? 'border-[#2F4B3C] bg-[#2F4B3C]/10 text-[#2F4B3C]'
                    : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                💳 Credit / Debit Card (Stripe)
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('Cash on Delivery')}
                className={`py-3.5 px-4 border rounded text-[10px] uppercase tracking-wider font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  paymentMethod === 'Cash on Delivery'
                    ? 'border-[#2F4B3C] bg-[#2F4B3C]/10 text-[#2F4B3C]'
                    : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                📦 Cash on Delivery
              </button>
            </div>

            {/* Credit Card Fields */}
            {paymentMethod === 'Stripe' && (
              <div className="space-y-4 bg-[#F6EFE3] border border-[#8A6A4B]/10 rounded-lg p-5 animate-fade-in-up">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Cardholder Name</label>
                  <input
                    type="text"
                    name="holder"
                    placeholder="Jane Doe"
                    value={cardDetails.holder}
                    onChange={handleCardChange}
                    onBlur={handleCardBlur}
                    className={getCardInputClass('holder')}
                  />
                  {cardTouched.holder && cardErrors.holder && (
                    <span className="text-red-500 font-bold text-[9px] tracking-wide flex items-center gap-1 mt-0.5">
                      <AlertTriangle className="w-3 h-3 shrink-0" /> {cardErrors.holder}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Card Number</label>
                  <input
                    type="text"
                    name="number"
                    placeholder="4242 4242 4242 4242"
                    value={cardDetails.number}
                    onChange={handleCardChange}
                    onBlur={handleCardBlur}
                    className={getCardInputClass('number')}
                  />
                  {cardTouched.number && cardErrors.number && (
                    <span className="text-red-500 font-bold text-[9px] tracking-wide flex items-center gap-1 mt-0.5">
                      <AlertTriangle className="w-3 h-3 shrink-0" /> {cardErrors.number}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Expiry Month/Year</label>
                    <input
                      type="text"
                      name="expiry"
                      placeholder="MM/YY"
                      value={cardDetails.expiry}
                      onChange={handleCardChange}
                      onBlur={handleCardBlur}
                      className={getCardInputClass('expiry')}
                    />
                    {cardTouched.expiry && cardErrors.expiry && (
                      <span className="text-red-500 font-bold text-[9px] tracking-wide flex items-center gap-1 mt-0.5">
                        <AlertTriangle className="w-3 h-3 shrink-0" /> {cardErrors.expiry}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">CVV Security Code</label>
                    <input
                      type="password"
                      name="cvv"
                      placeholder="***"
                      value={cardDetails.cvv}
                      onChange={handleCardChange}
                      onBlur={handleCardBlur}
                      className={getCardInputClass('cvv')}
                    />
                    {cardTouched.cvv && cardErrors.cvv && (
                      <span className="text-red-500 font-bold text-[9px] tracking-wide flex items-center gap-1 mt-0.5">
                        <AlertTriangle className="w-3 h-3 shrink-0" /> {cardErrors.cvv}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || hasCheckoutErrors}
            className="w-full bg-[#2F4B3C] hover:bg-[#A65D3D] text-white font-bold py-4 rounded text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5 shadow-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? 'Confirming secure order...' : `Complete Sourcing Order — $${total.toFixed(2)}`}
          </button>
        </form>

        {/* Right Summary column */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Summary Basket */}
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 pb-3 border-b border-gray-50">Items List</h3>
            <div className="max-h-64 overflow-y-auto space-y-3.5 pr-1">
              {cartItems.map((item, idx) => (
                <div key={idx} className="flex gap-3 justify-between items-center text-xs">
                  <div className="flex gap-2.5 items-center min-w-0">
                    <img src={item.image} alt={item.name} className="w-8 h-8 rounded object-cover bg-gray-50 border border-gray-100" />
                    <div className="min-w-0">
                      <h4 className="font-bold text-gray-800 truncate text-[11px]">{item.name}</h4>
                      <span className="text-[9px] text-gray-400 font-light">{item.variantName ? `${item.variantName} x ` : ''}{item.quantity} units</span>
                    </div>
                  </div>
                  <span className="font-bold text-gray-950 text-[11px]">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing totals */}
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-3 text-xs text-gray-500 font-sans">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-gray-900">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Surcharges & Tax</span>
              <span className="font-bold text-gray-900">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Charge</span>
              <span className="font-bold text-gray-900">
                {shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}
              </span>
            </div>
            
            <hr className="border-gray-50" />
            
            <div className="flex justify-between text-sm items-baseline text-gray-950 font-bold">
              <span>Total Bill</span>
              <span className="text-base font-bold text-[#2F4B3C]">${total.toFixed(2)}</span>
            </div>

            {/* Secure payment shield info */}
            <div className="bg-emerald-50 rounded border border-emerald-100 p-4 flex gap-2.5 text-[10px] text-emerald-800 mt-4 leading-relaxed font-light">
              <Lock className="w-4 h-4 shrink-0 text-emerald-700 mt-0.5" />
              <p>
                Secure payment gateway. Transactions are encrypted using standard industry protocol sets. Freshness dispatch guaranteed.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Checkout;
