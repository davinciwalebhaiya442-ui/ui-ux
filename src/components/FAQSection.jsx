'use client';

import { useState } from 'react';
import { FAQS } from '@/data/content';
import { ChevronDown } from 'lucide-react';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="relative py-28 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-white/[0.08]">
      
      {/* Header */}
      <div className="mb-14">
        <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/40 block mb-2">
          07 / Clarifications
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-sans">
          Frequently Answered Questions
        </h2>
      </div>

      {/* Typographic Accordion List */}
      <div className="space-y-3">
        {FAQS.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className={`rounded-2xl p-5 border transition-all duration-300 ${
                isOpen
                  ? 'bg-gradient-to-b from-[#0d1424]/95 to-[#080d18]/95 border-blue-400/40 shadow-[0_8px_25px_rgba(0,0,0,0.5)]'
                  : 'bg-[#070b15]/60 border-white/[0.08] hover:border-white/20'
              }`}
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full text-left flex items-center justify-between space-x-4 focus:outline-none group"
              >
                <span className={`text-sm sm:text-base font-semibold transition-colors ${
                  isOpen ? 'text-white' : 'text-white/85 group-hover:text-white'
                }`}>
                  {faq.q}
                </span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${
                  isOpen ? 'bg-blue-500/20 text-blue-300' : 'bg-white/[0.06] text-white/50 group-hover:text-white'
                }`}>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {isOpen && (
                <div className="pt-3 pr-8 text-xs sm:text-sm text-white/70 leading-relaxed font-sans border-t border-white/[0.08] mt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </section>
  );
}
