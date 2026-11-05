import { prisma } from '@/lib/prisma';
import { ensureCustomerProfile } from '@/lib/account';
import { createPayPalOrder } from '@/lib/payments/paypal';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { productIds, email, name } = body || {};

    const customerEmail = (email || '').trim().toLowerCase();
    const customerName = (name || '').trim();

    if (!customerEmail || !customerEmail.includes('@') || !customerEmail.includes('.')) {
      return Response.json(
        { error: 'A valid email address is required to receive your download link and license.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(productIds) || !productIds.length || productIds.length > 20) {
      return Response.json({ error: 'INVALID_PRODUCTS' }, { status: 400 });
    }

    // Run product lookup & customer profile creation concurrently
    const [products, profile] = await Promise.all([
      prisma.product.findMany({
        where: {
          OR: [{ id: { in: productIds } }, { slug: { in: productIds } }],
          published: true,
          type: 'PAID',
        },
      }),
      ensureCustomerProfile({
        email: customerEmail,
        name: customerName,
      }),
    ]);

    if (products.length !== new Set(productIds).size) {
      return Response.json({ error: 'One or more products are unavailable.' }, { status: 400 });
    }

    // 1. Calculate base INR total for the system/order database
    const subtotalINR = products.reduce((sum, p) => sum + Number(p.price || 0), 0);

    // 2. Calculate equivalent USD amount for PayPal API processing
    // NOTE: PayPal REST API does NOT support INR (returns CURRENCY_NOT_SUPPORTED 422 error),
    // so international charges via PayPal must be processed in USD.
    const paypalUSD = products.reduce((sum, p) => {
      const explicitUSD = Number(p.priceUSD || 0);
      if (explicitUSD > 0) return sum + explicitUSD;
      const inr = Number(p.price || 0);
      return sum + Math.max(1, Math.round((inr / 83) * 100) / 100);
    }, 0);

    const orderNumber = `DWB-PP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const description = products.map((p) => p.name).join(', ').slice(0, 120);

    // 3. Create PayPal Order directly via official PayPal API in USD
    const paypalOrder = await createPayPalOrder({
      orderNumber,
      amount: paypalUSD,
      currency: 'USD',
      description: `${description} (₹${subtotalINR} INR)`,
      customerEmail,
    });

    // 4. Save database order with total in INR
    await prisma.order.create({
      data: {
        orderNumber,
        userId: profile.userId,
        subtotal: subtotalINR,
        total: subtotalINR,
        currency: 'INR',
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentGateway: 'PAYPAL',
        paypalOrderId: paypalOrder.id,
        items: {
          create: products.map((product) => ({
            productId: product.id,
            productName: product.name,
            price: Number(product.price || 0),
          })),
        },
      },
    });

    return Response.json({
      paypalOrderId: paypalOrder.id,
      orderNumber,
      totalINR: subtotalINR,
      amountUSD: paypalUSD,
      currency: 'INR',
    });
  } catch (error) {
    console.error('PayPal checkout create error:', error);
    return Response.json(
      { error: error.message || 'Unable to initiate PayPal checkout. Please try again.' },
      { status: 500 }
    );
  }
}

