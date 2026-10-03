'use client';

export function notifyProductsUpdated(type = 'UPDATED') {
  if (typeof window === 'undefined') return;
  try {
    const timestamp = Date.now();
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel('dwb_products_channel');
      channel.postMessage({ type: 'PRODUCTS_UPDATED', action: type, timestamp });
      channel.close();

      const syncChannel = new BroadcastChannel('dwb_sync_channel');
      syncChannel.postMessage({ type: 'ADMIN_CHANGE', action: type, timestamp });
      syncChannel.close();
    }
    localStorage.setItem('dwb_products_updated', String(timestamp));
    localStorage.setItem('dwb_admin_sync', String(timestamp));
  } catch {}
}

export const notifyAdminChange = notifyProductsUpdated;

export function subscribeToProductUpdates(callback) {
  if (typeof window === 'undefined' || typeof callback !== 'function') {
    return () => {};
  }

  let bc = null;
  const onStorage = (e) => {
    if (
      e.key === 'dwb_products_updated' ||
      e.key === 'dwb_hero_updated' ||
      e.key === 'dwb_comparison_updated' ||
      e.key === 'dwb_admin_sync'
    ) {
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
