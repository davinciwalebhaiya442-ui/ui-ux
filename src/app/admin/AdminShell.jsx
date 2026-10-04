'use client';

import { createContext, useContext, useEffect, useMemo, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { notifyProductsUpdated } from '@/lib/events';
import {
  LayoutDashboard,
  Package,
  FolderKanban,
  Download,
  ShoppingBag,
  Users,
  BarChart3,
  FileText,
  BriefcaseBusiness,
  CircleHelp,
  Wrench,
  Settings,
  Menu,
  X,
  Search,
  Plus,
  ExternalLink,
  Pencil,
  Trash2,
  Grid3X3,
  List,
  Image as ImageIcon,
  ChevronRight,
  Bell,
  LogOut,
  ChevronDown,
  Copy,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Filter,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  Sparkles,
  Command,
  SlidersHorizontal,
  PanelsTopBottom,
} from 'lucide-react';

// Context for Toasts & Confirmations
const AdminContext = createContext({
  toast: () => {},
  confirm: () => Promise.resolve(false),
  collapsed: false,
  setCollapsed: () => {},
});

export const useAdmin = () => useContext(AdminContext);

export function AdminProvider({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('dwb_admin_collapsed');
      if (saved !== null) setCollapsed(saved === 'true');
    } catch {}
  }, []);

  const handleSetCollapsed = (val) => {
    setCollapsed(val);
    try {
      localStorage.setItem('dwb_admin_collapsed', String(val));
    } catch {}
  };

  const showToast = (message, type = 'info') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const askConfirm = (arg1, arg2) => {
    let title = 'Are you sure?';
    let message = 'This action cannot be undone.';
    let confirmText = 'Delete';
    let destructive = true;

    if (typeof arg1 === 'string') {
      title = arg1;
      if (arg2) message = arg2;
    } else if (arg1 && typeof arg1 === 'object') {
      title = arg1.title || title;
      message = arg1.message || message;
      confirmText = arg1.confirmText || confirmText;
      destructive = arg1.destructive !== undefined ? arg1.destructive : destructive;
    }

    return new Promise((resolve) => {
      setConfirmDialog({
        title,
        message,
        confirmText,
        destructive,
        onConfirm: () => {
          setConfirmDialog(null);
          resolve(true);
        },
        onCancel: () => {
          setConfirmDialog(null);
          resolve(false);
        },
      });
    });
  };

  return (
    <AdminContext.Provider
      value={{
        toast: showToast,
        confirm: askConfirm,
        collapsed,
        setCollapsed: handleSetCollapsed,
      }}
    >
      {children}

      {/* GLOBAL TOAST POPUP */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-2 rounded-xl border border-white/15 bg-[#0e1628] px-4 py-3 text-xs text-white shadow-2xl animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage.message}</span>
        </div>
      )}

      {/* GLOBAL CONFIRMATION MODAL */}
      {confirmDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#090d16] p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${confirmDialog.destructive ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-blue-500/10 text-blue-400'}`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">{confirmDialog.title}</h3>
            </div>
            <p className="mt-3 text-xs text-white/60 leading-relaxed font-sans">
              {confirmDialog.message}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={confirmDialog.onCancel}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs text-white/70 hover:text-white hover:bg-white/[0.05] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors ${
                  confirmDialog.destructive
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-white hover:bg-white/90 text-black'
                }`}
              >
                {confirmDialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminContext.Provider>
  );
}

const NAV_ITEMS = [
  { group: 'OVERVIEW', items: [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  ]},
  { group: 'CATALOGUE', items: [
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Categories', href: '/admin/categories', icon: FolderKanban },
    { label: 'Downloads', href: '/admin/downloads', icon: Download },
    { label: 'Tools', href: '/admin/tools', icon: Wrench },
  ]},
  { group: 'CONTENT', items: [
    { label: 'Posts & Prompts', href: '/admin/content', icon: FileText },
  ]},
  { group: 'BUSINESS', items: [
    { label: 'Orders', href: '/admin/orders', icon: ShoppingBag, badgeKey: 'orders' },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Studio Requests', href: '/admin/studio', icon: BriefcaseBusiness, badgeKey: 'studio' },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  ]},
  { group: 'SITE', items: [
    { label: 'Hero Settings', href: '/admin/hero', icon: Sparkles },
    { label: 'Before/After Comparison', href: '/admin/comparison', icon: SlidersHorizontal },
    { label: 'Site Pages & Legal', href: '/admin/pages', icon: FileText },
    { label: 'FAQ', href: '/admin/faq', icon: CircleHelp },
    { label: 'Footer Settings', href: '/admin/footer', icon: PanelsTopBottom },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ]},
];

// Product Image Thumbnail supporting R2 Streaming
export function ProductThumb({ product, className = '' }) {
  const [failed, setFailed] = useState(false);
  const raw =
    product?.thumbnailKey ||
    (Array.isArray(product?.previewImages) ? product.previewImages[0] : null) ||
    product?.image;

  const image = raw
    ? String(raw).startsWith('http') || String(raw).startsWith('/')
      ? raw
      : `/api/media?key=${encodeURIComponent(raw)}`
    : null;

  useEffect(() => {
    setFailed(false);
  }, [image]);

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-[#121929] via-[#090d16] to-[#04060b] border border-white/[0.08] ${className}`}
    >
      {image && !failed ? (
        <img
          src={image}
          alt={product?.name || ''}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full min-h-[100px] flex-col items-center justify-center gap-1.5 text-white/30 p-2">
          <ImageIcon className="h-6 w-6" />
          <span className="text-center text-[9px] font-mono uppercase tracking-widest text-white/40 truncate max-w-full">
            {product?.category || 'Preview'}
          </span>
        </div>
      )}
    </div>
  );
}

