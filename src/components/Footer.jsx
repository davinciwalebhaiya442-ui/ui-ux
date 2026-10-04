'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { DEFAULT_FOOTER_SETTINGS } from '@/lib/footer';

export default function Footer({ initialSettings = null }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [settings, setSettings] = useState(() => initialSettings || DEFAULT_FOOTER_SETTINGS);

  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings);
    }
  }, [initialSettings]);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/footer')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.footer && isMounted) {
          setSettings((prev) => ({
            ...prev,
            ...data.footer,
          }));
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || submitting) return;
    setSubmitting(true);
    try {
      await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }).catch(() => {});
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail('');
      }, 4500);
    } finally {
      setSubmitting(false);
    }
  };

  const productsLinks = Array.isArray(settings.productsLinks) ? settings.productsLinks : DEFAULT_FOOTER_SETTINGS.productsLinks;
  const companyLinks = Array.isArray(settings.companyLinks) ? settings.companyLinks : DEFAULT_FOOTER_SETTINGS.companyLinks;
  const legalLinks = Array.isArray(settings.legalLinks) ? settings.legalLinks : DEFAULT_FOOTER_SETTINGS.legalLinks;

  return (
    <footer className="relative bg-black border-t border-white/[0.08] pt-24 pb-16 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-7xl mx-auto space-y-20">
        
        {/* Top: Brand Statement & Direct Newsletter */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <div className="space-y-3 max-w-xl">
            <Link href="/" className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center space-x-2 w-fit">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
              <span>{settings.brandName || 'DavinciWaleBhaiya'}</span>
            </Link>
            <p className="text-xs sm:text-sm text-white/50 leading-relaxed font-sans">
              {settings.brandTagline || 'Precision color science, optical DCTLs, and timeline utilities for professional colorists and video editors.'}
            </p>
          </div>

          <div className="w-full lg:w-auto min-w-[320px] space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 block">
              {settings.newsletterHeading || 'Direct Release Dispatch'}
            </span>
            {subscribed ? (
              <div className="text-xs font-mono text-emerald-400 flex items-center space-x-1.5 py-2">
                <Check className="w-3.5 h-3.5" />
                <span>Subscribed. You will receive new DCTL & macro releases.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder={settings.newsletterPlaceholder || 'editor@studio.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#0a0a0a] border border-white/[0.1] rounded-lg px-3.5 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30 flex-1"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-white text-black text-xs font-medium rounded-lg hover:bg-white/90 transition-colors"
                >
                  {settings.newsletterButtonText || 'Join'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Structured Directory Navigation: Products, Company, Legal, Connect */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-white/[0.06] text-xs font-sans">
          
          {/* Column 1: Products */}
          <div className="space-y-3">
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/40 font-semibold">Products</div>
            <ul className="space-y-2 text-white/60">
              {productsLinks.map((item, idx) => (
                <li key={idx}>
                  <Link href={item.href || '#'} className="hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Company */}
          <div className="space-y-3">
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/40 font-semibold">Company</div>
            <ul className="space-y-2 text-white/60">
              {companyLinks.map((item, idx) => (
                <li key={idx}>
                  <Link href={item.href || '#'} className="hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div className="space-y-3">
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/40 font-semibold">Legal</div>
            <ul className="space-y-2 text-white/60">
              {legalLinks.map((item, idx) => (
                <li key={idx}>
                  <Link href={item.href || '#'} className="hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Connect */}
          <div className="space-y-3">
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/40 font-semibold">Connect</div>
            <ul className="space-y-2 text-white/60">
              {settings.supportEmail && (
                <li>
                  <a href={`mailto:${settings.supportEmail}`} className="hover:text-white transition-colors text-blue-400">
                    {settings.supportEmail}
                  </a>
                </li>
              )}
              <li>
                <Link href="/account" className="hover:text-white transition-colors">
                  Account & Downloads
                </Link>
              </li>
              {settings.youtubeUrl && (
                <li>
                  <a href={settings.youtubeUrl} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                    YouTube Channel
                  </a>
                </li>
              )}
              {settings.instagramUrl && (
                <li>
                  <a href={settings.instagramUrl} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                    Instagram
                  </a>
                </li>
              )}
              {settings.twitterUrl && (
                <li>
                  <a href={settings.twitterUrl} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                    Twitter / X
                  </a>
                </li>
              )}
              {settings.discordUrl && (
                <li>
                  <a href={settings.discordUrl} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                    Discord Community
                  </a>
                </li>
              )}
            </ul>
          </div>

        </div>

        {/* Closing Line — Clean copyright with no pvt. ltd / trademark line */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-white/40 gap-4">
          <div>
            &copy; {new Date().getFullYear()} {settings.copyrightText || 'DavinciWaleBhaiya. All rights reserved.'}
          </div>
          <div className="flex items-center space-x-4 text-[10px]">
            <Link href="/terms" className="hover:text-white/70 transition-colors">Terms</Link>
            <span>&bull;</span>
            <Link href="/privacy" className="hover:text-white/70 transition-colors">Privacy</Link>
            <span>&bull;</span>
            <Link href="/refund-policy" className="hover:text-white/70 transition-colors">Refunds</Link>
            <span>&bull;</span>
            <Link href="/shipping-policy" className="hover:text-white/70 transition-colors">Shipping</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
