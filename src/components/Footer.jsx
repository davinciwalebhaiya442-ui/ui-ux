'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { DEFAULT_FOOTER_SETTINGS } from '@/lib/footer';

function YoutubeIcon({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

function InstagramIcon({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  );
}

function TwitterIcon({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function DiscordIcon({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  );
}

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_FOOTER_SETTINGS);

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

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => {
      setSubscribed(false);
      setEmail('');
    }, 4000);
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
            <div className="space-y-4">
              {settings.supportEmail && (
                <a
                  href={`mailto:${settings.supportEmail}`}
                  className="hover:text-white transition-colors text-blue-400 block text-xs break-all"
                >
                  {settings.supportEmail}
                </a>
              )}

              {/* Social Icons Row */}
              <div className="flex items-center gap-2 pt-1">
                <a
                  href={settings.youtubeUrl || 'https://youtube.com'}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="YouTube Channel"
                  className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-red-500/15 border border-white/10 hover:border-red-500/30 text-white/60 hover:text-red-400 flex items-center justify-center transition-all hover:scale-110 shadow-sm"
                  title="YouTube"
                >
                  <YoutubeIcon className="w-4 h-4" />
                </a>

                <a
                  href={settings.instagramUrl || 'https://instagram.com'}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram Profile"
                  className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-pink-500/15 border border-white/10 hover:border-pink-500/30 text-white/60 hover:text-pink-400 flex items-center justify-center transition-all hover:scale-110 shadow-sm"
                  title="Instagram"
                >
                  <InstagramIcon className="w-4 h-4" />
                </a>

                <a
                  href={settings.twitterUrl || 'https://x.com'}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Twitter / X Profile"
                  className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-sky-500/15 border border-white/10 hover:border-sky-500/30 text-white/60 hover:text-sky-400 flex items-center justify-center transition-all hover:scale-110 shadow-sm"
                  title="Twitter / X"
                >
                  <TwitterIcon className="w-3.5 h-3.5" />
                </a>

                <a
                  href={settings.discordUrl || 'https://discord.gg'}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Discord Community"
                  className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-indigo-500/15 border border-white/10 hover:border-indigo-500/30 text-white/60 hover:text-indigo-400 flex items-center justify-center transition-all hover:scale-110 shadow-sm"
                  title="Discord"
                >
                  <DiscordIcon className="w-4 h-4" />
                </a>
              </div>
            </div>
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
