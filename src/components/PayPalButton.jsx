'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

export default function PayPalButton({
  product,
  email,
  name,
  onStart,
  onError,
  onSuccess,
  onVerifying,
  disabled = false,
}) {
  const containerRef = useRef(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [loadingSdk, setLoadingSdk] = useState(true);
  const [sdkError, setSdkError] = useState('');
  const buttonsInstanceRef = useRef(null);

  // Keep live references to state/props so input typing doesn't re-render PayPal buttons
  const emailRef = useRef(email);
  const nameRef = useRef(name);
  const onStartRef = useRef(onStart);
  const onErrorRef = useRef(onError);
  const onSuccessRef = useRef(onSuccess);
  const onVerifyingRef = useRef(onVerifying);
  const pendingOrderNumberRef = useRef('');

  useEffect(() => {
    emailRef.current = email;
  }, [email]);

  useEffect(() => {
    nameRef.current = name;
  }, [name]);

  useEffect(() => {
    onStartRef.current = onStart;
    onErrorRef.current = onError;
    onSuccessRef.current = onSuccess;
    onVerifyingRef.current = onVerifying;
  }, [onStart, onError, onSuccess, onVerifying]);

  const clientId =
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ||
    process.env.PAYPAL_CLIENT_ID ||
    'BAA4QO1yhjOo-NNDU7ChH1cKJoE9klVZO_HNiTf0x6ldCmf0lENTrmpiHEks9m-ZoKOznOvA-2-G4qfDNU';

  // 1. Load official PayPal JS SDK
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.paypal && window.paypal.Buttons) {
      setSdkReady(true);
      setLoadingSdk(false);
      return;
    }

    const scriptId = 'paypal-js-sdk';
    let script = document.getElementById(scriptId);

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture&components=buttons&enable-funding=card`;
      script.async = true;

      script.onload = () => {
        setSdkReady(true);
        setLoadingSdk(false);
      };

      script.onerror = () => {
        setLoadingSdk(false);
        setSdkError('Unable to load PayPal Checkout. Please check your internet connection.');
        if (onErrorRef.current) onErrorRef.current('Unable to load PayPal Checkout.');
      };

      document.body.appendChild(script);
    } else {
      script.addEventListener('load', () => {
        setSdkReady(true);
        setLoadingSdk(false);
      });
    }
  }, [clientId]);

  // 2. Render PayPal Buttons when SDK and container are ready
  useEffect(() => {
    if (!sdkReady || !containerRef.current || !window.paypal?.Buttons || !product?.id) return;

    // Clear previous renders if any
    containerRef.current.innerHTML = '';

    try {
      buttonsInstanceRef.current = window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'paypal',
          height: 48,
          tagline: false,
        },

        // Client-side validation before order creation
        onClick: (data, actions) => {
          const cleanEmail = (emailRef.current || '').trim().toLowerCase();
          if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
            if (onErrorRef.current) onErrorRef.current('Please enter a valid email address first.');
            return actions.reject();
          }
          if (onStartRef.current) onStartRef.current();
          return actions.resolve();
        },

        // Create Order via our secure backend API
        createOrder: async () => {
          const cleanEmail = (emailRef.current || '').trim().toLowerCase();
          const cleanName = (nameRef.current || '').trim();

          const res = await fetch('/api/checkout/paypal/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productIds: [product.id],
              email: cleanEmail,
              name: cleanName,
            }),
          });

          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || 'Failed to initiate PayPal payment');
          }

          pendingOrderNumberRef.current = data.orderNumber;
          return data.paypalOrderId;
        },

        // Capture authorized payment upon buyer approval
        onApprove: async (data) => {
          if (onVerifyingRef.current) {
            onVerifyingRef.current('Capturing PayPal payment and preparing your digital download...');
          }

          try {
            const res = await fetch('/api/checkout/paypal/capture', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                paypalOrderId: data.orderID,
                orderNumber: pendingOrderNumberRef.current,
              }),
            });

            const result = await res.json();
            if (!res.ok || !result.success) {
              throw new Error(result.error || 'Failed to capture PayPal payment');
            }

            if (onSuccessRef.current) {
              onSuccessRef.current(result.orderNumber || pendingOrderNumberRef.current);
            } else {
              window.location.href = `/order/success?order=${encodeURIComponent(result.orderNumber || pendingOrderNumberRef.current)}`;
            }
          } catch (err) {
            console.error('PayPal capture error:', err);
            if (onErrorRef.current) {
              onErrorRef.current(err.message || 'Payment capture failed. Please check your email.');
            }
          }
        },

        onError: (err) => {
          console.error('PayPal SDK error:', err);
          if (onErrorRef.current) {
            onErrorRef.current('PayPal encountered an unexpected error. Please try again.');
          }
        },

        onCancel: () => {
          if (onErrorRef.current) onErrorRef.current('PayPal checkout was cancelled.');
        },
      });

      buttonsInstanceRef.current.render(containerRef.current);
    } catch (renderErr) {
      console.error('PayPal render error:', renderErr);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [sdkReady, product?.id]);

  if (loadingSdk) {
    return (
      <div className="w-full py-6 rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-center gap-2.5 text-xs text-white/50">
        <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
        <span>Loading secure PayPal gateway...</span>
      </div>
    );
  }

  if (sdkError) {
    return (
      <div className="w-full p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-xs text-red-200 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
        <span>{sdkError}</span>
      </div>
    );
  }

  return (
    <div className={`w-full transition-opacity duration-200 ${disabled ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
      <div ref={containerRef} id="paypal-button-container" className="w-full min-h-[48px]" />
    </div>
  );
}
