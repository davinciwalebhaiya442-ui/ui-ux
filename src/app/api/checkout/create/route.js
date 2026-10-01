import { prisma } from '@/lib/prisma';
import { ensureCustomerProfile } from '@/lib/account';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { getRazorpay } from '@/lib/payments/razorpay';

export async function POST(request) {
  try {
    const authUser = await getAuthenticatedUser().catch(() => null);
    const body = await request.json();
    const { productIds, email, name } = body || {};

    const customerEmail = (email || authUser?.email || '').trim().toLowerCase();
    const customerName = (name || authUser?.user_metadata?.name || authUser?.user_metadata?.full_name || '').trim();

    if (!customerEmail || !customerEmail.includes('@') || !customerEmail.includes('.')) {
      return Response.json(
        { error: 'A valid email address is required to receive your download link and license.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(productIds) || !productIds.length || productIds.length > 20) {
      return Response.json({ error: 'INVALID_PRODUCTS' }, { status: 400 });
    }

    const products = await prisma.product.findMany({
      where: {
        OR: [{ id: { in: productIds } }, { slug: { in: productIds } }],
        published: true,
        type: 'PAID',
      },
    });

    if (products.length !== new Set(productIds).size) {
      return Response.json({ error: 'One or more products are unavailable.' }, { status: 400 });
    }

    const subtotal = products.reduce((sum, product) => sum + product.price, 0);
    const orderNumber = `DWB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    // Ensure customer profile exists (guest or authenticated)
    const profile = await ensureCustomerProfile({
      email: customerEmail,
      name: customerName,
      user: authUser,
    });

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: profile.userId,
        subtotal,
        total: subtotal,
        items: {
          create: products.map((product) => ({
            productId: product.id,
            productName: product.name,
            price: product.price,
          })),
        },
      },
    });

    try {
      const razorpayOrder = await getRazorpay().orders.create({
        amount: subtotal * 100,
        currency: 'INR',
        receipt: orderNumber,
        notes: {
          orderNumber,
          customerEmail,
          customerName: customerName || 'Valued Customer',
          productCount: products.length.toString(),
        },
      });

      const updated = await prisma.order.update({
        where: { id: order.id },
        data: { razorpayOrderId: razorpayOrder.id },
      });

      return Response.json({
        order: {
          id: updated.id,
          orderNumber,
          amount: subtotal * 100,
          currency: 'INR',
          razorpayOrderId: razorpayOrder.id,
        },
        keyId: process.env.RAZORPAY_KEY_ID,
        customerEmail,
      });
    } catch (error) {
      console.error('Razorpay order creation error:', error);
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'FAILED', paymentStatus: 'FAILED' },
      });
      return Response.json({ error: 'Payment gateway is currently unavailable. Please try again.' }, { status: 503 });
    }
  } catch (error) {
    console.error('Checkout error:', error);
    return Response.json({ error: 'Unable to initiate checkout.' }, { status: 500 });
  }
}

