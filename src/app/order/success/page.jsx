'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Mail,
  DownloadCloud,
  ArrowRight,
  Loader2,
  FileArchive,
  ShieldCheck,
} from 'lucide-react';

export default function OrderSuccessPage() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const number = typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('order')
      : null;

    if (number) {
      fetch(`/api/account/orders/${number}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.order) setOrder(d.order);
        })
        .catch((e) => console.error(e))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-black px-4 sm:px-6 py-16 sm:py-24 text-white">
      <div className="w-full max-w-xl space-y-6">

        <section className="w-full rounded-3xl border border-white/10 bg-[#080d1a]/95 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl space-y-8 text-center sm:text-left">
          
          {/* Header Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/[0.08] pb-6">
            <div className="flex items-center justify-center sm:justify-start gap-2.5">
              <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[.25em] text-emerald-400 block">
                  Payment Verified
                </span>
                <span className="text-xs font-mono text-white/50">
                  Order #{order?.orderNumber || '...'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-white/40">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Instant Digital Delivery</span>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-white/50 space-y-3">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-400" />
              <p className="text-xs font-mono">Confirming order and download package...</p>
            </div>
          ) : (
            <>
              {/* Headline */}
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Thank you for your purchase!
                </h1>
                <p className="text-sm text-white/70 leading-relaxed">
                  Your payment has been successfully confirmed. Your digital assets and download links are ready.
                </p>
              </div>

              {/* Delivery Email Banner */}
              <div className="rounded-2xl border border-blue-500/30 bg-blue-950/25 p-5 text-left space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-300">
                  <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>File Sent to Your Email</span>
                </div>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                  We have automatically dispatched your zip file download package to:{' '}
                  <strong className="text-white underline font-semibold">
                    {order?.customerEmail || 'your email'}
                  </strong>
                </p>
                <p className="text-[11px] text-white/50 pt-1">
                  Please check your inbox (and spam/promotions folder if it doesn&apos;t appear in 1-2 minutes).
                </p>
              </div>

              {/* Purchased Items & Direct Downloads */}
              {order?.items?.length > 0 && (
                <div className="space-y-3 text-left">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-white/50">
                    Purchased Package ({order.items.length})
                  </h3>
                  <div className="space-y-2.5">
                    {order.items.map((item) => (
                      <div
                        key={item.id || item.productId}
                        className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                            <FileArchive className="w-4 h-4 text-blue-400" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-white">
                              {item.productName}
                            </h4>
                            <span className="text-[11px] text-white/40 font-mono">
                              {item.downloadFileName || 'Digital Tool Package.zip'} {item.fileSize ? `• ${item.fileSize}` : ''}
                            </span>
                          </div>
                        </div>

                        {item.downloadUrl && (
                          <a
                            href={item.downloadUrl}
                            download
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2.5 text-xs font-semibold text-white transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] shrink-0"
                          >
                            <DownloadCloud className="w-3.5 h-3.5" />
                            <span>Download Zip</span>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Return to Store */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <Link
                  href="/"
                  className="w-full sm:w-auto flex-1 rounded-2xl bg-white hover:bg-white/90 py-3.5 px-6 text-sm font-bold text-black transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                  <span>Return to Store</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/contact"
                  className="w-full sm:w-auto rounded-2xl border border-white/10 hover:border-white/20 py-3.5 px-6 text-xs font-mono text-white/60 hover:text-white transition-all flex items-center justify-center"
                >
                  Need Support?
                </Link>
              </div>
            </>
          )}

        </section>

      </div>
    </main>
  );
}
