import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const [recentStudio, recentOrders, newUsers] = await Promise.all([
      prisma.studioRequest.findMany({
        where: { status: 'NEW' },
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: true },
      }),
      prisma.profile.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const notifications = [
      ...recentStudio.map((s) => ({
        id: `studio-${s.id}`,
        type: 'studio',
        title: 'New Studio Request',
        description: `${s.name} requested: ${s.requestType}`,
        href: '/admin/studio',
        time: s.createdAt,
        unread: true,
      })),
      ...recentOrders.map((o) => ({
        id: `order-${o.id}`,
        type: 'order',
        title: o.status === 'PAID' ? 'Order Completed' : 'New Order Created',
        description: `${o.orderNumber} · ${o.currency} ${o.total.toLocaleString()}`,
        href: '/admin/orders',
        time: o.createdAt,
        unread: o.status === 'PAID',
      })),
      ...newUsers.map((u) => ({
        id: `user-${u.id}`,
        type: 'user',
        title: 'New User Registered',
        description: u.email || 'Anonymous creator',
        href: '/admin/users',
        time: u.createdAt,
        unread: false,
      })),
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10);

    const unreadCount = notifications.filter((n) => n.unread).length;

    return Response.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Notifications fetch error:', error);
    return Response.json({ error: 'Unable to load notifications' }, { status: 500 });
  }
}
