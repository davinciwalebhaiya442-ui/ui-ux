'use client';

import { useState } from 'react';
import { PROMPTS, GEAR_PICKS, TUTORIALS } from '@/data/content';
import { Copy, Check, Terminal, Camera, BookOpen } from 'lucide-react';

export default function ContentSection() {
  const [activeTab, setActiveTab] = useState('prompts');
  const [copiedId, setCopiedId] = useState(null);

  const copyPromptText = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  return (
    <section id="content" className="relative py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.08]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-baseline justify-between mb-12 gap-6 pb-8 border-b border-white/[0.08]">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/40 block mb-2">
            04 / Editorial Vault
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-sans">
            Prompts, Gear & Field Notes
          </h2>
        </div>
        <p className="max-w-md text-xs sm:text-sm text-white/50 leading-relaxed font-sans">
          Curated reference prompts, mastering hardware notes, and color science breakdowns from our suite.
        </p>
      </div>

      {/* Category Tabs — Segmented Pills with Spacing & Badges */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 p-1.5 rounded-2xl bg-[#070b15]/90 border border-white/[0.08] mb-12 shadow-inner">
        {[
          { id: 'prompts', label: 'Director & AI Prompts', badge: '01' },
          { id: 'gear', label: 'Hardware & Monitoring', badge: '02' },
          { id: 'tutorials', label: 'Color Science Breakdowns', badge: '03' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-mono transition-all duration-200 cursor-pointer flex items-center space-x-2 shrink-0 ${
                isActive
                  ? 'bg-blue-600/25 border border-blue-400/60 text-white font-semibold shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  isActive
                    ? 'bg-blue-400/20 text-blue-300'
                    : 'bg-white/[0.06] text-white/40'
                }`}
              >
                {tab.badge}
              </span>
              <span>{tab.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa]" />
              )}
            </button>
          );
        })}
      </div>

      {/* PROMPTS */}
      {activeTab === 'prompts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {PROMPTS.map((prompt) => (
            <div
              key={prompt.id}
              className="border border-white/[0.12] rounded-2xl p-6 sm:p-7 bg-gradient-to-b from-[#0d1424]/95 via-[#090e1a]/95 to-[#060a12]/95 shadow-[0_12px_32px_rgba(0,0,0,0.45)] flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="uppercase tracking-widest text-blue-400 font-semibold px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">{prompt.category}</span>
                  <span className="text-white/60">{prompt.engine}</span>
                </div>

                <h3 className="text-lg font-bold text-white tracking-tight">
                  {prompt.title}
                </h3>

                <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-sans">
                  {prompt.description}
                </p>

                {/* Direct Prompt Box */}
                <div className="p-4 rounded-xl bg-[#070b15] border border-white/[0.1] font-mono text-xs text-white/90 leading-relaxed relative group shadow-inner">
                  <p className="pr-16 text-white/80 select-all">
                    {prompt.promptText}
                  </p>

                  <div className="mt-3 pt-3 border-t border-white/[0.08] flex items-center justify-between">
                    <span className="text-[10px] text-white/50">{prompt.notes}</span>
                    <button
                      onClick={() => copyPromptText(prompt.id, prompt.promptText)}
                      className={`px-3.5 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider flex items-center space-x-1.5 transition-all ${
                        copiedId === prompt.id
                          ? 'bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-bold'
                          : 'bg-blue-600/30 hover:bg-blue-600 border border-blue-500/40 text-white font-semibold shadow-sm'
                      }`}
                    >
                      {copiedId === prompt.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-blue-300" />
                          <span>Copy Prompt</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* GEAR & MONITORING */}
      {activeTab === 'gear' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {GEAR_PICKS.map((gear) => (
            <div
              key={gear.id}
              className="border border-white/[0.12] rounded-2xl p-6 bg-gradient-to-b from-[#0d1424]/95 via-[#090e1a]/95 to-[#060a12]/95 shadow-[0_12px_32px_rgba(0,0,0,0.45)] flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] font-mono text-white/50">
                  <span className="uppercase tracking-widest text-blue-400 font-semibold">{gear.category}</span>
                  <span className="text-white/80 font-bold">{gear.price}</span>
                </div>

                <h3 className="text-base font-bold text-white tracking-tight">
                  {gear.name}
                </h3>
                <div className="text-[11px] font-mono text-blue-300">{gear.role}</div>

                <p className="text-xs text-white/70 leading-relaxed font-sans">
                  {gear.notes}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TUTORIALS */}
      {activeTab === 'tutorials' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TUTORIALS.map((tut) => (
            <div
              key={tut.id}
              className="border border-white/[0.12] rounded-2xl p-6 bg-gradient-to-b from-[#0d1424]/95 via-[#090e1a]/95 to-[#060a12]/95 shadow-[0_12px_32px_rgba(0,0,0,0.45)] flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-mono text-white/50">
                  <span className="text-blue-400 font-semibold">{tut.software}</span>
                  <span>{tut.duration}</span>
                </div>

                <h3 className="text-base font-bold text-white tracking-tight">
                  {tut.title}
                </h3>

                <p className="text-xs text-white/70 leading-relaxed font-sans">
                  {tut.summary}
                </p>

                <div className="space-y-1.5 pt-3 border-t border-white/[0.08] text-[11px] font-mono text-white/60">
                  {tut.breakdown.map((item, i) => (
                    <div key={i} className="flex items-start space-x-1.5">
                      <span className="text-blue-400 font-bold">&bull;</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </section>
  );
}
