'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => {
      setSubscribed(false);
      setEmail('');
    }, 4000);
  };

  return (
    <footer className="relative bg-black border-t border-white/[0.08] pt-24 pb-16 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-7xl mx-auto space-y-20">
        
        {/* Top: Brand Statement & Direct Newsletter */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <div className="space-y-3 max-w-xl">
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>DavinciWaleBhaiya</span>
            </div>
            <p className="text-xs sm:text-sm text-white/50 leading-relaxed font-sans">
              Precision color science, optical DCTLs, and timeline utilities for professional colorists and video editors.
            </p>
          </div>

          <div className="w-full lg:w-auto min-w-[320px] space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 block">
              Direct Release Dispatch
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
                  placeholder="editor@studio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#0a0a0a] border border-white/[0.1] rounded-lg px-3.5 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30 flex-1"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-white text-black text-xs font-medium rounded-lg hover:bg-white/90 transition-colors"
                >
                  Join
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Minimal Directory Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 pt-12 border-t border-white/[0.06] text-xs font-sans">
          
          <div className="space-y-3">
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/40">Ecosystem</div>
            <ul className="space-y-2 text-white/60">
              <li><a href="#" className="hover:text-white transition-colors">Overview</a></li>
              <li><a href="#featured" className="hover:text-white transition-colors">Curated Releases</a></li>
              <li><a href="#catalogue" className="hover:text-white transition-colors">Asset Catalogue</a></li>
              <li><a href="#comparison" className="hover:text-white transition-colors">Before / After Engine</a></li>
              <li><a href="#tools" className="hover:text-white transition-colors">Editorial Tools</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/40">Editorial Vault</div>
            <ul className="space-y-2 text-white/60">
              <li><a href="#content" className="hover:text-white transition-colors">Cinematic Prompts</a></li>
              <li><a href="#content" className="hover:text-white transition-colors">Gear & Reference Displays</a></li>
              <li><a href="#content" className="hover:text-white transition-colors">Color Science Tutorials</a></li>
              <li><a href="#content" className="hover:text-white transition-colors">Node Tree Breakdowns</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/40">Studio & Studio</div>
            <ul className="space-y-2 text-white/60">
              <li><a href="#studio" className="hover:text-white transition-colors">Work With Us</a></li>
              <li><a href="#about" className="hover:text-white transition-colors">Studio Notes & Philosophy</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">Frequently Answered</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/40">Connect</div>
            <ul className="space-y-2 text-white/60">
              <li><a href="mailto:support@davinciwalebhaiya.com" className="hover:text-white transition-colors">support@davinciwalebhaiya.com</a></li>
              <li><a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">YouTube Channel</a></li>
              <li><a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Instagram</a></li>
            </ul>
          </div>

        </div>

        {/* Closing Line */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-white/40 gap-4">
          <div>
            &copy; {new Date().getFullYear()} DavinciWaleBhaiya. All rights reserved.
          </div>
        </div>

      </div>
    </footer>
  );
}
