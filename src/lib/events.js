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

export function subscribeToProductUpdates(callback) {
  if (typeof window === 'undefined' || typeof callback !== 'function') {
    return () => {};
  }

  let bc = null;
  const onStorage = (e) => {
    if (e.key === 'dwb_products_updated' || e.key === 'dwb_hero_updated' || e.key === 'dwb_comparison_updated') {
      try {
        callback();
      } catch {}
    }
  };

  try {
    window.addEventListener('storage', onStorage);
    if ('BroadcastChannel' in window) {
      bc = new BroadcastChannel('dwb_products_channel');
      bc.onmessage = () => {
        try {
          callback();
        } catch {}
      };
    }
  } catch {}

  return () => {
    try {
      window.removeEventListener('storage', onStorage);
      if (bc) {
        bc.close();
      }
    } catch {}
  };
}
