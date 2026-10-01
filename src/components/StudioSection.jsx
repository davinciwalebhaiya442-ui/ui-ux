'use client';

import { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';

export default function StudioSection() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    requestType: 'Feature / Commercial Color Grading',
    budget: '$3,000 – $7,500',
    details: '',
    portfolio: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        requestType: 'Feature / Commercial Color Grading',
        budget: '$3,000 – $7,500',
        details: '',
        portfolio: '',
      });
    }, 5000);
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
        <div className="lg:col-span-7 border border-white/[0.08] rounded-xl p-6 sm:p-10 bg-[#080808]">
          {submitted ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center mx-auto">
                <Check className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-white">Project Inquiry Received</h3>
              <p className="text-xs text-white/60 max-w-sm mx-auto leading-relaxed font-sans">
                Our lead colorist will review your brief and get back to you within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-white/40 block mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Aditya Verma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#040404] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-white/40 block mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="aditya@studio.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#040404] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-white/40 block mb-1.5">
                    Service Scope
                  </label>
                  <select
                    value={formData.requestType}
                    onChange={(e) => setFormData({ ...formData, requestType: e.target.value })}
                    className="w-full bg-[#040404] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-xs text-white/80 focus:outline-none focus:border-white/30"
                  >
                    <option value="Feature / Commercial Color Grading">Feature / Commercial Color Grading</option>
                    <option value="Custom DCTL & Look Development">Custom DCTL & Look Development</option>
                    <option value="VFX Cleanup & Finishing">VFX Cleanup & Finishing</option>
                    <option value="General Production Collaboration">General Production Collaboration</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-white/40 block mb-1.5">
                    Project Budget
                  </label>
                  <select
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full bg-[#040404] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-xs text-white/80 focus:outline-none focus:border-white/30"
                  >
                    <option value="Under $2,000">Under $2,000 / ₹1,50,000</option>
                    <option value="$3,000 – $7,500">$3,000 – $7,500 / ₹2,50,000 – ₹6,00,000</option>
                    <option value="$7,500 – $15,000">$7,500 – $15,000 / ₹6,00,000 – ₹12,00,000</option>
                    <option value="$15,000+">$15,000+ / ₹12,00,000+</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-white/40 block mb-1.5">
                  Portfolio / Cut Reference Link (Vimeo / Drive)
                </label>
                <input
                  type="url"
                  placeholder="https://vimeo.com/your_cut"
                  value={formData.portfolio}
                  onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                  className="w-full bg-[#040404] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-white/40 block mb-1.5">
                  Project Details & Timeline
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Camera package used (Arri, RED, Sony), runtime, delivery format, and deadline..."
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  className="w-full bg-[#040404] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-6 rounded-lg text-xs font-semibold text-black bg-white hover:bg-white/90 transition-colors flex items-center justify-center space-x-1.5"
              >
                <span>Start a Project</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>

      </div>

    </section>
  );
}
