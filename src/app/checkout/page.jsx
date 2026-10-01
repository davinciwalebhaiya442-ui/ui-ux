'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShoppingBag,
  DownloadCloud,
} from 'lucide-react';

export default function CheckoutPage() {
  const [product, setProduct] = useState(null);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');

  const slug =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('product')
      : null;

  useEffect(() => {
    // 1. Check user authentication
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {})
      .finally(() => setAuthChecked(true));

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
  }, [slug]);

  const pay = async () => {
    if (!product) return;

    if (!user) {
      setMessage('Please login first so we can deliver the zip file to your email.');
      setMessageType('error');
      const nextUrl = `/checkout?product=${encodeURIComponent(product.slug || product.id)}`;
      window.location.href = `/login?next=${encodeURIComponent(nextUrl)}`;
      return;
    }

    setPaying(true);
    setMessage('Connecting to secure Razorpay payment gateway...');
    setMessageType('info');

    try {
      const result = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ productIds: [product.id] }),
      });

      const data = await result.json();

      if (!result.ok) {
        setPaying(false);
        setMessage(data.error || 'Checkout is currently unavailable. Please try again.');
        setMessageType('error');
        return;
      }

      // Load Razorpay checkout script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        const checkout = new window.Razorpay({
          key: data.keyId,
          amount: data.order.amount,
          currency: data.order.currency,
          name: 'DavinciWaleBhaiya',
          description: product.name,
          order_id: data.order.razorpayOrderId,
          prefill: {
            email: user?.email || '',
            name: user?.name || '',
          },
          theme: {
            color: '#2563eb',
          },
          handler: async (response) => {
            setMessage('Verifying payment and generating secure zip download links...');
            setMessageType('info');

            try {
              const verified = await fetch('/api/checkout/verify', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(response),
              });

              const resData = await verified.json();
              if (verified.ok && resData.orderNumber) {
                window.location.href = `/order/success?order=${encodeURIComponent(resData.orderNumber)}`;
              } else {
                setMessage('Payment verification incomplete. Please contact support.');
                setMessageType('error');
                setPaying(false);
              }
            } catch (err) {
              console.error(err);
              setMessage('Network issue during verification. Please check your email for receipt.');
              setMessageType('error');
              setPaying(false);
            }
          },
          modal: {
            ondismiss: () => {
              setPaying(false);
              setMessage('');
            },
          },
        });
        checkout.open();
      };

      script.onerror = () => {
        setPaying(false);
        setMessage('Payment gateway script failed to load. Please check your internet connection.');
        setMessageType('error');
      };

      document.body.appendChild(script);
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

              {/* Delivery Notice */}
              <div className="rounded-2xl border border-blue-500/20 bg-blue-950/20 p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-300">
                  <Mail className="w-4 h-4 text-blue-400" />
                  <span>Instant Email Zip Delivery</span>
                </div>
                {user ? (
                  <p className="text-xs text-white/70">
                    Product zip package download link will be delivered directly to:{' '}
                    <strong className="text-white underline">{user.email}</strong> immediately upon payment confirmation.
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-white/70">
                      Please log in or create an account with your email to receive your product zip package upon payment.
                    </p>
                    <Link
                      href={`/login?next=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/')}`}
                      className="inline-block text-xs font-semibold text-blue-400 hover:text-blue-300 underline"
                    >
                      Login / Create Account &rarr;
                    </Link>
                  </div>
                )}
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

              {/* Messages / Alerts */}
              {message && (
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

              {/* Pay Button */}
              {user ? (
                <button
                  type="button"
                  disabled={paying}
                  onClick={pay}
                  className="w-full rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] py-4 text-sm font-bold text-white shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {paying ? (
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
              ) : (
                <Link
                  href={`/login?next=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/')}`}
                  className="w-full rounded-2xl bg-white hover:bg-white/90 py-4 text-sm font-bold text-black transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                  <span>Login to Proceed with Purchase</span>
                </Link>
              )}

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
                    Instant Zip Access
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
