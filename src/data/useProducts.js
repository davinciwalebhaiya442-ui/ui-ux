'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';

let memoryProducts = null;

export function useProducts(initialProducts = null) {
  const [products, setProducts] = useState(() => {
    if (initialProducts && initialProducts.length > 0) {
      memoryProducts = initialProducts;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('dwb_products_cache', JSON.stringify(initialProducts));
        } catch {}
      }
      return initialProducts;
    }
    if (memoryProducts && memoryProducts.length > 0) {
      return memoryProducts;
    }
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('dwb_products_cache');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            memoryProducts = parsed;
            return parsed;
          }
        }
      } catch {}
    }
    return [];
  });

  const isFetchingRef = useRef(false);

  const fetchProducts = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      const res = await fetch('/api/products?limit=100&_t=' + Date.now(), {
        cache: 'no-store',
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
        memoryProducts = data.products;
        try {
          localStorage.setItem('dwb_products_cache', JSON.stringify(data.products));
        } catch {}
      }
    } catch {} finally {
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    // 1. Initial background fetch to verify fresh data
    fetchProducts();

    // 2. BroadcastChannel: Instant cross-tab sync when admin modifies products
    let bc = null;
    try {
      if ('BroadcastChannel' in window) {
        bc = new BroadcastChannel('dwb_products_channel');
        bc.onmessage = (event) => {
          if (event.data?.type === 'PRODUCTS_UPDATED') {
            fetchProducts();
          }
        };
      }
    } catch {}

    // 3. Storage event listener (fallback for cross-window / tab sync)
    const handleStorage = (e) => {
      if (e.key === 'dwb_products_updated' || e.key === 'dwb_products_cache') {
        fetchProducts();
      }
    };
    window.addEventListener('storage', handleStorage);

    // 4. Focus & Visibility Change: Auto-sync when user returns to this tab
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchProducts();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);

    // 5. Supabase Realtime channel for cross-device live updates
    let sub = null;
    try {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        sub = supabase
          .channel('dwb_products_realtime')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'Product' }, () => {
            fetchProducts();
          })
          .subscribe();
      }
    } catch {}

    // 6. Polling interval: Auto-check every 5 seconds while tab is active
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchProducts();
      }
    }, 5000);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorage);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
      clearInterval(interval);
      if (sub) {
        try {
          const supabase = getSupabaseBrowserClient();
          supabase.removeChannel(sub);
        } catch {}
      }
    };
  }, [fetchProducts]);

  return products;
}
