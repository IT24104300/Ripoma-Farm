import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { ShieldCheck, Lock, ArrowRight, AlertTriangle, KeyRound } from 'lucide-react';
import { HenIcon } from '../components/FarmIcons';
import { ValidatedInput, PasswordInputWithMeter, TwoFactorCodeInput } from '../components/FormFields';

export const AdminLogin = ({ onSuccess }) => {
  const { login } = useContext(AuthContext);
  const { showToast } = useContext(NotificationContext);

  const [step, setStep] = useState('credentials'); // 'credentials' | '2fa'
  const [form, setForm] = useState({ email: 'admin@ripomafarm.com', password: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [rememberDevice, setRememberDevice] = useState(true);

  // Shake & Lockout state
  const [shake, setShake] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState(null);
  const [twoFactorError, setTwoFactorError] = useState('');

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const validateField = (name, value) => {
    let err = '';
    if (name === 'email') {
      if (!value.trim()) err = 'Admin email required';
      else if (!/\S+@\S+\.\S+/.test(value)) err = 'Invalid email address format';
    } else if (name === 'password') {
      if (!value) err = 'Password required';
      else if (value.length < 6) err = 'Password must be at least 6 characters';
    }
    return err;
  };

  const handleInputChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (name, value) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();

    if (lockoutUntil && Date.now() < lockoutUntil) {
      const remainingMin = Math.ceil((lockoutUntil - Date.now()) / 60000);
      showToast(`Admin portal locked out. Try again in ${remainingMin} mins.`, 'error');
      triggerShake();
      return;
    }

    const emailErr = validateField('email', form.email);
    const pwdErr = validateField('password', form.password);

    setErrors({ email: emailErr, password: pwdErr });
    setTouched({ email: true, password: true });

    if (emailErr || pwdErr) {
      triggerShake();
      return;
    }

    // Try logging in
    const res = await login(form.email, form.password);
    if (res.success) {
      // Advance to 2FA Step for modern security feel
      setStep('2fa');
      showToast('Credentials verified. Please enter 2FA security code.', 'info');
    } else {
      triggerShake();
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);
      if (nextAttempts >= 5) {
        setLockoutUntil(Date.now() + 15 * 60 * 1000);
        showToast('5 failed attempts. Admin access locked for 15 minutes.', 'error');
      } else {
        showToast(`Invalid admin credentials. (${nextAttempts}/5 attempts)`, 'error');
      }
    }
  };

  const handle2FAComplete = (code) => {
    if (code === '123456' || code.length === 6) {
      showToast('2FA Authentication Granted. Welcome Admin!', 'success');
      if (onSuccess) onSuccess();
    } else {
      triggerShake();
      setTwoFactorError('Invalid 2FA code. Try 123456 for demo.');
    }
  };

  return (
    <div className="min-h-screen bg-[#1E3328] flex items-center justify-center p-4 font-sans text-left">
      <div
        className={`w-full max-w-md bg-[#2F4B3C] border border-white/10 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden ${
          shake ? 'animate-form-shake' : ''
        }`}
      >
        {/* Subtle Background Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#A65D3D]/20 rounded-full blur-3xl" />

        {/* Brand Lock Header */}
        <div className="text-center mb-8 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-[#F6EFE3] mx-auto mb-3 shadow-inner">
            <ShieldCheck className="w-7 h-7 text-[#C99A3A]" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#F6EFE3]">Ripoma Admin Portal</h2>
          <p className="text-xs text-white/60 mt-1 uppercase tracking-widest font-semibold">
            {step === 'credentials' ? 'Restrained Operational Access' : 'Two-Factor Authentication Required'}
          </p>
        </div>

        {/* Lockout Banner */}
        {lockoutUntil && Date.now() < lockoutUntil && (
          <div className="mb-6 p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-xs font-semibold text-red-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>Portal Locked Out. Try again in {Math.ceil((lockoutUntil - Date.now()) / 60000)} minutes.</span>
          </div>
        )}

        {/* STEP 1: CREDENTIALS */}
        {step === 'credentials' && (
          <form onSubmit={handleCredentialsSubmit} noValidate className="space-y-2 relative z-10">
            <ValidatedInput
              id="admin-email"
              name="email"
              type="email"
              label="Admin Email Address"
              value={form.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              onBlur={(e) => handleBlur('email', e.target.value)}
              error={errors.email}
              touched={touched.email}
              isValid={!errors.email}
              placeholder="admin@ripomafarm.com"
              required
            />

            <PasswordInputWithMeter
              id="admin-password"
              name="password"
              label="Admin Secret Key / Password"
              value={form.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              onBlur={(e) => handleBlur('password', e.target.value)}
              error={errors.password}
              touched={touched.password}
              isValid={!errors.password}
              required
              showStrengthMeter={false}
            />

            {/* Remember Device Switch */}
            <div className="flex items-center justify-between py-2 text-xs text-white/80">
              <span>Remember this secure device</span>
              <button
                type="button"
                onClick={() => setRememberDevice(!rememberDevice)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                  rememberDevice ? 'bg-[#A65D3D]' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 transform ${
                    rememberDevice ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <button
              type="submit"
              disabled={lockoutUntil && Date.now() < lockoutUntil}
              className="w-full mt-4 py-3.5 bg-[#A65D3D] hover:bg-[#A65D3D]/90 active:scale-[0.99] disabled:opacity-40 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Verify Admin Access</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-4 text-center border-t border-white/10">
              <span className="text-[10px] text-white/50 block">Demo Admin Credentials:</span>
              <span className="text-xs text-[#C99A3A] font-semibold">admin@ripomafarm.com / admin123</span>
            </div>
          </form>
        )}

        {/* STEP 2: 2FA CODE ENTRY */}
        {step === '2fa' && (
          <div className="relative z-10 text-center animate-fade-in-up">
            <div className="flex items-center justify-center gap-2 text-xs text-[#C99A3A] font-bold mb-2">
              <KeyRound className="w-4 h-4" />
              <span>Enter 6-Digit Authenticator Code</span>
            </div>
            <p className="text-xs text-white/70 mb-4">
              Enter the code generated by your authenticator app (Demo: type any 6 digits e.g. <strong className="text-white">123456</strong>).
            </p>

            <TwoFactorCodeInput onComplete={handle2FAComplete} error={twoFactorError} />

            <button
              type="button"
              onClick={() => setStep('credentials')}
              className="text-xs text-white/60 hover:text-white underline cursor-pointer mt-2"
            >
              ← Back to credentials
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;
