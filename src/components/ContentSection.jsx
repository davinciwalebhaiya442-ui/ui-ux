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

      {/* Clean Category Selector */}
      <div className="flex items-center space-x-2 border-b border-white/[0.08] mb-12 text-xs font-mono">
        {[
          { id: 'prompts', label: 'Director & AI Prompts' },
          { id: 'gear', label: 'Hardware & Monitoring' },
          { id: 'tutorials', label: 'Color Science Breakdowns' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 border-b-2 transition-colors -mb-px ${
              activeTab === tab.id
                ? 'border-white text-white font-semibold'
                : 'border-transparent text-white/40 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* PROMPTS */}
      {activeTab === 'prompts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {PROMPTS.map((prompt) => (
            <div
              key={prompt.id}
              className="border border-white/[0.08] rounded-xl p-6 bg-[#080808] flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] font-mono text-white/40">
                  <span className="uppercase tracking-widest text-blue-400">{prompt.category}</span>
                  <span>{prompt.engine}</span>
                </div>

                <h3 className="text-lg font-bold text-white tracking-tight">
                  {prompt.title}
                </h3>

                <p className="text-xs text-white/60 leading-relaxed font-sans">
                  {prompt.description}
                </p>

                {/* Direct Prompt Box */}
                <div className="p-4 rounded-lg bg-[#040404] border border-white/[0.06] font-mono text-xs text-white/80 leading-relaxed relative group">
                  <p className="pr-16 text-white/70 select-all">
                    {prompt.promptText}
                  </p>

                  <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-[10px] text-white/40">{prompt.notes}</span>
                    <button
                      onClick={() => copyPromptText(prompt.id, prompt.promptText)}
                      className={`px-3 py-1 rounded text-[10px] font-mono uppercase tracking-wider flex items-center space-x-1.5 transition-colors ${
                        copiedId === prompt.id
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      {copiedId === prompt.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
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
              className="border border-white/[0.08] rounded-xl p-6 bg-[#080808] flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] font-mono text-white/40">
                  <span className="uppercase tracking-widest">{gear.category}</span>
                  <span className="text-white/60 font-semibold">{gear.price}</span>
                </div>

                <h3 className="text-base font-bold text-white tracking-tight">
                  {gear.name}
                </h3>
                <div className="text-[11px] font-mono text-blue-400">{gear.role}</div>

                <p className="text-xs text-white/60 leading-relaxed font-sans">
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
              className="border border-white/[0.08] rounded-xl p-6 bg-[#080808] flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-mono text-white/40">
                  <span>{tut.software}</span>
                  <span>{tut.duration}</span>
                </div>

                <h3 className="text-base font-bold text-white tracking-tight">
                  {tut.title}
                </h3>

                <p className="text-xs text-white/60 leading-relaxed font-sans">
                  {tut.summary}
                </p>

                <div className="space-y-1.5 pt-3 border-t border-white/[0.06] text-[11px] font-mono text-white/50">
                  {tut.breakdown.map((item, i) => (
                    <div key={i} className="flex items-start space-x-1.5">
                      <span className="text-white/30">&bull;</span>
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
