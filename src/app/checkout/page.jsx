'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  DownloadCloud,
  RefreshCw,
} from 'lucide-react';

export default function CheckoutPage() {
  const [product, setProduct] = useState(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');

  const pollIntervalRef = useRef(null);
  const activeOrderRef = useRef(null);

  const slug =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('product')
      : null;

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  // Preload Razorpay checkout script on page mount so it is instant and never blocked on mobile
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.Razorpay) {
      const existing = document.getElementById('rzp-checkout-script');
      if (!existing) {
        const script = document.createElement('script');
        script.id = 'rzp-checkout-script';
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
      }
    }
    return () => stopPolling();
  }, []);

  const checkStatus = async (orderNum, rzpId) => {
    if (!orderNum && !rzpId) return false;
    try {
      const q = new URLSearchParams();
      if (orderNum) q.set('orderNumber', orderNum);
      if (rzpId) q.set('razorpayOrderId', rzpId);
      const res = await fetch(`/api/checkout/status?${q.toString()}`);
      if (!res.ok) return false;
      const data = await res.json();
      if (data.status === 'PAID') {
        stopPolling();
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('dwb_active_checkout');
        }
        window.location.href = `/order/success?order=${encodeURIComponent(data.orderNumber || orderNum)}`;
        return true;
      }
    } catch (e) {
      console.warn('Status check poll error:', e);
    }
    return false;
  };

  const startPolling = (orderNum, rzpId) => {
    stopPolling();
    let attempts = 0;
    const maxAttempts = 60; // 60 attempts * 2.5s = 150 seconds
    pollIntervalRef.current = setInterval(async () => {
      attempts++;
      const isPaid = await checkStatus(orderNum, rzpId);
      if (isPaid || attempts >= maxAttempts) {
        stopPolling();
        if (attempts >= maxAttempts && !isPaid) {
          setVerifying(false);
          setPaying(false);
          setMessage('Payment confirmation is taking longer than expected. If money was debited, your file will arrive at your email shortly.');
          setMessageType('info');
        }
      }
    }, 2500);
  };

  // Handle mobile return from external UPI app (GPay / PhonePe / Paytm)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && activeOrderRef.current) {
        setVerifying(true);
        setMessage('Welcome back! Confirming your payment with banking network...');
        setMessageType('info');
        checkStatus(activeOrderRef.current.orderNumber, activeOrderRef.current.razorpayOrderId);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    // 1. Try to prefill user details if logged in
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          if (data.user.email) setEmail(data.user.email);
          const fullName =
            data.user.user_metadata?.full_name ||
            data.user.user_metadata?.name ||
            '';
          if (fullName) setName(fullName);
        }
      })
      .catch(() => {});

    // 2. Fetch product details
    if (slug) {
      fetch(`/api/products/${slug}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.product) setProduct(d.product);
          else setMessage('Product not found or unavailable.');
        })
        .catch(() => setMessage('Failed to load product details.'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
      setMessage('No product selected for checkout.');
    }

    // 3. Check for recently initiated order in case mobile browser refreshed
    try {
      const saved = sessionStorage.getItem('dwb_active_checkout');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.orderNumber && Date.now() - (parsed.createdAt || 0) < 30 * 60 * 1000) {
          setActiveOrder(parsed);
          activeOrderRef.current = parsed;
          setVerifying(true);
          setMessage('Checking previous payment status...');
          checkStatus(parsed.orderNumber, parsed.razorpayOrderId).then((isPaid) => {
            if (!isPaid) {
              setVerifying(false);
            }
          });
        }
      }
    } catch (e) {}
  }, [slug]);

  const openRazorpayModal = (data, cleanEmail) => {
    const active = {
      orderNumber: data.order.orderNumber,
      razorpayOrderId: data.order.razorpayOrderId,
      email: cleanEmail,
      createdAt: Date.now(),
    };
    setActiveOrder(active);
    activeOrderRef.current = active;

    try {
      sessionStorage.setItem('dwb_active_checkout', JSON.stringify(active));
    } catch (e) {}

    // Start background polling immediately (helps auto-detect QR code scan on PC or UPI app on Mobile)
    startPolling(data.order.orderNumber, data.order.razorpayOrderId);

    const options = {
      key: data.keyId,
      amount: data.order.amount,
      currency: data.order.currency,
      name: 'DavinciWaleBhaiya',
      description: product.name,
      order_id: data.order.razorpayOrderId,
      prefill: {
        email: cleanEmail,
        name: name.trim() || '',
      },
      theme: {
        color: '#2563eb',
      },
      handler: async (response) => {
        stopPolling();
        setMessage('Verifying payment and sending file to your email...');
        setMessageType('info');
        setVerifying(true);

        const payload = {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        };

        for (let i = 0; i < 3; i++) {
          try {
            if (i > 0) {
              setMessage('Confirming payment with banking network, please wait...');
              await new Promise((r) => setTimeout(r, 1000));
            }

            const verified = await fetch('/api/checkout/verify', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify(payload),
            });

            const resData = await verified.json();
            if (verified.ok && resData.orderNumber) {
              try {
                sessionStorage.removeItem('dwb_active_checkout');
              } catch (e) {}
              window.location.href = `/order/success?order=${encodeURIComponent(resData.orderNumber)}`;
              return;
            }

            if (i === 2) {
              setMessage(resData?.error || 'Payment verification incomplete. Please contact support.');
              setMessageType('error');
              setPaying(false);
            }
          } catch (err) {
            console.error('Verification attempt error:', err);
            if (i === 2) {
              setMessage('Network issue during verification. If money was debited, your file will arrive on email.');
              setMessageType('error');
              setPaying(false);
            }
          }
        }

        // Fallback status check
        const paid = await checkStatus(data.order.orderNumber, data.order.razorpayOrderId);
        if (!paid) {
          setVerifying(false);
        }
      },
      modal: {
        ondismiss: () => {
          // On mobile, switching to UPI app (GPay/PhonePe) or closing modal triggers ondismiss.
          // We do NOT dismiss immediately! We check status in case payment was captured.
          setVerifying(true);
          setMessage('Checking payment confirmation with your UPI app / bank...');
          setMessageType('info');

          checkStatus(data.order.orderNumber, data.order.razorpayOrderId).then((isPaid) => {
            if (!isPaid) {
              // Keep polling in background for up to 60s
              startPolling(data.order.orderNumber, data.order.razorpayOrderId);
            }
          });
        },
      },
    };

    const checkout = new window.Razorpay(options);
    checkout.open();
  };

  const pay = async () => {
    if (!product) return;

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setMessage('Please enter a valid email address where we will send your file.');
      setMessageType('error');
      return;
    }

    setPaying(true);
    setVerifying(false);
    setMessage('Connecting to secure Razorpay payment gateway...');
    setMessageType('info');

    try {
      const result = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          productIds: [product.id],
          email: cleanEmail,
          name: name.trim(),
        }),
      });

      const data = await result.json();

      if (!result.ok) {
        setPaying(false);
        setMessage(data.error || 'Checkout is currently unavailable. Please try again.');
        setMessageType('error');
        return;
      }

      // If Razorpay script is already loaded
      if (typeof window !== 'undefined' && window.Razorpay) {
        openRazorpayModal(data, cleanEmail);
      } else {
        // Fallback load script if not yet ready
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => openRazorpayModal(data, cleanEmail);
        script.onerror = () => {
          setPaying(false);
          setMessage('Payment gateway script failed to load. Please check your internet connection.');
          setMessageType('error');
        };
        document.body.appendChild(script);
      }
    } catch (err) {
      console.error(err);
      setPaying(false);
      setMessage('Failed to initialize payment gateway.');
      setMessageType('error');
    }
  };

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-black px-4 sm:px-6 py-16 sm:py-24 text-white">
      <div className="w-full max-w-lg space-y-6">
        
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Store</span>
        </Link>

        {/* Checkout Card */}
        <section className="w-full rounded-3xl border border-white/10 bg-[#080d1a]/90 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-6">
          
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[.25em] text-blue-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Secure Checkout</span>
            </div>
            <span className="text-[10px] font-mono text-white/40 uppercase">256-Bit SSL</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-white/50 space-y-3">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-400" />
              <p className="text-xs font-mono">Loading order information...</p>
            </div>
          ) : product ? (
            <>
              {/* Product Info */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400/80">
                  {product.category?.name || product.category || 'Digital Tool'}
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  {product.name}
                </h1>
                {product.shortDescription && (
                  <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                    {product.shortDescription}
                  </p>
                )}
              </div>

              {/* Delivery Email Input (No Login Needed) */}
              <div className="space-y-3 rounded-2xl border border-blue-500/25 bg-blue-950/20 p-4 sm:p-5">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-300">
                  <Mail className="w-4 h-4 text-blue-400" />
                  <span>Enter Your Email for File Delivery</span>
                </div>
                <p className="text-xs text-white/65 leading-relaxed">
                  Apna email address daalein. Payment hote hi download link aur file automatically aapke isi email pe bhej di jayegi.
                </p>
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-mono text-white/70 uppercase tracking-wider mb-1.5">
                      Your Email Address <span className="text-blue-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (messageType === 'error') setMessage('');
                        }}
                        placeholder="apnamail@gmail.com"
                        className="w-full rounded-xl border border-white/20 bg-black/60 pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-white/50 uppercase tracking-wider mb-1.5">
                      Your Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Name"
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>No account / login required &bull; Direct email delivery</span>
                </div>
              </div>

              {/* Order Total */}
              <div className="flex items-center justify-between border-y border-white/[0.08] py-4">
                <div>
                  <span className="text-xs text-white/50 block font-mono">TOTAL DUE</span>
                  <span className="text-[10px] text-white/40 font-mono">Includes Lifetime Commercial License</span>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white font-mono">
                  ₹{product.price?.toLocaleString()}
                </div>
              </div>

              {/* Verifying / Checking State Banner */}
              {verifying && activeOrder && (
                <div className="rounded-2xl border border-blue-500/40 bg-blue-950/40 p-4 space-y-3">
                  <div className="flex items-center gap-2.5 text-sm font-semibold text-blue-200">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-400 shrink-0" />
                    <span>Confirming payment with banking network...</span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed">
                    Agar aapne Google Pay, PhonePe, Paytm ya QR code se pay kar diya hai, please thoda wait karein. Verification complete hote hi file download automatically khul jayegi.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => checkStatus(activeOrder.orderNumber, activeOrder.razorpayOrderId)}
                      className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-500 py-2.5 px-3 text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Check Payment Status</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        stopPolling();
                        setVerifying(false);
                        setPaying(false);
                      }}
                      className="rounded-xl border border-white/10 hover:border-white/20 py-2.5 px-3 text-xs font-mono text-white/60 hover:text-white transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              {/* Messages / Alerts */}
              {message && !verifying && (
                <div
                  className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs ${
                    messageType === 'error'
                      ? 'bg-red-950/40 border-red-500/30 text-red-200'
                      : 'bg-blue-950/40 border-blue-500/30 text-blue-200'
                  }`}
                >
                  {messageType === 'error' ? (
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  ) : (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-400 shrink-0" />
                  )}
                  <span>{message}</span>
                </div>
              )}

              {/* Pay Button - Direct Razorpay Payment without Login */}
              <button
                type="button"
                disabled={paying || verifying}
                onClick={pay}
                className="w-full rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] py-4 text-sm font-bold text-white shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {paying || verifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay ₹{product.price?.toLocaleString()} via Razorpay</span>
                  </>
                )}
              </button>

              {/* Guarantee Footer & Compliance */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-center gap-4 text-[10px] font-mono text-white/40">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    UPI / Cards / NetBanking
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <DownloadCloud className="w-3 h-3 text-blue-400" />
                    Instant Zip Delivery
                  </span>
                </div>
                <p className="text-center text-[10px] text-white/40 font-mono">
                  By purchasing you agree to our{' '}
                  <Link href="/terms" target="_blank" className="underline hover:text-white">Terms</Link>,{' '}
                  <Link href="/privacy" target="_blank" className="underline hover:text-white">Privacy</Link> &{' '}
                  <Link href="/refund-policy" target="_blank" className="underline hover:text-white">Refund Policy</Link>.
                </p>
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-white/50 space-y-4">
              <p className="text-sm">{message || 'Product not found.'}</p>
              <Link
                href="/"
                className="inline-block px-5 py-2 rounded-xl bg-white text-black text-xs font-semibold"
              >
                Return to Catalogue
              </Link>
            </div>
          )}

        </section>

      </div>
    </main>
  );
}
