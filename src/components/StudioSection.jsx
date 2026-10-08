'use client';

import { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';

export default function StudioSection() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    requestType: 'Feature / Commercial Color Grading',
    budget: 'Under ₹500',
    details: '',
    portfolio: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          requestType: formData.requestType,
          budget: formData.budget,
          projectDetails: formData.details,
          portfolioUrl: formData.portfolio,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit request');
      }
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        requestType: 'Feature / Commercial Color Grading',
        budget: 'Under ₹500',
        details: '',
        portfolio: '',
      });
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="studio" className="relative py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.08]">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        
        {/* Left Editorial Narrative */}
        <div className="lg:col-span-5 space-y-6">
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/40 block">
            05 / Studio Lab
          </span>

          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-sans leading-tight">
            Work With Us On <br />
            <span className="text-white/40 font-normal">Color & Finishing.</span>
          </h2>

          <div className="space-y-4 text-xs sm:text-sm text-white/70 leading-relaxed font-sans">
            <p>
              In addition to releasing tools, our studio accepts a limited number of commercial campaigns, independent feature films, and custom look development contracts each quarter.
            </p>
            <p>
              We grade in DaVinci Resolve Studio in a calibrated DCI-P3 / Rec.709 mastering environment. Remote review sessions are conducted via Frame.io or live 10-bit NDI/SRT streaming directly to your calibrated display.
            </p>
          </div>

          <div className="pt-4 border-t border-white/[0.06] space-y-3 text-xs font-mono text-white/50">
            <div>&bull; Theatrical & Commercial Color Grading</div>
            <div>&bull; Custom DCTL & Look Development</div>
            <div>&bull; Beauty, Paint & Visual Cleanup</div>
          </div>
        </div>

        {/* Right Creative Brief Form */}
        <div className="lg:col-span-7 border border-white/[0.12] rounded-2xl p-6 sm:p-10 bg-gradient-to-b from-[#0d1424]/95 via-[#090e1a]/95 to-[#060a12]/95 shadow-[0_12px_32px_rgba(0,0,0,0.45)]">
          {submitted ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <Check className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white">Project Inquiry Received</h3>
              <p className="text-xs sm:text-sm text-white/70 max-w-sm mx-auto leading-relaxed font-sans">
                Our lead colorist will review your brief and get back to you within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-white/50 block mb-1.5 font-semibold">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Aditya Verma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#070b15] border border-white/[0.12] rounded-xl px-4 py-3 text-xs text-white placeholder-white/40 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 transition-all shadow-inner"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-white/50 block mb-1.5 font-semibold">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="aditya@studio.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#070b15] border border-white/[0.12] rounded-xl px-4 py-3 text-xs text-white placeholder-white/40 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-white/50 block mb-1.5 font-semibold">
                    Service Scope
                  </label>
                  <select
                    value={formData.requestType}
                    onChange={(e) => setFormData({ ...formData, requestType: e.target.value })}
                    className="w-full bg-[#070b15] border border-white/[0.12] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 transition-all shadow-inner"
                  >
                    <option value="Feature / Commercial Color Grading">Feature / Commercial Color Grading</option>
                    <option value="Custom DCTL & Look Development">Custom DCTL & Look Development</option>
                    <option value="VFX Cleanup & Finishing">VFX Cleanup & Finishing</option>
                    <option value="General Production Collaboration">General Production Collaboration</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-white/50 block mb-1.5 font-semibold">
                    Project Budget
                  </label>
                  <select
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full bg-[#070b15] border border-white/[0.12] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 transition-all shadow-inner"
                  >
                    <option value="Under ₹500">Under ₹500</option>
                    <option value="Under ₹1,000">Under ₹1,000</option>
                    <option value="Under ₹2,000">Under ₹2,000</option>
                    <option value="₹5,000+">₹5,000+</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-white/50 block mb-1.5 font-semibold">
                  Portfolio / Cut Reference Link (Vimeo / Drive)
                </label>
                <input
                  type="url"
                  placeholder="https://vimeo.com/your_cut"
                  value={formData.portfolio}
                  onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                  className="w-full bg-[#070b15] border border-white/[0.12] rounded-xl px-4 py-3 text-xs text-white placeholder-white/40 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 transition-all shadow-inner"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-white/50 block mb-1.5 font-semibold">
                  Project Details & Timeline
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Camera package used (Arri, RED, Sony), runtime, delivery format, and deadline..."
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  className="w-full bg-[#070b15] border border-white/[0.12] rounded-xl px-4 py-3 text-xs text-white placeholder-white/40 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 transition-all shadow-inner resize-none"
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{loading ? 'Submitting Project Brief...' : 'Initiate Studio Project'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

      </div>

    </section>
  );
}
