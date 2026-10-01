import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import { AdminLayout } from '../AdminShell';

export default function SettingsPage() {
  return (
    <AdminLayout title="Settings">
      <div className="mb-7">
        <p className="font-mono text-[10px] uppercase tracking-[.24em] text-blue-300/70">System / Configuration</p>
        <h2 className="mt-2 text-3xl font-semibold">Settings</h2>
        <p className="mt-2 text-sm text-white/40">Manage your homepage hero visual environment and system configurations.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Link
          href="/admin/hero"
          className="group rounded-2xl border border-blue-500/30 bg-gradient-to-br from-[#0c1628] to-[#070b14] p-6 shadow-xl hover:border-blue-400/60 transition-all block"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white group-hover:text-blue-300 transition-colors">Hero Section Management</h3>
                <p className="text-xs text-white/60 mt-0.5">Customize hero title, background artwork image, typography & CTA</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

        <section className="rounded-2xl border border-white/[.08] bg-[#0a0f1b] p-6">
          <p className="font-mono text-[10px] uppercase tracking-widest text-white/35">Storage</p>
          <p className="mt-2 text-sm font-semibold text-white">Cloudflare R2 Private Object Storage</p>
          <p className="mt-1 text-xs text-white/60">Digital downloadable packages, product media, and hero visual assets.</p>
          <p className="mt-3 text-xs text-emerald-400 font-mono">Active &bull; Signed delivery URLs enabled</p>
        </section>
      </div>
    </AdminLayout>
  );
}
