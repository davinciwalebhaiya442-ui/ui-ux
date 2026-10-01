'use client';

import { useEffect, useState } from 'react';

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

  useEffect(() => {
    let active = true;
    fetch('/api/products?limit=100')
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error('API unavailable'))))
      .then((data) => {
        if (active && data.products?.length) {
          setProducts(data.products);
          memoryProducts = data.products;
          try {
            localStorage.setItem('dwb_products_cache', JSON.stringify(data.products));
          } catch {}
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return products;
}
