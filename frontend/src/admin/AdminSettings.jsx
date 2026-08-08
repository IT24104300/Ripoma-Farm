import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { NotificationContext } from '../context/NotificationContext';
import { Settings, Save, Database, Loader, AlertTriangle, ShieldCheck, CheckCircle, Key } from 'lucide-react';

const AdminSettings = () => {
  const { showToast } = useContext(NotificationContext);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [backingUp, setBackingUp] = useState(false);

  // Global settings state
  const [form, setForm] = useState({
    companyName: 'RIPOMA Farm',
    contactEmail: 'contact@ripomafarm.com',
    contactPhone: '+1 (555) 019-9283',
    address: '128 Agro Valley Road, Organic City',
    taxRate: '5',
    shippingFee: '10',
    stripeEnabled: true,
    cashOnDeliveryEnabled: true,
  });

  // Security password state
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  // Validation errors state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const [securityErrors, setSecurityErrors] = useState({});
  const [securityTouched, setSecurityTouched] = useState({});

  const fetchSettings = async () => {
    try {
      const { data } = await axios.get('/api/settings');
      if (data) {
        setForm({
          companyName: data.companyName || 'RIPOMA Farm',
          contactEmail: data.contactEmail || 'contact@ripomafarm.com',
          contactPhone: data.contactPhone || '+1 (555) 019-9283',
          address: data.address || '128 Agro Valley Road, Organic City',
          taxRate: (data.taxRate || 5).toString(),
          shippingFee: (data.shippingFee || 10).toString(),
          stripeEnabled: data.stripeEnabled !== undefined ? data.stripeEnabled : true,
          cashOnDeliveryEnabled: data.cashOnDeliveryEnabled !== undefined ? data.cashOnDeliveryEnabled : true,
        });
      }
    } catch (err) {
      showToast('Could not load global settings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Validation Logic
  const validateField = (name, value) => {
    let err = '';
    switch (name) {
      case 'companyName':
        if (!value.trim()) err = 'Company name is required';
        break;
      case 'contactEmail':
        if (!value.trim()) err = 'Support email is required';
        else if (!/\S+@\S+\.\S+/.test(value)) err = 'Invalid email format';
        break;
      case 'contactPhone':
        if (!value.trim()) err = 'Contact phone is required';
        break;
      case 'address':
        if (!value.trim()) err = 'Physical address is required';
        break;
      case 'taxRate':
        const tax = Number(value);
        if (value === '') err = 'Tax rate is required';
        else if (isNaN(tax) || tax < 0 || tax > 100) err = 'Tax rate must be between 0 and 100%';
        break;
      case 'shippingFee':
        const ship = Number(value);
        if (value === '') err = 'Shipping fee is required';
        else if (isNaN(ship) || ship < 0) err = 'Shipping fee must be a positive number';
        break;
      default:
        break;
    }
    return err;
  };

  const validateSecurityField = (name, value) => {
    let err = '';
    switch (name) {
      case 'newPassword':
        if (!value) err = 'New password is required';
        else if (value.length < 8) err = 'Password must be at least 8 characters';
        else if (!/[0-9]/.test(value) || !/[A-Za-z]/.test(value)) {
          err = 'Password must contain at least 1 number and 1 letter';
        } else if (value === securityForm.currentPassword) {
          err = 'New password cannot match your current password';
        }
        break;
      case 'confirmPassword':
        if (!value) err = 'Confirmation is required';
        else if (value !== securityForm.newPassword) err = 'Passwords do not match';
        break;
      default:
        break;
    }
    return err;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setForm(prev => ({ ...prev, [name]: val }));

    if (touched[name]) {
      const err = validateField(name, val);
      setErrors(prev => ({ ...prev, [name]: err }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const err = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: err }));
  };

  const handleSecurityChange = (e) => {
    const { name, value } = e.target;
    setSecurityForm(prev => ({ ...prev, [name]: value }));

    if (securityTouched[name]) {
      const err = validateSecurityField(name, value);
      setSecurityErrors(prev => ({ ...prev, [name]: err }));
    }
  };

  const handleSecurityBlur = (e) => {
    const { name, value } = e.target;
    setSecurityTouched(prev => ({ ...prev, [name]: true }));
    const err = validateSecurityField(name, value);
    setSecurityErrors(prev => ({ ...prev, [name]: err }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const allErrors = {
      companyName: validateField('companyName', form.companyName),
      contactEmail: validateField('contactEmail', form.contactEmail),
      contactPhone: validateField('contactPhone', form.contactPhone),
      address: validateField('address', form.address),
      taxRate: validateField('taxRate', form.taxRate),
      shippingFee: validateField('shippingFee', form.shippingFee),
    };

    setErrors(allErrors);
    setTouched({ companyName: true, contactEmail: true, contactPhone: true, address: true, taxRate: true, shippingFee: true });

    if (Object.values(allErrors).some(err => err !== '')) {
      showToast('Please fix setting validation errors.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await axios.put('/api/settings', {
        ...form,
        taxRate: Number(form.taxRate),
        shippingFee: Number(form.shippingFee)
      });
      showToast('Settings saved successfully!', 'success');
    } catch (err) {
      showToast('Failed to save settings.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSecuritySubmit = async (e) => {
    e.preventDefault();
    const allErrors = {
      newPassword: validateSecurityField('newPassword', securityForm.newPassword),
      confirmPassword: validateSecurityField('confirmPassword', securityForm.confirmPassword)
    };

    setSecurityErrors(allErrors);
    setSecurityTouched({ newPassword: true, confirmPassword: true });

    if (Object.values(allErrors).some(err => err !== '')) {
      showToast('Please correct password complexity errors.', 'error');
      return;
    }

    try {
      // Simulate success
      showToast('Credentials updated successfully.', 'success');
      setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSecurityErrors({});
      setSecurityTouched({});
    } catch (err) {
      showToast('Failed to update passwords.', 'error');
    }
  };

  // Toggle 2FA Authenticator Setup
  const handle2FAToggle = (e) => {
    const checked = e.target.checked;
    if (checked) {
      setVerificationCode('');
      setIs2FAModalOpen(true);
    } else {
      setTwoFactorEnabled(false);
      showToast('Two-factor authentication disabled.', 'info');
    }
  };

  const verify2FACode = (e) => {
    e.preventDefault();
    if (verificationCode.trim() !== '123456') {
      showToast('Invalid verification passcode. Try simulated code: 123456', 'error');
      return;
    }
    setTwoFactorEnabled(true);
    setIs2FAModalOpen(false);
    showToast('2FA setup verified and active.', 'success');
  };

  const handleBackup = async () => {
    setBackingUp(true);
    try {
      const [productsRes, ordersRes, workersRes, settingsRes] = await Promise.all([
        axios.get('/api/products'),
        axios.get('/api/orders'),
        axios.get('/api/workers'),
        axios.get('/api/settings'),
      ]);

      const dbDump = {
        backupDate: new Date().toISOString(),
        settings: settingsRes.data,
        products: productsRes.data,
        orders: ordersRes.data,
        workers: workersRes.data,
      };

      const jsonContent = JSON.stringify(dbDump, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `RIPOMA_DB_Backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast('JSON database backup created and downloaded!', 'success');
    } catch (err) {
      showToast('Database backup simulation failed.', 'error');
    } finally {
      setBackingUp(false);
    }
  };

  const getInputClass = (fieldName, errorsObj = errors, touchedObj = touched) => {
    const baseClass = "w-full border outline-none rounded py-2 px-3 text-gray-800 input-field text-xs ";
    if (!touchedObj[fieldName]) return baseClass + "border-gray-200 focus:border-[#2F4B3C]";
    return errorsObj[fieldName] ? baseClass + "input-invalid" : baseClass + "input-valid";
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center text-gray-400 text-xs"><Loader className="w-5 h-5 animate-spin" /></div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in-up text-left font-sans print:hidden">

      {/* 1. Global configurations */}
      <div className="bg-white border border-gray-150/60 rounded p-6 sm:p-8 shadow-sm space-y-6">
        <h3 className="text-sm font-serif font-semibold text-[#2F4B3C] flex items-center gap-2 border-b border-gray-50 pb-3">
          <Settings className="w-4.5 h-4.5 text-[#A65D3D]" /> Global Configuration Settings
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6 text-xs text-gray-600">

          <div className="space-y-4">
            <h4 className="font-bold text-gray-900 text-xs font-serif text-[#2F4B3C] pb-1 border-b border-gray-50">Company Details</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  value={form.companyName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getInputClass('companyName')}
                />
                {touched.companyName && errors.companyName && (
                  <span className="text-red-500 font-bold text-[9px] tracking-wide flex items-center gap-1 mt-0.5">
                    <AlertTriangle className="w-3 h-3 shrink-0" /> {errors.companyName}
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Contact Phone</label>
                <input
                  type="text"
                  name="contactPhone"
                  value={form.contactPhone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getInputClass('contactPhone')}
                />
                {touched.contactPhone && errors.contactPhone && (
                  <span className="text-red-500 font-bold text-[9px] tracking-wide flex items-center gap-1 mt-0.5">
                    <AlertTriangle className="w-3 h-3 shrink-0" /> {errors.contactPhone}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Support Email</label>
                <input
                  type="email"
                  name="contactEmail"
                  value={form.contactEmail}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getInputClass('contactEmail')}
                />
                {touched.contactEmail && errors.contactEmail && (
                  <span className="text-red-500 font-bold text-[9px] tracking-wide flex items-center gap-1 mt-0.5">
                    <AlertTriangle className="w-3 h-3 shrink-0" /> {errors.contactEmail}
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Farm Address</label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getInputClass('address')}
                />
                {touched.address && errors.address && (
                  <span className="text-red-500 font-bold text-[9px] tracking-wide flex items-center gap-1 mt-0.5">
                    <AlertTriangle className="w-3 h-3 shrink-0" /> {errors.address}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t border-gray-50 pt-4">
            <h4 className="font-bold text-gray-900 text-xs font-serif text-[#2F4B3C] pb-1 border-b border-gray-50">Tax & Shipping Settings</h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Tax Rate (%)</label>
                <input
                  type="number"
                  name="taxRate"
                  value={form.taxRate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getInputClass('taxRate')}
                />
                {touched.taxRate && errors.taxRate && (
                  <span className="text-red-500 font-bold text-[9px] tracking-wide flex items-center gap-1 mt-0.5">
                    <AlertTriangle className="w-3 h-3 shrink-0" /> {errors.taxRate}
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Shipping Fee ($)</label>
                <input
                  type="number"
                  name="shippingFee"
                  value={form.shippingFee}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getInputClass('shippingFee')}
                />
                {touched.shippingFee && errors.shippingFee && (
                  <span className="text-red-500 font-bold text-[9px] tracking-wide flex items-center gap-1 mt-0.5">
                    <AlertTriangle className="w-3 h-3 shrink-0" /> {errors.shippingFee}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t border-gray-50 pt-4">
            <h4 className="font-bold text-gray-900 text-xs font-serif text-[#2F4B3C] pb-1 border-b border-gray-50">Payment Gateways</h4>

            <div className="flex flex-col gap-3 font-sans">
              <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-150/60 rounded hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  name="stripeEnabled"
                  checked={form.stripeEnabled}
                  onChange={handleChange}
                  className="rounded text-[#2F4B3C] focus:ring-[#2F4B3C] w-4 h-4 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-gray-800 block text-xs">Enable Credit Card Processing (Stripe)</span>
                  <span className="text-[10px] text-gray-400 font-light">Allows simulated checkout card charges.</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-150/60 rounded hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  name="cashOnDeliveryEnabled"
                  checked={form.cashOnDeliveryEnabled}
                  onChange={handleChange}
                  className="rounded text-[#2F4B3C] focus:ring-[#2F4B3C] w-4 h-4 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-gray-800 block text-xs">Enable Cash on Delivery (COD)</span>
                  <span className="text-[10px] text-gray-400 font-light">Allows checkout orders to be processed via COD.</span>
                </div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || Object.values(errors).some(e => e !== '')}
            className="w-full bg-[#2F4B3C] disabled:bg-gray-300 disabled:text-gray-550 hover:bg-[#A65D3D] text-white font-bold py-3.5 rounded transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-widest text-[10px]"
          >
            <Save className="w-4 h-4" />
            {submitting ? 'Saving Configuration...' : 'Save Configuration Changes'}
          </button>
        </form>
      </div>

      {/* 2. Security Section */}
      <div className="bg-white border border-gray-150/60 rounded p-6 sm:p-8 shadow-sm space-y-6">
        <h3 className="text-sm font-serif font-semibold text-[#2F4B3C] flex items-center gap-2 border-b border-gray-50 pb-3">
          <Key className="w-4.5 h-4.5 text-[#A65D3D]" /> Security & Access Controls
        </h3>

        <form onSubmit={handleSecuritySubmit} className="space-y-6 text-xs text-gray-600">
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900 text-xs font-serif text-[#2F4B3C] pb-1 border-b border-gray-50">Change Password</h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={securityForm.currentPassword}
                  onChange={handleSecurityChange}
                  className="w-full border border-gray-200 outline-none rounded py-2 px-3 text-gray-800 text-xs focus:border-[#2F4B3C]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={securityForm.newPassword}
                  onChange={handleSecurityChange}
                  onBlur={handleSecurityBlur}
                  className={getInputClass('newPassword', securityErrors, securityTouched)}
                />
                {securityTouched.newPassword && securityErrors.newPassword && (
                  <span className="text-red-500 font-bold text-[9px] tracking-wide flex items-center gap-1 mt-0.5">
                    <AlertTriangle className="w-3 h-3 shrink-0" /> {securityErrors.newPassword}
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={securityForm.confirmPassword}
                  onChange={handleSecurityChange}
                  onBlur={handleSecurityBlur}
                  className={getInputClass('confirmPassword', securityErrors, securityTouched)}
                />
                {securityTouched.confirmPassword && securityErrors.confirmPassword && (
                  <span className="text-red-500 font-bold text-[9px] tracking-wide flex items-center gap-1 mt-0.5">
                    <AlertTriangle className="w-3 h-3 shrink-0" /> {securityErrors.confirmPassword}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 2FA Setup Toggler */}
          <div className="space-y-4 border-t border-gray-50 pt-4">
            <h4 className="font-bold text-gray-900 text-xs font-serif text-[#2F4B3C] pb-1 border-b border-gray-50">Two-Factor Authentication (2FA)</h4>

            <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-150/60 rounded hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={twoFactorEnabled}
                onChange={handle2FAToggle}
                className="rounded text-[#2F4B3C] focus:ring-[#2F4B3C] w-4 h-4 cursor-pointer"
              />
              <div>
                <span className="font-bold text-gray-800 block text-xs">Require 2FA verification code</span>
                <span className="text-[10px] text-gray-400 font-light">Secure dashboard access using standard mobile authenticator apps.</span>
              </div>
            </label>
          </div>

          <button
            type="submit"
            disabled={Object.values(securityErrors).some(e => e !== '')}
            className="w-full bg-[#2F4B3C] disabled:bg-gray-300 disabled:text-gray-550 hover:bg-[#A65D3D] text-white font-bold py-3.5 rounded transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-widest text-[10px]"
          >
            <Save className="w-4 h-4" /> Save Password Changes
          </button>
        </form>
      </div>

      {/* 3. Database backups */}
      <div className="bg-white border border-gray-150/60 rounded p-6 sm:p-8 shadow-sm space-y-6">
        <h3 className="text-sm font-serif font-semibold text-[#2F4B3C] flex items-center gap-2 border-b border-gray-50 pb-3">
          <Database className="w-4.5 h-4.5 text-[#A65D3D]" /> Database Export & Archive
        </h3>

        <div className="space-y-4 text-xs text-gray-500 leading-relaxed font-light">
          <p>
            You can export the entire database system logs (including product lists, order histories, and staff schedules) as a single JSON file.
          </p>

          <button
            onClick={handleBackup}
            disabled={backingUp}
            className="bg-[#A65D3D] hover:bg-[#A65D3D]/90 text-white font-bold py-3.5 px-6 rounded transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer uppercase text-[9px] tracking-widest"
          >
            {backingUp ? 'Compiling JSON...' : 'Download JSON System Backup'}
          </button>
        </div>
      </div>

      {/* 2FA SETUP MODAL OVERLAY */}
      {is2FAModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 border border-gray-150/60 shadow-2xl relative animate-fade-in-up space-y-4 text-center text-xs">
            <h3 className="font-serif text-sm font-bold text-[#2F4B3C] flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600" /> Authenticator 2FA Setup
            </h3>

            <p className="text-gray-500 font-light leading-relaxed">
              Scan the QR reference below using your mobile authenticator app (Google Authenticator / Duo) or use the setup key.
            </p>

            {/* Simulated QR Code placeholder */}
            <div className="w-36 h-36 bg-gray-50 border border-gray-200 rounded mx-auto flex flex-col items-center justify-center gap-2 text-gray-300 font-mono text-[9px] relative">
              <div className="grid grid-cols-6 gap-1 w-24 h-24 p-1 bg-white border border-gray-300">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24].map(n => (
                  <div key={n} className={`w-3.5 h-3.5 ${n % 3 === 0 || n % 5 === 0 ? 'bg-gray-800' : 'bg-transparent'}`}></div>
                ))}
              </div>
              <span className="text-gray-400 block pt-0.5">Secret Key: RIPOMA-2FA-SEC</span>
            </div>

            <form onSubmit={verify2FACode} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block text-center">Enter 6-Digit Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 123456"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full border border-gray-200 outline-none rounded py-2 px-3 text-center text-sm font-bold tracking-widest text-gray-800 focus:border-[#2F4B3C]"
                />
              </div>

              <div className="flex gap-2 select-none justify-end">
                <button
                  type="button"
                  onClick={() => { setIs2FAModalOpen(false); setTwoFactorEnabled(false); }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-750 font-bold py-2 px-4 rounded uppercase text-[9px] tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#2F4B3C] hover:bg-[#A65D3D] text-white font-bold py-2 px-4 rounded uppercase text-[9px] tracking-wider"
                >
                  Verify Setup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminSettings;
