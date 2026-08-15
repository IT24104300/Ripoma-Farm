import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { ShieldCheck, Lock, ArrowRight, AlertTriangle, KeyRound, Loader } from 'lucide-react';
import { ValidatedInput, PasswordInputWithMeter, TwoFactorCodeInput } from '../components/FormFields';
import RipomaLogo from '../components/RipomaLogo';

export const AdminLogin = ({ onSuccess }) => {
  const { adminLogin, adminVerify2FA } = useContext(AuthContext);
  const { showToast } = useContext(NotificationContext);

  const [step, setStep] = useState('credentials'); // 'credentials' | '2fa'
  const [form, setForm] = useState({ email: 'admin@ripomafarm.com', password: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [rememberDevice, setRememberDevice] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // 2FA state
  const [tempToken, setTempToken] = useState(null);
  const [twoFactorError, setTwoFactorError] = useState('');

  // Shake & Lockout state
  const [shake, setShake] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState(null);

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
      else if (value.length < 10) err = 'Admin password must be at least 10 characters';
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
    const passErr = validateField('password', form.password);

    setErrors({ email: emailErr, password: passErr });
    setTouched({ email: true, password: true });

    if (emailErr || passErr) {
      triggerShake();
      return;
    }

    setSubmitting(true);
    const res = await adminLogin(form.email, form.password);
    setSubmitting(false);

    if (res.success && res.data?.require2FA) {
      setTempToken(res.data.tempToken);
      setStep('2fa');
      showToast('Primary credentials accepted. Please enter 2FA passcode.', 'info');
    } else if (res.status === 423) {
      const lockoutTime = Date.now() + 15 * 60 * 1000;
      setLockoutUntil(lockoutTime);
      showToast(res.message || 'Account locked out due to multiple failed attempts.', 'error');
      triggerShake();
    } else {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      showToast(res.message || `Invalid admin credentials. Attempt ${newAttempts}/5.`, 'error');
      triggerShake();
    }
  };

  const handleTwoFactorSubmit = async (code) => {
    if (!tempToken) {
      showToast('2FA challenge expired. Please re-enter credentials.', 'error');
      setStep('credentials');
      return;
    }

    setSubmitting(true);
    const res = await adminVerify2FA(tempToken, code);
    setSubmitting(false);

    if (res.success) {
      showToast('Administrative session authenticated successfully!', 'success');
      if (onSuccess) onSuccess();
    } else {
      setTwoFactorError(res.message || 'Invalid 2FA passcode. Try simulated code: 123456');
      triggerShake();
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 font-sans text-left"
      style={{
        background: 'linear-gradient(135deg, #D9C4A3 0%, #C5AD8C 40%, #B09070 100%)',
        backgroundImage: `
          linear-gradient(135deg, #D9C4A3 0%, #C5AD8C 40%, #B09070 100%),
          url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h30v30H0zM30 30h30v30H30z' fill='%238A6A4B' fill-opacity='0.04'/%3E%3C/svg%3E")
        `,
      }}
    >
      {/* Kraft-paper card */}
      <div
        className={`w-full max-w-md relative overflow-hidden ${shake ? 'animate-form-shake' : ''}`}
        style={{
          background: 'linear-gradient(160deg, #F2E8D5 0%, #EAD9BE 100%)',
          border: '2px solid #C5AD8C',
          borderRadius: '1rem',
          boxShadow: '0 12px 48px rgba(58,43,29,0.3), inset 0 0 0 4px rgba(255,255,255,0.35)',
        }}
      >
        {/* Stitched inner border */}
        <div
          className="absolute inset-2 rounded-lg pointer-events-none"
          style={{ border: '1.5px dashed #C5AD8C' }}
          aria-hidden="true"
        />

        {/* Wax seal corner decoration */}
        <div className="absolute top-4 right-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(47,75,60,0.12)', border: '1.5px dashed #2F4B3C' }}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#2F4B3C" strokeWidth="1.5">
              <path d="M12 2l3 7h7l-5.5 4.5 2 7L12 17l-6.5 3.5 2-7L2 9h7z" />
            </svg>
          </div>
        </div>

        <div className="p-8 relative z-10">
          {/* Brand header */}
          <div className="text-center mb-7 space-y-2">
            <div className="flex justify-center">
              <RipomaLogo variant="full" color="color" height={52} />
            </div>
            {/* Hand-lettered "Welcome back" */}
            <div className="font-handwritten text-2xl font-bold" style={{ color: '#5C4630' }}>
              {step === 'credentials' ? 'Welcome back, farmer 👋' : 'Security Verification'}
            </div>
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest font-sans"
              style={{ background: 'rgba(47,75,60,0.1)', border: '1px solid rgba(47,75,60,0.15)', color: '#2F4B3C' }}
            >
              <ShieldCheck className="w-3.5 h-3.5" style={{ color: '#C99A3A' }} /> Isolated Admin Portal
            </div>
            <p className="text-xs font-sans font-light" style={{ color: '#8A6A4B' }}>
              {step === 'credentials' ? 'Restricted Operational Access (Min 10 chars)' : 'Two-Factor Authentication Required'}
            </p>
          </div>

          {/* Lockout Banner */}
          {lockoutUntil && Date.now() < lockoutUntil && (
            <div className="mb-6 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 font-sans" style={{ background: 'rgba(181,72,77,0.12)', border: '1px solid rgba(181,72,77,0.3)', color: '#B5484D' }}>
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Portal Locked Out. Try again in {Math.ceil((lockoutUntil - Date.now()) / 60000)} minutes.</span>
            </div>
          )}

          {/* STEP 1: CREDENTIALS */}
          {step === 'credentials' && (
            <form onSubmit={handleCredentialsSubmit} noValidate className="space-y-2">
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
                label="Admin Secret Key / Password (Min 10 Chars)"
                value={form.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onBlur={(e) => handleBlur('password', e.target.value)}
                error={errors.password}
                touched={touched.password}
                isValid={!errors.password}
                required
                showStrengthMeter={false}
              />

              {/* Remember Device */}
              <div className="flex items-center justify-between py-2 text-xs font-sans" style={{ color: '#5C4630' }}>
                <span>Remember this secure workstation</span>
                <button
                  type="button"
                  onClick={() => setRememberDevice(!rememberDevice)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer`}
                  style={{ background: rememberDevice ? '#5C4630' : '#C5AD8C' }}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 transform ${rememberDevice ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              <button
                type="submit"
                disabled={(lockoutUntil && Date.now() < lockoutUntil) || submitting}
                className="w-full mt-4 py-3.5 active:scale-[0.99] disabled:opacity-40 font-handwritten font-bold text-base tracking-wide rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                style={{ background: '#5C4630', color: '#F2E8D5', border: '2px solid #3A2B1D' }}
              >
                {submitting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Authenticate & Verify 2FA</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-4 text-center" style={{ borderTop: '1px dashed #C5AD8C' }}>
                <span className="text-[10px] font-sans block" style={{ color: '#8A6A4B' }}>Demo Super Admin:</span>
                <span className="text-xs font-handwritten font-bold" style={{ color: '#5C4630' }}>admin@ripomafarm.com / Admin@1234</span>
              </div>
            </form>
          )}

          {/* STEP 2: 2FA */}
          {step === '2fa' && (
            <div className="text-center animate-fade-in-up">
              <div className="flex items-center justify-center gap-2 font-handwritten font-bold text-base mb-2" style={{ color: '#5C4630' }}>
                <KeyRound className="w-4 h-4" style={{ color: '#C99A3A' }} />
                <span>Enter 6-Digit Authenticator Code</span>
              </div>
              <p className="text-xs font-sans mb-4" style={{ color: '#8A6A4B' }}>
                Enter the code from your authenticator app (Demo: <strong style={{ color: '#5C4630' }}>123456</strong>).
              </p>
              <TwoFactorCodeInput onComplete={handleTwoFactorSubmit} error={twoFactorError} />
              <button
                type="button"
                onClick={() => setStep('credentials')}
                className="text-xs font-sans underline cursor-pointer mt-3 hover:opacity-70 transition-opacity"
                style={{ color: '#8A6A4B' }}
              >
                ← Back to credentials
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
