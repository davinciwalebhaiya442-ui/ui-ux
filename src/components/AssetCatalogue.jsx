'use client';

import { useState, useMemo } from 'react';
import { CATEGORIES, SOFTWARE_OPTIONS } from '@/data/assets';
import { useProducts } from '@/data/useProducts';
import { Search, ArrowUpRight, Monitor } from 'lucide-react';
import ProductCardVisual from './ProductCardVisual';

export default function AssetCatalogue({ onSelectAsset, initialProducts = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [pricingFilter, setPricingFilter] = useState('all');
  const [selectedSoftware, setSelectedSoftware] = useState('All Software');
  const [sortBy, setSortBy] = useState('featured');
  const assets = useProducts(initialProducts);

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesSearch =
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All' ||
        (selectedCategory === 'Free' ? asset.type === 'free' : asset.category === selectedCategory);

      const matchesPricing =
        pricingFilter === 'all' ||
        (pricingFilter === 'free' && asset.type === 'free') ||
        (pricingFilter === 'paid' && asset.type === 'paid');

      const matchesSoftware =
        selectedSoftware === 'All Software' || asset.compatibility.some((sw) => sw.includes(selectedSoftware));

      return matchesSearch && matchesCategory && matchesPricing && matchesSoftware;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return a.id.localeCompare(b.id);
    });
  }, [assets, searchQuery, selectedCategory, pricingFilter, selectedSoftware, sortBy]);

  return (
    <section id="catalogue" className="relative py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.08]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-baseline justify-between mb-12 gap-6 pb-8 border-b border-white/[0.08]">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/40 block mb-2">
            02 / Asset Repository
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-sans">
            Catalogue & Downloads
          </h2>
        </div>
        <div className="text-xs font-mono text-white/40">
          INDEX: {filteredAssets.length} AVAILABLE FILES
        </div>
      </div>

      {/* Clean Finder Filter Bar */}
      <div className="space-y-4 mb-14">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          
          {/* Search Field */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-blue-400/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keyword, DCTL, OFX, or effect name..."
              className="w-full bg-[#0a0f1d] border border-white/[0.12] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-blue-400/60 focus:ring-1 focus:ring-blue-500/20 shadow-inner transition-all"
            />
          </div>

          {/* Pricing Toggle */}
          <div className="sm:col-span-3 flex bg-[#0a0f1d] p-1 rounded-xl border border-white/[0.12] text-xs">
            {['all', 'free', 'paid'].map((type) => (
              <button
                key={type}
                onClick={() => setPricingFilter(type)}
                className={`flex-1 py-1.5 rounded-lg text-center transition-all capitalize font-mono text-[11px] ${
                  pricingFilter === type
                    ? 'bg-blue-600/30 text-blue-300 font-semibold border border-blue-500/40 shadow-sm'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Software Selector */}
          <div className="sm:col-span-3">
            <select
              value={selectedSoftware}
              onChange={(e) => setSelectedSoftware(e.target.value)}
              className="w-full bg-[#0a0f1d] border border-white/[0.12] rounded-xl px-3 py-2.5 text-xs text-white/90 focus:outline-none focus:border-blue-400/60 focus:ring-1 focus:ring-blue-500/20 font-mono shadow-inner"
            >
              {SOFTWARE_OPTIONS.map((sw) => (
                <option key={sw} value={sw} className="bg-[#0a0f1d] text-white">
                  {sw}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Minimal Category Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors border ${
                selectedCategory === cat
                  ? 'bg-white text-black font-medium border-white'
                  : 'bg-transparent text-white/50 hover:text-white border-white/[0.06] hover:border-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product List Grid */}
      {filteredAssets.length === 0 ? (
        <div className="py-20 text-center border border-white/[0.1] rounded-2xl bg-[#080d1a]/60">
          <p className="text-xs font-mono text-white/50">No files found matching the selected filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              onClick={() => onSelectAsset(asset)}
              className="cursor-pointer group relative border border-white/[0.12] hover:border-blue-400/45 transition-all duration-300 bg-gradient-to-b from-[#0d1424]/95 via-[#090e1a]/95 to-[#060a12]/95 hover:from-[#111a30]/95 hover:to-[#080d18]/95 shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_16px_45px_rgba(7,18,44,0.7),0_0_25px_rgba(37,99,235,0.15)] rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:-translate-y-1 overflow-hidden"
            >
              {/* Subtle top edge glow on card hover */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-400/30 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

              <div>
                <ProductCardVisual asset={asset} />
                <div className="flex items-center justify-between text-[11px] font-mono text-white/50 mb-2">
                  <span className="uppercase tracking-widest text-blue-300/80 font-semibold">{asset.category}</span>
                  <span className="text-white/40">v{asset.version}</span>
                </div>

                <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-blue-200 transition-colors leading-snug">
                  {asset.name}
                </h3>

                <p className="text-xs text-white/70 mt-2 line-clamp-2 leading-relaxed font-sans">
                  {asset.tagline}
                </p>
              </div>

              <div className="pt-4 mt-6 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono">
                <div>
                  {asset.type === 'free' ? (
                    <span className="px-2.5 py-1 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold tracking-wide text-xs inline-block">
                      FREE
                    </span>
                  ) : (
                    <div className="flex items-baseline space-x-1.5">
                      <span className="text-white font-bold text-sm tracking-tight">
                        ₹{asset.price.toLocaleString()}
                      </span>
                      <span className="text-white/45 text-[11px] font-normal">
                        (${asset.priceUSD})
                      </span>
                    </div>
                  )}
                </div>

                {/* Explicit, high-affordance CTA pill */}
                <div className="px-3 py-1.5 rounded-lg bg-white/[0.06] group-hover:bg-blue-600/90 border border-white/[0.1] group-hover:border-blue-400/50 text-white/80 group-hover:text-white flex items-center space-x-1.5 transition-all duration-200 shadow-sm">
                  <span className="text-[11px] font-medium tracking-wide">View Details</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </section>
  );
}
