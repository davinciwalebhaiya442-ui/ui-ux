'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function AutoRefreshSync() {
  const router = useRouter();
  const lastReloadRef = useRef(Date.now());
  const initialVersionRef = useRef(null);
  const isReloadingRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // NEVER auto-reload on admin pages so user never loses form progress
    const pathname = window.location.pathname || '';
    if (pathname.startsWith('/admin')) return;

    let timeoutId = null;

    const triggerRefresh = () => {
      if (isReloadingRef.current) return;
      const now = Date.now();
      if (now - lastReloadRef.current < 2000) return;
      lastReloadRef.current = now;

      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        isReloadingRef.current = true;
        try {
          router.refresh();
          window.location.reload();
        } catch {
          window.location.reload();
        }
      }, 500);
    };

    // 1. Instant cross-tab sync via BroadcastChannel (0 Vercel CPU)
    let bc = null;
    let syncBc = null;
    try {
      if ('BroadcastChannel' in window) {
        bc = new BroadcastChannel('dwb_products_channel');
        bc.onmessage = () => triggerRefresh();

        syncBc = new BroadcastChannel('dwb_sync_channel');
        syncBc.onmessage = () => triggerRefresh();
      }
    } catch {}

    // 2. Cross-window / tab sync via storage event (0 Vercel CPU)
    const onStorage = (e) => {
      if (
        e.key === 'dwb_products_updated' ||
        e.key === 'dwb_admin_sync' ||
        e.key === 'dwb_hero_updated' ||
        e.key === 'dwb_comparison_updated'
      ) {
        triggerRefresh();
      }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (bc) bc.close();
      if (syncBc) syncBc.close();
      window.removeEventListener('storage', onStorage);
    };
  }, [router]);

  return null;
}
