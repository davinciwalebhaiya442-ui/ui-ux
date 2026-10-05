import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { createSignedDownloadUrl } from '@/lib/storage/r2';

export async function GET(request, { params }) {
  try {
    const { orderNumber } = params || {};
    if (!orderNumber) {
      return Response.json({ error: 'ORDER_NOT_FOUND' }, { status: 404 });
    }

    let order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: true,
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    if (!order) {
      return Response.json({ error: 'ORDER_NOT_FOUND' }, { status: 404 });
    }

    // If order is not paid, require authenticated owner
    if (order.status !== 'PAID') {
      const authUser = await getAuthenticatedUser().catch(() => null);
      if (!authUser || authUser.id !== order.userId) {
        return Response.json({ error: 'UNAUTHORIZED' }, { status: 401 });
      }
    }

    // Attach product download URLs if available
    const productIds = order.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const itemsWithDownloads = await Promise.all(
      order.items.map(async (item) => {
        const prod = products.find((p) => p.id === item.productId);
        let downloadUrl = null;

        if (prod?.downloadFileKey) {
          try {
            downloadUrl = await createSignedDownloadUrl(
              prod.downloadFileKey,
              3600, // 1 hour for immediate web page download
              prod.downloadFileName || `${prod.slug || 'product'}.zip`
            );
          } catch (e) {
            console.error('Failed to create signed URL for order item:', e);
          }
        }

        return {
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          price: item.price,
          downloadUrl,
          downloadFileName: prod?.downloadFileName || `${prod?.slug || 'package'}.zip`,
          fileSize: prod?.fileSize || null,
        };
      })
    );

    return Response.json({
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        total: order.total,
        currency: order.currency,
        createdAt: order.createdAt,
        customerEmail: order.user?.email || null,
        customerName: order.user?.name || null,
        items: itemsWithDownloads,
      },
    });
  } catch (error) {
    console.error('Failed to fetch order:', error);
    return Response.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
