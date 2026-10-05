import { prisma } from '@/lib/prisma';
import { ensureCustomerProfile } from '@/lib/account';
import { getRazorpay } from '@/lib/payments/razorpay';

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

    // Run product lookup & customer profile creation concurrently for sub-500ms speed
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

    const subtotal = products.reduce((sum, product) => sum + product.price, 0);
    const orderNumber = `DWB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    // Create Razorpay order first
    let razorpayOrder;
    try {
      razorpayOrder = await getRazorpay().orders.create({
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
    } catch (rzpErr) {
      console.error('Razorpay order creation error:', rzpErr);
      return Response.json({ error: 'Payment gateway is currently unavailable. Please try again.' }, { status: 503 });
    }

    // Create database order in 1 single fast query with razorpayOrderId already attached
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: profile.userId,
        subtotal,
        total: subtotal,
        currency: 'INR',
        status: 'PENDING',
        paymentStatus: 'PENDING',
        razorpayOrderId: razorpayOrder.id,
        items: {
          create: products.map((product) => ({
            productId: product.id,
            productName: product.name,
            price: product.price,
          })),
        },
      },
    });

    return Response.json({
      order: {
        id: order.id,
        orderNumber,
        amount: subtotal * 100,
        currency: 'INR',
        razorpayOrderId: razorpayOrder.id,
      },
      keyId: process.env.RAZORPAY_KEY_ID,
      customerEmail,
    });
  } catch (error) {
    console.error('Checkout create error:', error);
    return Response.json({ error: 'Unable to initiate checkout.' }, { status: 500 });
  }
}
