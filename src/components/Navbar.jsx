'use client';

import { useState, useEffect } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';

export default function Navbar({ onOpenSearch }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((response) => response.json())
      .then((data) => setAccount(data.user || null))
      .catch(() => {});
  }, []);

  const navLinks = [
    { name: 'Featured', href: '/#featured' },
    { name: 'Catalogue', href: '/#catalogue' },
    { name: 'Tools', href: '/#tools' },
    { name: 'Content', href: '/#content' },
    { name: 'Studio', href: '/studio' },
    { name: 'Work With Us', href: '/#studio' },
    { name: 'Free Assets', href: '/#free-assets' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-[1000] px-4 sm:px-6 lg:px-8 pt-4 transition-all duration-300">
      <div
        className={`max-w-7xl mx-auto rounded-full transition-all duration-500 border ${
          scrolled
            ? 'bg-[#0a0d14]/80 backdrop-blur-xl border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.6)] py-3 px-5 sm:px-6'
            : 'bg-black/30 backdrop-blur-md border-white/[0.05] py-3.5 px-5 sm:px-7'
        } flex items-center justify-between`}
      >
        {/* Brand */}
        <a href="/" className="flex items-center space-x-2.5 group shrink-0">
          <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_12px_#3b82f6] group-hover:scale-125 transition-transform" />
          <span className="font-semibold text-sm sm:text-base tracking-tight text-white flex items-center">
            DavinciWale<span className="text-white/40 font-normal ml-0.5">Bhaiya</span>
          </span>
          <span className="hidden md:inline-block px-1.5 py-0.5 text-[10px] tracking-wider uppercase font-mono text-blue-400 bg-blue-950/40 border border-blue-800/40 rounded">
            Ecosystem
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                link.name === 'Free Assets'
                  ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'
                  : 'text-white/70 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Mobile-prioritized Free Assets Button (replaces Work With Us on phone viewports) */}
          <a
            href="/#free-assets"
            className="inline-flex lg:hidden items-center space-x-1.5 text-xs font-mono font-medium text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 px-3 py-1.5 rounded-full transition-all shadow-sm"
          >
            <span>Free Assets</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </a>

          {/* Desktop Work With Us CTA Button */}
          <a
            href="/#studio"
            className="hidden lg:inline-flex items-center space-x-1 text-xs font-medium text-black bg-white hover:bg-white/90 px-4 py-1.5 rounded-full transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] shrink-0"
          >
            <span>Work With Us</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-white/80 hover:text-white rounded-lg bg-white/[0.05]"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 max-w-7xl mx-auto bg-[#0a0d14]/95 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-4 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-colors flex items-center justify-between ${
                  link.name === 'Free Assets'
                    ? 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 font-semibold'
                    : 'text-white/80 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <span>{link.name}</span>
                {link.name === 'Free Assets' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
