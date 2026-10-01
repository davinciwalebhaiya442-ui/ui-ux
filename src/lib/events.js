'use client';

export function notifyProductsUpdated() {
  if (typeof window === 'undefined') return;
  try {
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel('dwb_products_channel');
      channel.postMessage({ type: 'PRODUCTS_UPDATED', timestamp: Date.now() });
      channel.close();
    }
    localStorage.setItem('dwb_products_updated', String(Date.now()));
  } catch {}
}
