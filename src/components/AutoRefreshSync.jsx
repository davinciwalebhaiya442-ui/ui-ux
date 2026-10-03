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

    // 1. Instant cross-tab sync via BroadcastChannel
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

    // 2. Cross-window / tab sync via storage event
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

    // 3. Cross-device poll (checks if database version changed every 5s)
    const checkVersion = async () => {
      if (document.hidden) return;
      try {
        const res = await fetch('/api/sync/status?_t=' + Date.now(), { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        const serverVersion = Number(data.version || 0);

        if (initialVersionRef.current === null) {
          initialVersionRef.current = serverVersion;
        } else if (serverVersion > initialVersionRef.current) {
          initialVersionRef.current = serverVersion;
          triggerRefresh();
        }
      } catch {}
    };

    const intervalId = setInterval(checkVersion, 5000);

    // 4. Tab visibility change & focus check
    const onFocus = () => {
      checkVersion();
    };
    window.addEventListener('focus', onFocus);
    window.addEventListener('visibilitychange', onFocus);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      clearInterval(intervalId);
      if (bc) bc.close();
      if (syncBc) syncBc.close();
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('visibilitychange', onFocus);
    };
  }, [router]);

  return null;
}
