import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { slots } = await request.json(); // e.g. { 1: "productId1", 2: "productId2", ... }

    // 1. Reset existing slots 1..10 to 0
    await prisma.product.updateMany({
      where: { featuredOrder: { in: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } },
      data: { featuredOrder: 0 },
    });

    // 2. Set newly chosen slots
    if (slots && typeof slots === 'object') {
      for (const [slotStr, productId] of Object.entries(slots)) {
        const slotNum = Number(slotStr);
        if (slotNum >= 1 && slotNum <= 10 && productId) {
          await prisma.product.update({
            where: { id: String(productId) },
            data: {
              featured: true,
              featuredOrder: slotNum,
            },
          }).catch((err) => {
            console.error(`Failed to assign slot ${slotNum} to product ${productId}:`, err);
          });
        }
      }
    }

    try {
      revalidatePath('/');
      revalidatePath('/api/products');
    } catch {}

    return Response.json({ success: true });
  } catch (err) {
    console.error('Featured order save error:', err);
    return Response.json({ error: 'Failed to update featured order' }, { status: 500 });
  }
}

