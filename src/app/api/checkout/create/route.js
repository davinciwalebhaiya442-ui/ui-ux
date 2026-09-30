import { prisma } from '@/lib/prisma';
import { requireUser, ensureProfile } from '@/lib/account';
import { getRazorpay } from '@/lib/payments/razorpay';

export async function POST(request) {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  try {
    const { productIds } = await request.json();
    if (!Array.isArray(productIds) || !productIds.length || productIds.length > 20) return Response.json({ error: 'INVALID_PRODUCTS' }, { status: 400 });
    const products = await prisma.product.findMany({ where: { OR: [{ id: { in: productIds } }, { slug: { in: productIds } }], published: true, type: 'PAID' } });
    if (products.length !== new Set(productIds).size) return Response.json({ error: 'PRODUCT_UNAVAILABLE' }, { status: 400 });
    const subtotal = products.reduce((sum, product) => sum + product.price, 0);
    const orderNumber = `DWB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const order = await prisma.order.create({ data: { orderNumber, userId: auth.user.id, subtotal, total: subtotal, items: { create: products.map((product) => ({ productId: product.id, productName: product.name, price: product.price })) } } });
    try {
      const razorpayOrder = await getRazorpay().orders.create({ amount: subtotal * 100, currency: 'INR', receipt: orderNumber });
      const updated = await prisma.order.update({ where: { id: order.id }, data: { razorpayOrderId: razorpayOrder.id } });
      await ensureProfile(auth.user);
      return Response.json({ order: { id: updated.id, orderNumber, amount: subtotal * 100, currency: 'INR', razorpayOrderId: razorpayOrder.id }, keyId: process.env.RAZORPAY_KEY_ID });
    } catch (error) {
      await prisma.order.update({ where: { id: order.id }, data: { status: 'FAILED', paymentStatus: 'FAILED' } });
      return Response.json({ error: 'PAYMENT_UNAVAILABLE' }, { status: 503 });
    }
  } catch (error) { console.error(error); return Response.json({ error: 'Unable to create checkout' }, { status: 500 }); }
}
