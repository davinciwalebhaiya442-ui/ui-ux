'use client';

import { useState, useEffect } from 'react';
import { AdminLayout, useAdmin } from '../AdminShell';
import FestivalEffect from '@/components/FestivalEffect';
import { DEFAULT_FESTIVAL_SETTINGS, FESTIVAL_EFFECT_OPTIONS } from '@/lib/festival';
import {
  Sparkles,
  Save,
  Check,
  Smartphone,
  Gauge,
  MessageSquare,
  Eye,
  RefreshCw,
  Power,
  Snowflake,
} from 'lucide-react';

export default function FestivalEffectsAdminPage() {
  const { toast } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(DEFAULT_FESTIVAL_SETTINGS);
  const [previewActive, setPreviewActive] = useState(true);

  useEffect(() => {
    fetch('/api/admin/festival', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.festival) {
          setForm({
            ...DEFAULT_FESTIVAL_SETTINGS,
            ...data.festival,
          });
        }
      })
      .catch((err) => {
        console.error('Failed to load festival settings:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/festival', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save settings');
      }

      // Broadcast update instantly to open visitor tabs (0 Vercel CPU)
      try {
        if ('BroadcastChannel' in window) {
          const bc = new BroadcastChannel('dwb_festival_channel');
          bc.postMessage({ type: 'FESTIVAL_UPDATED', festival: data.festival });
          bc.close();
        }
        localStorage.setItem('dwb_festival_updated', Date.now().toString());
      } catch (e) {}

      toast('Festival & seasonal effects updated successfully!', 'success');
    } catch (err) {
      console.error('Save error:', err);
      toast(err.message || 'Could not save festival settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const selectedPreset = FESTIVAL_EFFECT_OPTIONS.find((opt) => opt.id === form.effect) || FESTIVAL_EFFECT_OPTIONS[0];

  return (
    <AdminLayout title="Festival & Seasonal Effects">
      <div className="max-w-6xl mx-auto space-y-8 pb-16">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-amber-400/80 flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Atmosphere & Celebration Control</span>
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Festival & Seasonal Effects
            </h1>
            <p className="text-xs sm:text-sm text-white/50 mt-1 max-w-2xl leading-relaxed">
              Enable animated atmospheric effects like Winter Snowfall, Diwali Golden Embers, and New Year Confetti across the website. Rendered completely on the client canvas with 0% Vercel server CPU.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs transition-all shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] disabled:opacity-50 shrink-0 cursor-pointer"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save & Apply to Website</span>
              </>
            )}
          </button>
        </div>

        {/* Master ON/OFF Hero Banner */}
        <div
          className={`relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 ${
            form.enabled
              ? 'bg-gradient-to-r from-emerald-950/40 via-emerald-900/20 to-black border-emerald-500/40 shadow-[0_0_35px_rgba(16,185,129,0.15)]'
              : 'bg-gradient-to-r from-[#12141a] to-[#0a0c10] border-white/[0.08]'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${
                  form.enabled
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                    : 'bg-white/[0.05] text-white/40 border-white/[0.08]'
                }`}
              >
                <Power className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-white">
                    Master Effect Switch
                  </h3>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                      form.enabled
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-white/10 text-white/40 border border-white/10'
                    }`}
                  >
                    {form.enabled ? 'ACTIVE ON WEBSITE' : 'OFFLINE'}
                  </span>
                </div>
                <p className="text-xs text-white/50 mt-0.5">
                  {form.enabled
                    ? `Currently displaying "${selectedPreset.label}" (${form.intensity} intensity) across all pages.`
                    : 'All festival particle animations are paused. The site looks standard.'}
                </p>
              </div>
            </div>

            {/* Toggle Button */}
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, enabled: !prev.enabled }))}
              className={`relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                form.enabled ? 'bg-emerald-500 shadow-[0_0_15px_#10b981]' : 'bg-white/20'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  form.enabled ? 'translate-x-8' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Preset Selector Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Choose Festive Atmosphere</h2>
              <p className="text-xs text-white/50">Select which theme to activate during festivals or weather seasons</p>
            </div>
            <span className="text-xs font-mono text-amber-400/80 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20">
              Active: {selectedPreset.label}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FESTIVAL_EFFECT_OPTIONS.map((preset) => {
              const isSelected = form.effect === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      effect: preset.id,
                      // auto populate greeting if empty
                      greetingText: prev.greetingText || preset.recommendedGreeting,
                    }))
                  }
                  className={`relative p-5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer group ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#181d28] to-[#0c0f17] border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.2)]'
                      : 'bg-[#0d1017]/80 hover:bg-[#121620] border-white/[0.08] hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] block w-fit">
                        {preset.icon}
                      </span>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-amber-400 text-black flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-white group-hover:text-amber-300 transition-colors">
                      {preset.label}
                    </h3>
                    <p className="text-xs text-white/50 mt-1.5 leading-relaxed">
                      {preset.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-white/40">
                    <span>{isSelected ? 'Selected Preset' : 'Click to preview'}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Fine Tuning Controls (Intensity, Speed, Mobile, Greetings) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Column 1: Particle Dynamics */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c0f17] p-6 space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-white/[0.08]">
              <Gauge className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-white">Particle Dynamics & Performance</h3>
            </div>

            {/* Intensity */}
            <div className="space-y-2.5">
              <label className="text-xs font-medium text-white/70 block">
                Particle Density (Intensity)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'low', label: 'Subtle (Low)', desc: '~35 particles' },
                  { id: 'medium', label: 'Balanced (Med)', desc: '~70 particles' },
                  { id: 'high', label: 'Vibrant (High)', desc: '~120 particles' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, intensity: item.id }))}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      form.intensity === item.id
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                        : 'bg-white/[0.02] border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="text-xs font-semibold">{item.label}</div>
                    <div className="text-[10px] text-white/40 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Animation Speed */}
            <div className="space-y-2.5">
              <label className="text-xs font-medium text-white/70 block">
                Float / Fall Speed
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { speed: 0, label: 'Gentle (Slow)' },
                  { speed: 1, label: 'Natural (Normal)' },
                  { speed: 2, label: 'Brisk (Fast)' },
                ].map((item) => (
                  <button
                    key={item.speed}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, customSpeed: item.speed }))}
                    className={`py-2 px-3 rounded-xl border text-center transition-all text-xs font-medium cursor-pointer ${
                      form.customSpeed === item.speed
                        ? 'bg-blue-600/20 border-blue-500 text-white'
                        : 'bg-white/[0.02] border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Devices Toggle */}
            <div className="pt-2 flex items-center justify-between border-t border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/[0.04] text-white/70">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-medium text-white">Enable on Mobile Viewports</div>
                  <div className="text-[11px] text-white/40">Auto-reduces density by 50% for 60fps on phones</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, enableOnMobile: !prev.enableOnMobile }))}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  form.enableOnMobile !== false ? 'bg-blue-600' : 'bg-white/20'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    form.enableOnMobile !== false ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Column 2: Greeting & Banner */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c0f17] p-6 space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-white/[0.08]">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">Floating Festive Greeting Pill</h3>
            </div>

            {/* Toggle greeting */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-white">Show Seasonal Greeting Pill</div>
                <div className="text-[11px] text-white/40">A floating, dismissable banner at top of website</div>
              </div>
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, greetingEnabled: !prev.greetingEnabled }))}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  form.greetingEnabled ? 'bg-amber-500' : 'bg-white/20'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    form.greetingEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Greeting Input */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/70 block">
                Greeting Message
              </label>
              <input
                type="text"
                value={form.greetingText || ''}
                placeholder="e.g. ❄️ Season Greetings & Happy Holidays from DavinciWaleBhaiya!"
                onChange={(e) => setForm((prev) => ({ ...prev, greetingText: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:border-amber-400/50 focus:outline-none"
              />
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-white/40">Quick preset:</span>
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, greetingText: selectedPreset.recommendedGreeting }))}
                  className="text-[11px] text-amber-400/90 hover:text-amber-300 underline underline-offset-2"
                >
                  Use {selectedPreset.label} greeting
                </button>
              </div>
            </div>

            {/* Live Pill Preview */}
            <div className="pt-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-white/30 mb-2">
                Pill Appearance Preview:
              </div>
              <div className="p-3 rounded-full bg-black/80 border border-white/15 text-white/90 text-xs flex items-center justify-between gap-3 shadow-lg">
                <span className="truncate">
                  {form.greetingText || selectedPreset.recommendedGreeting}
                </span>
                <span className="text-white/40 text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 shrink-0">
                  Dismiss ✕
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Interactive Preview Screen */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#080a0f] p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">Live Simulator / Realtime Preview</h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-white/40">
              <span>Previewing: {selectedPreset.label}</span>
            </div>
          </div>

          <div className="relative h-64 sm:h-80 rounded-xl overflow-hidden border border-white/10 bg-black flex items-center justify-center">
            {/* Embedded Festival Effect in preview mode */}
            <div className="absolute inset-0 z-10 pointer-events-none">
              <FestivalEffect previewSettings={{ ...form, enabled: previewActive }} />
            </div>

            {/* Mock website background */}
            <div className="relative z-0 text-center px-4 max-w-md space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[11px] font-mono">
                <Sparkles className="w-3 h-3" />
                <span>DavinciWaleBhaiya Stage</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Cinematic Color Science
              </h2>
              <p className="text-xs text-white/50 leading-relaxed">
                Watch particles animate in real time. Clicks pass through seamlessly with zero mouse obstruction.
              </p>
              <div className="pt-2 flex justify-center gap-2">
                <div className="px-4 py-1.5 rounded-lg bg-white text-black font-semibold text-xs">
                  Download DCTL
                </div>
                <div className="px-4 py-1.5 rounded-lg bg-white/10 text-white text-xs border border-white/15">
                  View Catalogue
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div className="pt-4 flex items-center justify-between border-t border-white/[0.08]">
          <div className="text-xs text-white/40">
            Changes are saved to Supabase and immediately delivered via CDN Edge cache.
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs transition-all shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save & Apply to Website</span>
              </>
            )}
          </button>
        </div>

      </div>
    </AdminLayout>
  );
}
