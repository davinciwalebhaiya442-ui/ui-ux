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
      <div className="divide-y divide-white/[0.06]">
        {FAQS.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={index} className="py-5">
              <button
                onClick={() => toggleFaq(index)}
                className="w-full text-left flex items-center justify-between space-x-4 focus:outline-none group"
              >
                <span className="text-sm sm:text-base font-medium text-white/90 group-hover:text-white transition-colors">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-white/40 group-hover:text-white transition-transform duration-200 flex-shrink-0 ${
                    isOpen ? 'rotate-180 text-white' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="pt-3 pr-8 text-xs sm:text-sm text-white/60 leading-relaxed font-sans">
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
