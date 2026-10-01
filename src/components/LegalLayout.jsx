'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, Shield, FileText, RefreshCw, Truck, Info, Mail } from 'lucide-react';
import Footer from '@/components/Footer';

const NAV_ITEMS = [
  { name: 'About Us', href: '/about', icon: Info },
  { name: 'Terms & Conditions', href: '/terms', icon: FileText },
  { name: 'Privacy Policy', href: '/privacy', icon: Shield },
  { name: 'Refund & Cancellation', href: '/refund-policy', icon: RefreshCw },
  { name: 'Shipping & Delivery', href: '/shipping-policy', icon: Truck },
  { name: 'Contact Us', href: '/contact', icon: Mail },
];

export default function LegalLayout({
  badge = 'Legal & Compliance',
  title,
  lastUpdated,
  description,
  children,
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#04060c] text-slate-200 antialiased selection:bg-blue-500/30 selection:text-white flex flex-col justify-between">
      <div>
        {/* Top Header / Bar */}
        <header className="sticky top-0 z-50 bg-[#04060c]/90 backdrop-blur-xl border-b border-white/[0.08]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center space-x-2.5 group"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_12px_#3b82f6] group-hover:scale-125 transition-transform" />
              <span className="font-semibold text-sm sm:text-base tracking-tight text-white flex items-center">
                DavinciWale<span className="text-white/40 font-normal ml-0.5">Bhaiya</span>
              </span>
            </Link>

            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="inline-flex items-center space-x-1.5 text-xs font-medium text-white/70 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] px-3.5 py-1.5 rounded-full transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Website</span>
              </Link>
            </div>
          </div>

          {/* Sub-nav horizontal pills */}
          <div className="border-t border-white/[0.04] bg-black/40 overflow-x-auto scrollbar-none py-2 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto flex items-center space-x-1 min-w-max">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.2)]'
                        : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 opacity-70" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </header>

        {/* Hero Title Section */}
        <section className="relative pt-14 pb-10 border-b border-white/[0.06] bg-gradient-to-b from-blue-950/10 via-transparent to-transparent">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[11px] font-mono tracking-widest text-blue-400 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span>{badge}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white font-sans">
              {title}
            </h1>

            {description && (
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl font-sans">
                {description}
              </p>
            )}

            {lastUpdated && (
              <div className="text-[11px] font-mono text-white/40 pt-2 flex items-center space-x-2">
                <span>Last Updated:</span>
                <span className="text-slate-300">{lastUpdated}</span>
              </div>
            )}
          </div>
        </section>

        {/* Main Article Body */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-10 text-sm leading-relaxed text-slate-300 font-sans">
            {children}
          </div>

          {/* Dedicated Support Card */}
          <div className="mt-16 p-6 sm:p-8 rounded-2xl border border-white/[0.1] bg-gradient-to-br from-[#0c1220] to-[#060a12] shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <h3 className="text-base font-semibold text-white">Need help or have questions?</h3>
              <p className="text-xs text-slate-400 max-w-md">
                Our support team is available to assist with any billing, licensing, or download inquiries. Typical response within 24 hours.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <a
                href="mailto:support@davinciwalebhaiya.com"
                className="w-full sm:w-auto text-center px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all"
              >
                support@davinciwalebhaiya.com
              </a>
              <Link
                href="/contact"
                className="w-full sm:w-auto text-center px-4 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/[0.12] text-white text-xs font-medium transition-all"
              >
                Contact Form &rarr;
              </Link>
            </div>
          </div>
        </main>
      </div>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
