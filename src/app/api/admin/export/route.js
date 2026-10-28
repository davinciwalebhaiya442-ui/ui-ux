import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function escapeCsvField(field) {
  if (field === null || field === undefined) return '""';
  const str = String(field);
  // Replace quotes with double quotes and wrap in quotes
  return `"${str.replace(/"/g, '""')}"`;
}

export async function GET(request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'orders'; // 'orders' | 'customers' | 'products'

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

    if (type === 'customers') {
      // 1. Fetch profiles and aggregated order data
      const profiles = await prisma.profile.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          orders: {
            where: { status: 'PAID' },
            select: { total: true, createdAt: true },
          },
          _count: {
            select: {
              downloads: true,
              access: true,
            },
          },
        },
      });

      // 2. Also find any unique customer emails from Orders that might not have a full profile
      const rawOrders = await prisma.order.findMany({
        where: { status: 'PAID' },
        select: {
          userId: true,
          total: true,
          createdAt: true,
          user: { select: { email: true, name: true } },
        },
      });

      const customerMap = new Map();

      // Process profiles
      for (const p of profiles) {
        const email = p.email || p.userId || 'unknown';
        const totalSpent = p.orders.reduce((sum, o) => sum + (o.total || 0), 0);
        const paidOrdersCount = p.orders.length;
        const lastOrderDate = p.orders.length
          ? new Date(Math.max(...p.orders.map((o) => new Date(o.createdAt).getTime()))).toISOString()
          : '';

        customerMap.set(email.toLowerCase(), {
          name: p.name || 'Customer',
          email,
          role: p.role,
          totalSpent,
          paidOrdersCount,
          totalDownloads: p._count.downloads || 0,
          joinedAt: p.createdAt.toISOString(),
          lastOrderDate,
        });
      }

      // Add any missing order users
      for (const o of rawOrders) {
        const email = o.user?.email || o.userId;
        if (!email) continue;
        const key = email.toLowerCase();
        if (!customerMap.has(key)) {
          customerMap.set(key, {
            name: o.user?.name || 'Customer',
            email,
            role: 'customer',
            totalSpent: o.total || 0,
            paidOrdersCount: 1,
            totalDownloads: 0,
            joinedAt: o.createdAt.toISOString(),
            lastOrderDate: o.createdAt.toISOString(),
          });
        }
      }

      const rows = [
        [
          'Name',
          'Email Address',
          'Customer Role',
          'Paid Orders Count',
          'Total Spent (INR)',
          'Total Downloads',
          'Date Joined',
          'Last Order Date',
        ],
      ];

      for (const c of customerMap.values()) {
        rows.push([
          c.name,
          c.email,
          c.role,
          c.paidOrdersCount,
          c.totalSpent,
          c.totalDownloads,
          c.joinedAt ? new Date(c.joinedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : '',
          c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'Never',
        ]);
      }

      const csvContent = rows.map((r) => r.map(escapeCsvField).join(',')).join('\r\n');

      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="davinciwalebhaiya-customers-${timestamp}.csv"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    if (type === 'products') {
      const products = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          _count: {
            select: {
              access: true,
              downloads: true,
            },
          },
        },
      });

      const rows = [
        [
          'Product ID',
          'Product Name',
          'Slug',
          'Category',
          'Type',
          'Price (INR)',
          'Published',
          'Featured',
          'Featured Slot',
          'Paid Sales Count',
          'Total Downloads',
          'Gross Revenue (INR)',
          'Created At',
        ],
      ];

      for (const p of products) {
        const salesCount = p._count?.access || 0;
        const downloadsCount = p._count?.downloads || 0;
        const estRevenue = p.type === 'PAID' ? salesCount * (p.price || 0) : 0;

        rows.push([
          p.id,
          p.name,
          p.slug,
          p.category?.name || 'Uncategorized',
          p.type,
          p.price || 0,
          p.published ? 'Yes' : 'No',
          p.featured ? 'Yes' : 'No',
          p.featuredOrder || 'None',
          salesCount,
          downloadsCount,
          estRevenue,
          new Date(p.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        ]);
      }

      const csvContent = rows.map((r) => r.map(escapeCsvField).join(',')).join('\r\n');

      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="davinciwalebhaiya-products-${timestamp}.csv"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    // Default: Orders export
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        items: true,
      },
    });

    const rows = [
      [
        'Order Number',
        'Date (IST)',
        'Customer Name',
        'Customer Email',
        'Order Status',
        'Payment Status',
        'Currency',
        'Total Amount (INR)',
        'Subtotal',
        'Discount',
        'Item Count',
        'Purchased Products',
        'Razorpay Order ID',
        'Razorpay Payment ID',
      ],
    ];

    for (const o of orders) {
      const productNames = (o.items || []).map((i) => i.productName).join(' | ');
      rows.push([
        o.orderNumber,
        new Date(o.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        o.user?.name || 'Customer',
        o.user?.email || o.userId,
        o.status,
        o.paymentStatus,
        o.currency,
        o.total,
        o.subtotal,
        o.discount,
        o.items?.length || 0,
        productNames || 'N/A',
        o.razorpayOrderId || '',
        o.razorpayPaymentId || '',
      ]);
    }

    const csvContent = rows.map((r) => r.map(escapeCsvField).join(',')).join('\r\n');

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="davinciwalebhaiya-orders-${timestamp}.csv"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Export API error:', error);
    return Response.json({ error: 'Failed to generate export file' }, { status: 500 });
  }
}

