'use client';

import { useEffect, useState } from 'react';
import { ASSETS } from './assets';

export function useProducts() {
  const [products, setProducts] = useState(ASSETS);
  useEffect(() => {
    let active = true;
    fetch('/api/products?limit=100')
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('API unavailable')))
      .then((data) => { if (active && data.products?.length) setProducts(data.products); })
      .catch(() => { /* Local catalogue remains the development fallback. */ });
    return () => { active = false; };
  }, []);
  return products;
}