// Global Command Palette (CMD + K)
function CommandPalette({ open, onClose }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ products: [], users: [], orders: [], content: [], studio: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ products: [], users: [], orders: [], content: [], studio: [] });
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults({ products: [], users: [], orders: [], content: [], studio: [] });
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || { products: [], users: [], orders: [], content: [], studio: [] });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  if (!open) return null;

  const navigateTo = (href) => {
    onClose();
    router.push(href);
  };

  const hasResults =
    results.products.length > 0 ||
    results.users.length > 0 ||
    results.orders.length > 0 ||
    results.content.length > 0 ||
    results.studio.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-[#090d16] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[75vh]">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.08] bg-black/40">
          <Search className="w-4 h-4 text-white/40" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search products, orders, customers, studio requests... (ESC to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white placeholder-white/40 outline-none"
          />
          {loading && <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />}
          <kbd className="px-2 py-0.5 text-[10px] font-mono text-white/40 bg-white/[0.05] border border-white/10 rounded">
            ESC
          </kbd>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {!query && (
            <div className="p-6 text-center text-xs text-white/40">
              <Command className="w-6 h-6 mx-auto mb-2 text-white/20" />
              Type 2 or more characters to search across products, orders, content, and users.
            </div>
          )}

          {query && !loading && !hasResults && (
            <div className="p-8 text-center text-xs text-white/40 font-mono">
              No results found for &ldquo;{query}&rdquo;
            </div>
          )}

          {/* Products */}
          {results.products.length > 0 && (
            <div>
              <p className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-blue-400/80">Products</p>
              <div className="space-y-1">
                {results.products.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => navigateTo(`/admin/products/${p.slug || p.id}/edit`)}
                    className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/[0.05] text-xs transition-colors"
                  >
                    <div>
                      <span className="font-medium text-white">{p.name}</span>
                      <span className="ml-2 text-white/40 text-[10px] uppercase">({p.type})</span>
                    </div>
                    <span className="text-[10px] text-white/40 font-mono">Edit ↗</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Orders */}
          {results.orders.length > 0 && (
            <div>
              <p className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-emerald-400/80">Orders</p>
              <div className="space-y-1">
                {results.orders.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => navigateTo('/admin/orders')}
                    className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/[0.05] text-xs transition-colors"
                  >
                    <div>
                      <span className="font-medium text-white">{o.orderNumber}</span>
                      <span className="ml-2 text-emerald-400 text-[10px]">₹{o.total.toLocaleString()}</span>
                    </div>
                    <span className="text-[10px] text-white/40 uppercase">{o.status}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Users */}
          {results.users.length > 0 && (
            <div>
              <p className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-amber-400/80">Users</p>
              <div className="space-y-1">
                {results.users.map((u) => (
                  <button
                    key={u.userId}
                    onClick={() => navigateTo('/admin/users')}
                    className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/[0.05] text-xs transition-colors"
                  >
                    <div>
                      <span className="font-medium text-white">{u.email || u.name || u.userId}</span>
                      <span className="ml-2 text-white/40 text-[10px]">({u.role})</span>
                    </div>
                    <span className="text-[10px] text-white/40 font-mono">Inspect ↗</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Studio Requests */}
          {results.studio.length > 0 && (
            <div>
              <p className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-purple-400/80">Studio Requests</p>
              <div className="space-y-1">
                {results.studio.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => navigateTo('/admin/studio')}
                    className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/[0.05] text-xs transition-colors"
                  >
                    <div>
                      <span className="font-medium text-white">{s.name}</span>
                      <span className="ml-2 text-white/40 text-[10px]">{s.requestType}</span>
                    </div>
                    <span className="text-[10px] text-purple-300 font-mono">{s.status}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Master Admin Layout with Collapsible Sidebar, Header, Notifications & Global Search
export function AdminLayout({ children, title = 'Dashboard' }) {
  const pathname = usePathname();
  const router = useRouter();

  const { collapsed, setCollapsed, toast: showToast, confirm: askConfirm } = useAdmin();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [badgeCounts, setBadgeCounts] = useState({ studio: 0, orders: 0 });

  // Keyboard shortcut CMD+K / CTRL+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setCommandOpen(false);
        setNotifOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync collapsed state with localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('dwb_admin_collapsed');
      if (saved !== null) setCollapsed(saved === 'true');
    } catch {}
  }, []);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem('dwb_admin_collapsed', String(next));
    } catch {}
  };

  // Load live notifications
  useEffect(() => {
    fetch('/api/admin/notifications')
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
        setBadgeCounts({
          studio: data.studioCount || 0,
          orders: data.orderCount || 0,
        });
      })
      .catch(() => {});
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    window.location.href = '/login?next=/admin';
  };

  // Build Breadcrumbs
  const pathParts = pathname.split('/').filter(Boolean);
  const breadcrumbs = pathParts.map((part, index) => {
    const href = '/' + pathParts.slice(0, index + 1).join('/');
    return { label: part.charAt(0).toUpperCase() + part.slice(1), href };
  });

  return (
    <div className="min-h-screen bg-[#05070d] text-white flex flex-col font-sans selection:bg-blue-500/20 selection:text-white">
        
        {/* MOBILE SLIDE-OVER OVERLAY */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* SIDEBAR */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/[0.08] bg-[#070a12] transition-all duration-300 ease-in-out
            ${collapsed ? 'w-20' : 'w-64'}
            ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          {/* Top Brand Bar */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-white/[0.08]">
            <Link href="/admin" className="flex items-center gap-3 overflow-hidden">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-blue-400 shadow-[0_0_12px_#60a5fa]" />
              {!collapsed && (
                <div className="flex flex-col">
                  <span className="text-sm font-semibold tracking-tight text-white whitespace-nowrap">
                    DavinciWale<span className="text-white/40">Bhaiya</span>
                  </span>
                  <span className="text-[9px] font-mono text-blue-400/80 uppercase tracking-widest">
                    Creator CMS
                  </span>
                </div>
              )}
            </Link>

            {/* Collapse toggle (desktop) / close (mobile) */}
            <div className="flex items-center">
              <button
                onClick={toggleCollapsed}
                title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                className="hidden lg:flex p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.05] transition-colors"
              >
                {collapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setMobileOpen(false)}
                className="lg:hidden p-1.5 rounded-lg text-white/50 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Nav List */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-none">
            {NAV_ITEMS.map((group) => (
              <div key={group.group}>
                {!collapsed && (
                  <p className="px-3 mb-2 font-mono text-[9px] uppercase tracking-[0.24em] text-white/30">
                    {group.group}
                  </p>
                )}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      item.href === '/admin'
                        ? pathname === '/admin'
                        : pathname === item.href || pathname.startsWith(`${item.href}/`);
                    const badge = item.badgeKey && badgeCounts[item.badgeKey] > 0 ? badgeCounts[item.badgeKey] : null;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        title={collapsed ? item.label : undefined}
                        className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-blue-500/15 text-blue-200 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                            : 'text-white/50 hover:bg-white/[0.04] hover:text-white border border-transparent'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'text-blue-400' : 'group-hover:scale-110'}`} />
                        {!collapsed && (
                          <span className="truncate flex-1">{item.label}</span>
                        )}
                        {!collapsed && badge && (
                          <span className="px-1.5 py-0.5 text-[9px] font-mono rounded-full bg-blue-500 text-white font-semibold">
                            {badge}
                          </span>
                        )}
                        {/* Collapsed Tooltip on Hover */}
                        {collapsed && (
                          <div className="absolute left-full ml-2 px-2.5 py-1 bg-[#0f172a] text-white text-xs rounded-md shadow-xl border border-white/10 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                            {item.label}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Profile / Quick Info */}
          <div className="p-3 border-t border-white/[0.08] bg-black/20">
            <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} gap-2`}>
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-xs font-bold text-blue-200 shrink-0">
                  DW
                </div>
                {!collapsed && (
                  <div className="flex flex-col truncate">
                    <span className="text-xs font-medium text-white truncate">Administrator</span>
                    <span className="text-[10px] font-mono text-emerald-400">Verified Session</span>
                  </div>
                )}
              </div>
              {!collapsed && (
                <button
                  onClick={handleLogout}
                  title="Sign out of admin"
                  className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* MAIN AREA */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${collapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
          
          {/* TOP HEADER */}
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.08] bg-[#05070d]/85 px-4 sm:px-8 backdrop-blur-xl">
            {/* Left: Mobile Toggle & Breadcrumbs */}
            <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
              <button
                onClick={() => setMobileOpen(true)}
                className="p-1.5 rounded-lg text-white/70 hover:bg-white/[0.05] lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-xs truncate">
                <Link href="/admin" className="text-white/40 hover:text-white transition-colors">
                  Admin
                </Link>
                {breadcrumbs.slice(1).map((b, i) => (
                  <div key={b.href} className="flex items-center gap-2">
                    <ChevronRight className="w-3.5 h-3.5 text-white/20 shrink-0" />
                    <span className={i === breadcrumbs.length - 2 ? 'text-white font-medium' : 'text-white/40'}>
                      {b.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Global Search Trigger (CMD+K) */}
              <button
                onClick={() => setCommandOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 px-3 py-1.5 text-xs text-white/50 transition-all"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Search anything…</span>
                <kbd className="hidden sm:inline px-1.5 py-0.5 text-[9px] font-mono bg-white/[0.06] border border-white/10 rounded text-white/60">
                  ⌘K
                </kbd>
              </button>

              {/* Notifications Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setNotifOpen((prev) => !prev)}
                  className="relative p-2 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-white/60 hover:text-white transition-all"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-500 text-[9px] font-mono font-bold text-white flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-white/10 bg-[#090d16] p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between border-b border-white/[0.08] pb-2 mb-2 px-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-white">Notifications</span>
                      <span className="text-[10px] font-mono text-white/40">{notifications.length} events</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto space-y-1.5">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-center text-xs text-white/40">No new notifications</p>
                      ) : (
                        notifications.map((n) => (
                          <Link
                            key={n.id}
                            href={n.href}
                            onClick={() => setNotifOpen(false)}
                            className="block p-2.5 rounded-xl hover:bg-white/[0.04] transition-colors border border-transparent hover:border-white/[0.06]"
                          >
                            <div className="flex items-center justify-between text-xs font-medium text-white">
                              <span>{n.title}</span>
                              <span className="text-[9px] font-mono text-white/40">
                                {new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-[11px] text-white/50 mt-0.5 line-clamp-1">{n.description}</p>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* View Public Site */}
              <Link
                href="/"
                target="_blank"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:text-white px-3 py-1.5 text-xs text-white/60 transition-all"
              >
                <span>Store</span>
                <ExternalLink className="w-3 h-3 text-white/40" />
              </Link>
            </div>
          </header>

          {/* PAGE CONTENT CONTAINER */}
          <main className="flex-1 mx-auto w-full max-w-[1560px] p-4 sm:p-8">
            {children}
          </main>
        </div>

        {/* GLOBAL COMMAND PALETTE MODAL */}
        <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
      </div>
  );
}

// DASHBOARD COMPONENT WITH REAL DATA & PERIOD TOGGLE
export function Dashboard() {
  const [period, setPeriod] = useState('30d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = (p) => {
    setLoading(true);
    fetch(`/api/admin/overview?period=${p}`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboard(period);
  }, [period]);

  const s = data?.stats;
  const pActions = data?.pendingActions;

  return (
    <AdminLayout title="Overview">
      {/* Top Welcome & Period Select */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-blue-400">
            DavinciWaleBhaiya / Command Center
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Ecosystem Overview
          </h2>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1 p-1 bg-white/[0.04] border border-white/10 rounded-xl text-xs">
          {[
            { label: 'Today', value: 'today' },
            { label: '7D', value: '7d' },
            { label: '30D', value: '30d' },
            { label: '90D', value: '90d' },
            { label: 'All', value: 'all' },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setPeriod(item.value)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                period === item.value
                  ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                  : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
        <MetricCard
          label="Total Revenue"
          value={s ? `₹${s.revenue.toLocaleString()}` : '—'}
          note={period === 'all' ? 'All verified checkouts' : `In selected ${period}`}
          tone="green"
        />
        <MetricCard
          label="Orders"
          value={s?.orders ?? '—'}
          note={`${s?.totalOrders ?? 0} all-time`}
        />
        <MetricCard
          label="Products"
          value={s?.products ?? '—'}
          note={`${s?.publishedProducts ?? 0} active in catalogue`}
        />
        <MetricCard
          label="Customers"
          value={s?.users ?? '—'}
          note="Registered accounts"
        />
        <MetricCard
          label="Downloads"
          value={s?.downloads ?? '—'}
          note={`${s?.totalDownloads ?? 0} all-time`}
        />
        <MetricCard
          label="Pending Studio"
          value={s?.pendingStudioRequests ?? '—'}
          note="Awaiting review"
          tone={s?.pendingStudioRequests > 0 ? 'amber' : 'default'}
        />
      </div>

      {/* REVENUE CHART & PENDING ACTIONS */}
      <div className="grid gap-6 lg:grid-cols-12 mb-8">
        {/* Revenue SVG Visualization (8 Cols) */}
        <section className="lg:col-span-8 rounded-2xl border border-white/[0.08] bg-[#080c16] p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">Performance</p>
              <h3 className="text-base font-semibold text-white mt-1">Revenue & Checkout Activity</h3>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="w-2 h-2 rounded-full bg-blue-400" /> Revenue
              </span>
            </div>
          </div>

          {/* SVG Line / Bar Graph */}
          {data?.chart?.revenue?.length ? (
            <div className="h-56 w-full flex items-end gap-2 pt-6">
              {data.chart.revenue.map((val, idx) => {
                const maxVal = Math.max(...data.chart.revenue, 100);
                const heightPct = Math.max(8, Math.round((val / maxVal) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                    <div className="w-full bg-white/[0.03] hover:bg-blue-500/20 rounded-md transition-colors relative flex items-end justify-center h-44">
                      <div
                        style={{ height: `${heightPct}%` }}
                        className="w-full max-w-[28px] rounded-md bg-gradient-to-t from-blue-600 to-sky-400 opacity-80 group-hover:opacity-100 transition-all shadow-[0_0_12px_rgba(56,189,248,0.2)]"
                      />
                    </div>
                    <span className="text-[9px] font-mono text-white/35 truncate max-w-[40px]">
                      {data.chart.labels[idx]}
                    </span>
                    {/* Tooltip on hover */}
                    <div className="absolute -top-8 px-2 py-1 bg-black border border-white/15 rounded text-[10px] font-mono text-white pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                      ₹{val.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center text-xs text-white/40 font-mono">
              Awaiting checkout data to render trend.
            </div>
          )}
        </section>

        {/* Pending Actions & Alerts (4 Cols) */}
        <section className="lg:col-span-4 rounded-2xl border border-white/[0.08] bg-[#080c16] p-6 flex flex-col justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">Action Items</p>
            <h3 className="text-base font-semibold text-white mt-1">Pending Tasks</h3>
            
            <div className="space-y-3 mt-5">
              <Link
                href="/admin/studio"
                className="flex items-center justify-between p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
              >
                <div>
                  <p className="text-xs font-medium text-white">Studio Client Briefs</p>
                  <p className="text-[10px] text-white/40 mt-0.5">Submissions needing colorist review</p>
                </div>
                <span className={`px-2.5 py-1 text-xs font-mono font-semibold rounded-lg ${pActions?.studioRequests > 0 ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'text-white/40 bg-white/5'}`}>
                  {pActions?.studioRequests ?? 0}
                </span>
              </Link>

              <Link
                href="/admin/products"
                className="flex items-center justify-between p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
              >
                <div>
                  <p className="text-xs font-medium text-white">Unpublished Drafts</p>
                  <p className="text-[10px] text-white/40 mt-0.5">Assets ready to be reviewed & published</p>
                </div>
                <span className="px-2.5 py-1 text-xs font-mono font-semibold rounded-lg text-white/60 bg-white/5">
                  {pActions?.unpublishedDrafts ?? 0}
                </span>
              </Link>

              <Link
                href="/admin/products"
                className="flex items-center justify-between p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
              >
                <div>
                  <p className="text-xs font-medium text-white">Missing Product Media</p>
                  <p className="text-[10px] text-white/40 mt-0.5">Upload screenshots or cover art</p>
                </div>
                <span className="px-2.5 py-1 text-xs font-mono font-semibold rounded-lg text-white/60 bg-white/5">
                  {pActions?.missingMedia ?? 0}
                </span>
              </Link>
            </div>
          </div>

          <div className="pt-4 border-t border-white/[0.06]">
            <Link
              href="/admin/products/new"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-medium text-black hover:bg-white/90 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add New Asset
            </Link>
          </div>
        </section>
      </div>

      {/* TOP ASSETS & RECENT ORDERS */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Assets */}
        <section className="rounded-2xl border border-white/[0.08] bg-[#080c16] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">Top Performing Assets</h3>
            <Link href="/admin/products" className="text-xs text-blue-400 hover:underline">
              All products ↗
            </Link>
          </div>
          <div className="space-y-3">
            {data?.topProducts?.length ? (
              data.topProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-blue-400/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <ProductThumb product={p} className="w-12 h-12 shrink-0 rounded-lg" />
                    <div className="truncate">
                      <p className="text-xs font-medium text-white truncate">{p.name}</p>
                      <p className="text-[10px] text-white/40 font-mono mt-0.5">{p.category} · {p.type}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-mono font-semibold text-white">
                      {p.type === 'FREE' ? 'FREE' : `₹${p.price.toLocaleString()}`}
                    </p>
                    <p className="text-[10px] font-mono text-white/40 mt-0.5">
                      {p.downloadsCount} downloads
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="p-8 text-center text-xs text-white/40 font-mono">No product activity recorded.</p>
            )}
          </div>
        </section>

        {/* Recent Orders */}
        <section className="rounded-2xl border border-white/[0.08] bg-[#080c16] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">Recent Orders</h3>
            <Link href="/admin/orders" className="text-xs text-blue-400 hover:underline">
              All orders ↗
            </Link>
          </div>
          <div className="space-y-3">
            {data?.recent?.orders?.length ? (
              data.recent.orders.map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-white/20 transition-colors"
                >
                  <div className="truncate">
                    <p className="text-xs font-mono font-medium text-white">{o.orderNumber}</p>
                    <p className="text-[10px] text-white/40 truncate mt-0.5">
                      {o.user?.email || 'Customer'} · {o.items?.length || 0} items
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-mono font-semibold text-emerald-400">
                      ₹{o.total.toLocaleString()}
                    </p>
                    <span className="inline-block mt-0.5 text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300">
                      {o.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="p-8 text-center text-xs text-white/40 font-mono">No orders placed yet.</p>
            )}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}

function MetricCard({ label, value, note, tone = 'default' }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#080c16] p-5 shadow-lg">
      <p className="text-xs font-medium text-white/50">{label}</p>
      <p className={`mt-2 text-2xl font-bold font-mono tracking-tight ${
        tone === 'green' ? 'text-emerald-400' : tone === 'amber' ? 'text-amber-300' : 'text-white'
      }`}>
        {value}
      </p>
      <p className="mt-1 text-[10px] text-white/40 font-mono truncate">{note}</p>
    </div>
  );
}

// PRODUCTION-READY PRODUCT LIST COMPONENT
export function ProductList() {
  const { toast, confirm } = useAdmin();
  const router = useRouter();

  const [products, setProducts] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('dwb_products_cache');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return [];
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('dwb_products_cache');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return false;
        }
      } catch {}
    }
    return true;
  });

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [published, setPublished] = useState('');
  const [sort, setSort] = useState('newest');
  const [view, setView] = useState('grid');

  const loadData = async (isBackground = false) => {
    if (!isBackground && products.length === 0) setLoading(true);
    try {
      const [prodsRes, catsRes] = await Promise.all([
        fetch('/api/products?limit=100'),
        fetch('/api/categories'),
      ]);
      const prodsData = await prodsRes.json();
      const catsData = await catsRes.json();
      if (prodsData.products) {
        setProducts(prodsData.products);
        try {
          localStorage.setItem('dwb_products_cache', JSON.stringify(prodsData.products));
        } catch {}
      }
      if (catsData.categories) setCategories(catsData.categories);
    } catch (err) {
      console.error(err);
      toast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(products.length > 0);
  }, []);

  // Filtered & Sorted
  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.slug.toLowerCase().includes(search.toLowerCase());
      const matchCategory = !category || p.category === category;
      const matchType = !type || p.type.toUpperCase() === type.toUpperCase();
      const matchPublished = published === '' || String(p.published) === published;
      return matchSearch && matchCategory && matchType && matchPublished;
    }).sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'price-low') return a.price - b.price;
      if (sort === 'price-high') return b.price - a.price;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [products, search, category, type, published, sort]);

  // Actions
  const handleDelete = async (id, name) => {
    const ok = await confirm({
      title: 'Delete Asset Permanently?',
      message: `Are you sure you want to delete "${name}"? This action cannot be undone and will delete all associated download records.`,
      confirmText: 'Delete Asset',
      destructive: true,
    });
    if (!ok) return;

    try {
      const target = encodeURIComponent(id);
      const res = await fetch(`/api/products/${target}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');
      toast(`"${name}" deleted successfully`, 'success');
      setProducts((prev) => {
        const updated = prev.filter((p) => p.id !== id && p.dbId !== id && p.slug !== id);
        try {
          localStorage.setItem('dwb_products_cache', JSON.stringify(updated));
        } catch {}
        return updated;
      });
      notifyProductsUpdated();
      loadData(true);
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const handleTogglePublish = async (id, currentPublished) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ published: !currentPublished }),
      });
      if (!res.ok) throw new Error('Toggle failed');
      toast(!currentPublished ? 'Asset published to store' : 'Asset moved to draft');
      notifyProductsUpdated();
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDuplicate = async (p) => {
    const newSlug = `${p.slug}-copy-${Date.now().toString().slice(-4)}`;
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...p,
          name: `${p.name} (Copy)`,
          slug: newSlug,
          published: false,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Duplicate failed');
      toast('Asset duplicated successfully');
      notifyProductsUpdated();
      router.push(`/admin/products/${data.product.slug || data.product.id}/edit`);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <AdminLayout title="Products">
      {/* Top Banner */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-blue-400">
            Store / Asset Repository
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Digital Products & Tools
          </h2>
          <p className="mt-1 text-xs text-white/50">
            Total {filtered.length} matching asset{filtered.length === 1 ? '' : 's'} in ecosystem
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-semibold text-black hover:bg-white/90 transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" /> Create Product
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#080c16] p-4">
        {/* Search */}
        <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs">
          <Search className="w-4 h-4 text-white/30 shrink-0" />
          <input
            type="text"
            placeholder="Search by product name or slug…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-white placeholder-white/35 outline-none"
          />
        </div>

        {/* Category Filter */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white/80 outline-none"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name} className="bg-black text-white">
              {c.name}
            </option>
          ))}
        </select>

        {/* Type Filter */}
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white/80 outline-none"
        >
          <option value="">All Types</option>
          <option value="FREE" className="bg-black text-white">Free</option>
          <option value="PAID" className="bg-black text-white">Paid</option>
        </select>

        {/* Status Filter */}
        <select
          value={published}
          onChange={(e) => setPublished(e.target.value)}
          className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white/80 outline-none"
        >
          <option value="">All Status</option>
          <option value="true" className="bg-black text-white">Published</option>
          <option value="false" className="bg-black text-white">Draft</option>
        </select>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white/80 outline-none"
        >
          <option value="newest" className="bg-black text-white">Newest First</option>
          <option value="name" className="bg-black text-white">Name A-Z</option>
          <option value="price-low" className="bg-black text-white">Price Low-High</option>
          <option value="price-high" className="bg-black text-white">Price High-Low</option>
        </select>

        {/* View Toggle */}
        <div className="flex rounded-xl border border-white/10 bg-black/40 p-1">
          <button
            onClick={() => setView('grid')}
            className={`p-1.5 rounded-lg transition-colors ${view === 'grid' ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white'}`}
            title="Grid view"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-1.5 rounded-lg transition-colors ${view === 'list' ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white'}`}
            title="Table view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid or Table List */}
      {loading ? (
        <div className="p-16 text-center text-xs text-white/40 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
          <span>Loading assets…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-16 text-center rounded-2xl border border-dashed border-white/10 bg-[#080c16]">
          <p className="text-sm text-white/60">No assets match your search criteria.</p>
          <button
            onClick={() => { setSearch(''); setCategory(''); setType(''); setPublished(''); }}
            className="mt-4 px-4 py-2 text-xs text-blue-400 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : view === 'grid' ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
            <article
              key={p.id}
              className="group rounded-2xl border border-white/[0.08] bg-[#080c16] hover:border-white/25 transition-all overflow-hidden flex flex-col justify-between"
            >
              <div className="p-3">
                <ProductThumb product={p} className="h-44 w-full" />
                <div className="p-3">
                  <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                    <span className="uppercase text-blue-400 font-semibold">{p.category}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] ${p.published ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-white/40'}`}>
                      {p.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white tracking-tight truncate group-hover:text-blue-300 transition-colors">
                    {p.name}
                  </h3>
                  <p className="text-xs text-white/50 mt-1 line-clamp-2 leading-relaxed font-sans">
                    {p.tagline || p.description}
                  </p>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-5 py-3.5 border-t border-white/[0.06] bg-black/30 flex items-center justify-between text-xs font-mono">
                <span className="font-semibold text-white">
                  {p.type === 'free' ? 'FREE' : `₹${p.price.toLocaleString()}`}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleTogglePublish(p.id, p.published)}
                    title={p.published ? 'Unpublish' : 'Publish'}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                  >
                    {p.published ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-white/40" />}
                  </button>
                  <button
                    onClick={() => handleDuplicate(p)}
                    title="Duplicate asset"
                    className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <Link
                    href={`/admin/products/${p.slug || p.id}/edit`}
                    title="Edit asset"
                    className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(p.dbId || p.id, p.name)}
                    title="Delete permanently"
                    className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#080c16]">
          <table className="w-full min-w-[880px] text-left text-xs">
            <thead className="text-white/40 font-mono text-[10px] uppercase border-b border-white/[0.08] bg-black/40">
              <tr>
                <th className="px-5 py-4">Asset</th>
                <th className="px-4 py-4">Category</th>
                <th className="px-4 py-4">Type</th>
                <th className="px-4 py-4">Price</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <ProductThumb product={p} className="w-12 h-12 shrink-0 rounded-lg" />
                      <div>
                        <p className="font-semibold text-white text-sm">{p.name}</p>
                        <p className="text-[10px] font-mono text-white/40">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-white/60">{p.category}</td>
                  <td className="px-4 py-3 font-mono uppercase text-white/60">{p.type}</td>
                  <td className="px-4 py-3 font-mono font-semibold text-white">
                    {p.type === 'free' ? 'FREE' : `₹${p.price.toLocaleString()}`}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono ${p.published ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-white/40'}`}>
                      {p.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleTogglePublish(p.id, p.published)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-white/60"
                        title={p.published ? 'Unpublish' : 'Publish'}
                      >
                        {p.published ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleDuplicate(p)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-white/60"
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <Link
                        href={`/admin/products/${p.slug || p.id}/edit`}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(p.dbId || p.id, p.name)}
                        className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}

// CATEGORY LIST COMPONENT
export function CategoryList() {
  const { toast, confirm } = useAdmin();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  const load = () =>
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => {});

  useEffect(() => {
    load();
  }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      const r = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'), description, published: true }),
      });
      const d = await r.json();
      if (r.ok) {
        toast(`Category "${name}" created successfully`, 'success');
        setName('');
        setSlug('');
        setDescription('');
        setMessage('');
        notifyProductsUpdated();
        load();
      } else {
        setMessage(d.error || 'Failed to create category');
        toast(d.error || 'Failed to create category', 'error');
      }
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const remove = async (id, catName) => {
    const ok = await confirm({
      title: 'Delete Category Permanently?',
      message: `Are you sure you want to delete category "${catName}"? Any associated products will be safely moved to the General category so no data is lost.`,
      confirmText: 'Delete Category',
      destructive: true,
    });
    if (!ok) return;

    try {
      const r = await fetch(`/api/categories/${encodeURIComponent(id)}`, { method: 'DELETE' });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Cannot delete category');
      toast(`Category "${catName}" deleted successfully`, 'success');
      setCategories((prev) => prev.filter((c) => c.id !== id && c.slug !== id));
      notifyProductsUpdated();
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
      {/* Create form */}
      <form onSubmit={create} className="rounded-2xl border border-white/[0.08] bg-[#080c16] p-6 space-y-4">
        <h3 className="text-base font-semibold text-white">Create New Category</h3>
        <div>
          <label className="block text-xs text-white/50 mb-1">Category Name</label>
          <input
            required
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-400"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
            }}
          />
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-1">Slug</label>
          <input
            required
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-400 font-mono text-xs"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-1">Description</label>
          <textarea
            rows="3"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-400"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <button className="w-full rounded-xl bg-white px-4 py-3 text-xs font-semibold text-black hover:bg-white/90 transition-colors">
          Add Category
        </button>
        {message && <p className="text-xs text-amber-300 text-center">{message}</p>}
      </form>

      {/* Categories grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {categories.map((c) => (
          <div key={c.id} className="rounded-2xl border border-white/[0.08] bg-[#080c16] p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-white text-base">{c.name}</h4>
                <button onClick={() => remove(c.id, c.name)} className="text-white/30 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] font-mono text-blue-400 mt-1">{c.slug}</p>
              <p className="text-xs text-white/50 mt-2 line-clamp-2">{c.description || 'No description provided.'}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-white/40">
              <span>{c._count?.products || 0} Products</span>
              <span>Active</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
