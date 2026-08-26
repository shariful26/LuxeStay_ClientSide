import React, { useState, useEffect } from 'react';
import { CreditCard, Key, ShieldCheck, CheckCircle2, AlertCircle, Save, Loader2, Sparkles, Lock, DollarSign, Globe, ToggleLeft, ToggleRight } from 'lucide-react';
import { PortalLayout } from '../../components/PortalLayout';

export const AdminPaymentSettings = () => {
  const [settings, setSettings] = useState({
    mode: 'test',
    gateways: {
      stripe: { enabled: true, livePk: '', liveSk: '', testPk: 'pk_test_luxestay_demo_key', testSk: 'sk_test_luxestay_demo_key' },
      paypal: { enabled: true, clientId: '', clientSecret: '' },
      razorpay: { enabled: true, keyId: '', keySecret: '' },
      payoneer: { enabled: true, merchantId: '', apiToken: '' },
      pay_at_hotel: { enabled: true }
    }
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState('stripe');

  useEffect(() => {
    fetch('/api/admin/payment-settings')
      .then(res => res.json())
      .then(data => {
        if (data && data.mode) {
          setSettings(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleModeToggle = (newMode) => {
    setSettings(prev => ({
      ...prev,
      mode: newMode
    }));
  };

  const handleGatewayToggle = (gatewayKey) => {
    setSettings(prev => ({
      ...prev,
      gateways: {
        ...prev.gateways,
        [gatewayKey]: {
          ...prev.gateways[gatewayKey],
          enabled: !prev.gateways[gatewayKey]?.enabled
        }
      }
    }));
  };

  const handleFieldChange = (gatewayKey, field, value) => {
    setSettings(prev => ({
      ...prev,
      gateways: {
        ...prev.gateways,
        [gatewayKey]: {
          ...prev.gateways[gatewayKey],
          [field]: value
        }
      }
    }));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setSaveSuccessMsg('');
    try {
      const res = await fetch('/api/admin/payment-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      setSaving(false);
      setSaveSuccessMsg(data.message || 'Payment settings saved successfully!');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err) {
      setSaving(false);
    }
  };

  return (
    <PortalLayout role="admin" title="Payment Gateways & API Settings">
      <div className="space-y-6 animate-fade-in pb-12">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-amber-500" /> Payment Gateways & API Key Control
            </h1>
            <p className="text-xs text-[var(--text-secondary)]">Manage live production merchant keys, sandbox test environment and payment methods</p>
          </div>

          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="btn btn-primary py-3 px-6 text-xs font-bold shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer self-start md:self-auto"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Save className="w-4 h-4" />}
            <span>Save Payment Settings</span>
          </button>
        </div>

        {/* Success Alert Banner */}
        {saveSuccessMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fade-in shadow-md">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* ENVIRONMENT MODE SWITCHER CARD */}
        <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-light)]">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-500 flex items-center gap-1.5 mb-1">
                <Sparkles className="w-4 h-4" /> Global Platform Environment Mode
              </span>
              <h3 className="text-lg font-extrabold text-[var(--text-primary)]">
                Current Status: {settings.mode === 'live' ? (
                  <span className="text-emerald-500 inline-flex items-center gap-1">🚀 LIVE PRODUCTION MODE</span>
                ) : (
                  <span className="text-amber-500 inline-flex items-center gap-1">🧪 SANDBOX TEST MODE</span>
                )}
              </h3>
            </div>

            {/* Toggle Mode Buttons */}
            <div className="flex items-center p-1.5 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] self-start sm:self-auto">
              <button
                type="button"
                onClick={() => handleModeToggle('test')}
                className={`py-2 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  settings.mode === 'test'
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                🧪 Test Mode (Sandbox)
              </button>
              <button
                type="button"
                onClick={() => handleModeToggle('live')}
                className={`py-2 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  settings.mode === 'live'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                🚀 Live Mode (Production)
              </button>
            </div>
          </div>

          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {settings.mode === 'test' ? (
              <span className="text-amber-400 font-semibold">
                ℹ️ Test Sandbox Mode is active. Customers can test purchases using demo credit card credentials without charging real money.
              </span>
            ) : (
              <span className="text-emerald-400 font-semibold">
                ⚡ Live Production Mode is active. Real payments will be processed directly through your configured merchant API gateways.
              </span>
            )}
          </p>
        </div>

        {/* GATEWAY SETTINGS TABS & CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Navigation Tabs */}
          <div className="lg:col-span-1 space-y-2">
            {[
              { id: 'stripe', name: 'Stripe Gateway', desc: 'Credit / Debit Cards' },
              { id: 'paypal', name: 'PayPal Express', desc: 'Global Digital Wallet' },
              { id: 'razorpay', name: 'Razorpay UPI', desc: 'International & UPI' },
              { id: 'payoneer', name: 'Payoneer Merchant', desc: 'Cross-border B2B' },
              { id: 'pay_at_hotel', name: 'Pay at Hotel', desc: 'Cash / Card Check-In' }
            ].map(tab => {
              const isEnabled = settings.gateways[tab.id]?.enabled !== false;
              const isActive = activeTab === tab.id;
              return (
                <div
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    isActive
                      ? 'border-amber-500 bg-amber-500/10 text-amber-500 shadow-md'
                      : 'border-[var(--border-light)] bg-[var(--bg-card)] hover:border-amber-500/40 text-[var(--text-primary)]'
                  }`}
                >
                  <div>
                    <div className="text-xs font-extrabold">{tab.name}</div>
                    <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{tab.desc}</div>
                  </div>
                  <span className={`w-2.5 h-2.5 rounded-full ${isEnabled ? 'bg-emerald-500 shadow-xs' : 'bg-slate-500'}`} />
                </div>
              );
            })}
          </div>

          {/* Right Gateway Configuration Form Card */}
          <div className="lg:col-span-3 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] p-6 sm:p-8 shadow-xl space-y-6">
            
            {/* STRIPE */}
            {activeTab === 'stripe' && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center justify-between pb-4 border-b border-[var(--border-light)]">
                  <div>
                    <h3 className="text-lg font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-amber-500" /> Stripe Credit & Debit Card Gateway
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)]">Accept Visa, Mastercard, American Express and Apple/Google Pay</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleGatewayToggle('stripe')}
                    className="flex items-center gap-2 text-xs font-bold cursor-pointer"
                  >
                    {settings.gateways.stripe?.enabled !== false ? (
                      <span className="text-emerald-500 font-extrabold flex items-center gap-1">
                        <ToggleRight className="w-6 h-6" /> Enabled
                      </span>
                    ) : (
                      <span className="text-slate-400 font-extrabold flex items-center gap-1">
                        <ToggleLeft className="w-6 h-6" /> Disabled
                      </span>
                    )}
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1">
                      <Key className="w-3.5 h-3.5 text-amber-500" /> Stripe Live Publishable Key (pk_live_...)
                    </label>
                    <input
                      type="text"
                      value={settings.gateways.stripe?.livePk || ''}
                      onChange={(e) => handleFieldChange('stripe', 'livePk', e.target.value)}
                      placeholder="pk_live_luxestay_prod_key..."
                      className="w-full p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-xs text-[var(--text-primary)] font-mono outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-rose-500" /> Stripe Live Secret Key (sk_live_...)
                    </label>
                    <input
                      type="password"
                      value={settings.gateways.stripe?.liveSk || ''}
                      onChange={(e) => handleFieldChange('stripe', 'liveSk', e.target.value)}
                      placeholder="sk_live_luxestay_prod_key..."
                      className="w-full p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-xs text-[var(--text-primary)] font-mono outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1">
                    <span className="font-bold text-amber-500">🧪 Sandbox Test Credentials:</span>
                    <p className="text-[11px] text-[var(--text-secondary)] font-mono">
                      Test PK: {settings.gateways.stripe?.testPk || 'pk_test_luxe123'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* PAYPAL */}
            {activeTab === 'paypal' && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center justify-between pb-4 border-b border-[var(--border-light)]">
                  <div>
                    <h3 className="text-lg font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                      <Globe className="w-5 h-5 text-amber-500" /> PayPal International Express Checkout
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)]">Accept PayPal Account balance & Pay-in-4 installment payments</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleGatewayToggle('paypal')}
                    className="flex items-center gap-2 text-xs font-bold cursor-pointer"
                  >
                    {settings.gateways.paypal?.enabled !== false ? (
                      <span className="text-emerald-500 font-extrabold flex items-center gap-1">
                        <ToggleRight className="w-6 h-6" /> Enabled
                      </span>
                    ) : (
                      <span className="text-slate-400 font-extrabold flex items-center gap-1">
                        <ToggleLeft className="w-6 h-6" /> Disabled
                      </span>
                    )}
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      PayPal Live Client ID
                    </label>
                    <input
                      type="text"
                      value={settings.gateways.paypal?.clientId || ''}
                      onChange={(e) => handleFieldChange('paypal', 'clientId', e.target.value)}
                      placeholder="client_id_live_A1B2C3D4E5..."
                      className="w-full p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-xs text-[var(--text-primary)] font-mono outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      PayPal Live Secret Key
                    </label>
                    <input
                      type="password"
                      value={settings.gateways.paypal?.clientSecret || ''}
                      onChange={(e) => handleFieldChange('paypal', 'clientSecret', e.target.value)}
                      placeholder="client_secret_live_X9Y8Z7..."
                      className="w-full p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-xs text-[var(--text-primary)] font-mono outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* RAZORPAY */}
            {activeTab === 'razorpay' && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center justify-between pb-4 border-b border-[var(--border-light)]">
                  <div>
                    <h3 className="text-lg font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-amber-500" /> Razorpay 3D-Secure International
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)]">Accept UPI, NetBanking and South Asian Cards</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleGatewayToggle('razorpay')}
                    className="flex items-center gap-2 text-xs font-bold cursor-pointer"
                  >
                    {settings.gateways.razorpay?.enabled !== false ? (
                      <span className="text-emerald-500 font-extrabold flex items-center gap-1">
                        <ToggleRight className="w-6 h-6" /> Enabled
                      </span>
                    ) : (
                      <span className="text-slate-400 font-extrabold flex items-center gap-1">
                        <ToggleLeft className="w-6 h-6" /> Disabled
                      </span>
                    )}
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Razorpay Key ID (rzp_live_...)
                    </label>
                    <input
                      type="text"
                      value={settings.gateways.razorpay?.keyId || ''}
                      onChange={(e) => handleFieldChange('razorpay', 'keyId', e.target.value)}
                      placeholder="rzp_live_123456789..."
                      className="w-full p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-xs text-[var(--text-primary)] font-mono outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Razorpay Key Secret
                    </label>
                    <input
                      type="password"
                      value={settings.gateways.razorpay?.keySecret || ''}
                      onChange={(e) => handleFieldChange('razorpay', 'keySecret', e.target.value)}
                      placeholder="key_secret_live_abc..."
                      className="w-full p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-xs text-[var(--text-primary)] font-mono outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PAYONEER */}
            {activeTab === 'payoneer' && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center justify-between pb-4 border-b border-[var(--border-light)]">
                  <div>
                    <h3 className="text-lg font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-amber-500" /> Payoneer B2B Merchant Gateway
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)]">Accept Payoneer Direct Account transfers & corporate travel billing</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleGatewayToggle('payoneer')}
                    className="flex items-center gap-2 text-xs font-bold cursor-pointer"
                  >
                    {settings.gateways.payoneer?.enabled !== false ? (
                      <span className="text-emerald-500 font-extrabold flex items-center gap-1">
                        <ToggleRight className="w-6 h-6" /> Enabled
                      </span>
                    ) : (
                      <span className="text-slate-400 font-extrabold flex items-center gap-1">
                        <ToggleLeft className="w-6 h-6" /> Disabled
                      </span>
                    )}
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Payoneer Merchant Account ID
                    </label>
                    <input
                      type="text"
                      value={settings.gateways.payoneer?.merchantId || ''}
                      onChange={(e) => handleFieldChange('payoneer', 'merchantId', e.target.value)}
                      placeholder="merchant_id_98765..."
                      className="w-full p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-xs text-[var(--text-primary)] font-mono outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Payoneer API Access Token
                    </label>
                    <input
                      type="password"
                      value={settings.gateways.payoneer?.apiToken || ''}
                      onChange={(e) => handleFieldChange('payoneer', 'apiToken', e.target.value)}
                      placeholder="payoneer_api_token_..."
                      className="w-full p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] text-xs text-[var(--text-primary)] font-mono outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PAY AT HOTEL */}
            {activeTab === 'pay_at_hotel' && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center justify-between pb-4 border-b border-[var(--border-light)]">
                  <div>
                    <h3 className="text-lg font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-amber-500" /> Pay at Hotel Reception (Zero Deposit)
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)]">Allow guests to reserve rooms online and pay Cash or Card upon check-in</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleGatewayToggle('pay_at_hotel')}
                    className="flex items-center gap-2 text-xs font-bold cursor-pointer"
                  >
                    {settings.gateways.pay_at_hotel?.enabled !== false ? (
                      <span className="text-emerald-500 font-extrabold flex items-center gap-1">
                        <ToggleRight className="w-6 h-6" /> Enabled
                      </span>
                    ) : (
                      <span className="text-slate-400 font-extrabold flex items-center gap-1">
                        <ToggleLeft className="w-6 h-6" /> Disabled
                      </span>
                    )}
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs leading-relaxed font-medium">
                  ℹ️ When enabled, guests can confirm room reservations instantly without upfront online card payment. Hotel reception collects full payment during check-in.
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </PortalLayout>
  );
};
