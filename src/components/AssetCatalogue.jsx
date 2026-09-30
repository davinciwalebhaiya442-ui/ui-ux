'use client';

import { useState, useMemo } from 'react';
import { CATEGORIES, SOFTWARE_OPTIONS } from '@/data/assets';
import { useProducts } from '@/data/useProducts';
import { Search, ArrowUpRight, Monitor } from 'lucide-react';
import ProductCardVisual from './ProductCardVisual';

export default function AssetCatalogue({ onSelectAsset }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [pricingFilter, setPricingFilter] = useState('all');
  const [selectedSoftware, setSelectedSoftware] = useState('All Software');
  const [sortBy, setSortBy] = useState('featured');
  const assets = useProducts();

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
            <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keyword, DCTL, OFX, or effect name..."
              className="w-full bg-[#080808] border border-white/[0.08] rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/30"
            />
          </div>

          {/* Pricing Toggle */}
          <div className="sm:col-span-3 flex bg-[#080808] p-1 rounded-lg border border-white/[0.08] text-xs">
            {['all', 'free', 'paid'].map((type) => (
              <button
                key={type}
                onClick={() => setPricingFilter(type)}
                className={`flex-1 py-1.5 rounded text-center transition-colors capitalize ${
                  pricingFilter === type
                    ? 'bg-white/10 text-white font-medium'
                    : 'text-white/40 hover:text-white'
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
              className="w-full bg-[#080808] border border-white/[0.08] rounded-lg px-3 py-2.5 text-xs text-white/80 focus:outline-none focus:border-white/30"
            >
              {SOFTWARE_OPTIONS.map((sw) => (
                <option key={sw} value={sw} className="bg-black text-white">
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
        <div className="py-20 text-center border border-white/[0.08] rounded-xl bg-[#080808]">
          <p className="text-xs font-mono text-white/50">No files found matching the selected filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              onClick={() => onSelectAsset(asset)}
              className="cursor-pointer group border border-white/[0.08] hover:border-white/25 transition-all duration-300 bg-[#080808] hover:bg-[#0b0f19] rounded-xl p-4 flex flex-col justify-between"
            >
              <div>
                <ProductCardVisual asset={asset} />
                <div className="flex items-center justify-between text-[10px] font-mono text-white/40 mb-2">
                  <span className="uppercase tracking-widest">{asset.category}</span>
                  <span>v{asset.version}</span>
                </div>

                <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-blue-300 transition-colors">
                  {asset.name}
                </h3>

                <p className="text-xs text-white/60 mt-1.5 line-clamp-2 leading-relaxed font-sans">
                  {asset.tagline}
                </p>
              </div>

              <div className="pt-5 mt-6 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
                <div>
                  {asset.type === 'free' ? (
                    <span className="text-emerald-400 font-semibold">FREE</span>
                  ) : (
                    <span className="text-white font-semibold">
                      ₹{asset.price.toLocaleString()} <span className="text-white/40 font-normal">(${asset.priceUSD})</span>
                    </span>
                  )}
                </div>

                <span className="text-white/40 group-hover:text-white flex items-center space-x-1">
                  <span>Inspect</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

    </section>
  );
}
