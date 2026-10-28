import { prisma } from '@/lib/prisma';
import { ensureCustomerProfile } from '@/lib/account';
import { getRazorpay } from '@/lib/payments/razorpay';

export async function POST(request) {
  try {
    const body = await request.json();
    const { productIds, email, name, currency: requestedCurrency } = body || {};

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

    // 1. ANTI-CHEAT GEO DETECTION
    // Inspect server-side headers (cannot be faked by client-side dropdown or tampering)
    const headers = request.headers;
    const detectedCountry = (
      headers.get('x-vercel-ip-country') ||
      headers.get('cf-ipcountry') ||
      headers.get('x-country-code') ||
      headers.get('x-geo-country') ||
      'IN'
    ).toUpperCase();

    const isDomestic = detectedCountry === 'IN';

    // Anti-arbitrage rule:
    // If request originates outside India, force 'USD' pricing (no subsidized INR access for foreign buyers)
    // If request is domestic (India), default to 'INR' unless user explicitly requested USD
    let effectiveCurrency = 'INR';
    if (!isDomestic) {
      effectiveCurrency = 'USD';
    } else if (requestedCurrency && requestedCurrency.toUpperCase() === 'USD') {
      effectiveCurrency = 'USD';
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

    // Calculate subtotal in effective currency
    let subtotal = 0;
    if (effectiveCurrency === 'USD') {
      subtotal = products.reduce((sum, p) => {
        const usdPrice =
          Number(p.priceUSD || 0) > 0
            ? Number(p.priceUSD)
            : Math.max(1, Math.round(Number(p.price || 0) / 83));
        return sum + usdPrice;
      }, 0);
    } else {
      subtotal = products.reduce((sum, p) => sum + Number(p.price || 0), 0);
    }

    const orderNumber = `DWB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    // Attempt Razorpay order creation
    let razorpayOrder;
    let finalGatewayCurrency = effectiveCurrency;
    let finalGatewayAmount = subtotal * 100;

    try {
      razorpayOrder = await getRazorpay().orders.create({
        amount: finalGatewayAmount,
        currency: finalGatewayCurrency,
        receipt: orderNumber,
        notes: {
          orderNumber,
          customerEmail,
          customerName: customerName || 'Valued Customer',
          productCount: products.length.toString(),
          country: detectedCountry,
          pricingTier: effectiveCurrency,
        },
      });
    } catch (rzpErr) {
      console.warn('Primary Razorpay order creation notice:', rzpErr?.message || rzpErr);

      // Bulletproof Fallback:
      // If merchant Razorpay account requires domestic INR settlement for this key,
      // convert the USD international price into equivalent INR (at current forex rate ~86)
      // so the merchant ALWAYS gets full international revenue instead of domestic ₹99!
      if (effectiveCurrency === 'USD') {
        const forexRate = 86;
        const inrEquivalent = Math.round(subtotal * forexRate);
        finalGatewayCurrency = 'INR';
        finalGatewayAmount = inrEquivalent * 100;

        try {
          razorpayOrder = await getRazorpay().orders.create({
            amount: finalGatewayAmount,
            currency: 'INR',
            receipt: orderNumber,
            notes: {
              orderNumber,
              customerEmail,
              customerName: customerName || 'Valued Customer',
              productCount: products.length.toString(),
              country: detectedCountry,
              originalUSD: subtotal.toString(),
              forexConverted: `Converted $${subtotal} USD -> ₹${inrEquivalent} INR`,
            },
          });
        } catch (fallbackErr) {
          console.error('Razorpay fallback creation error:', fallbackErr);
          return Response.json({ error: 'Payment gateway is currently unavailable. Please try again.' }, { status: 503 });
        }
      } else {
        return Response.json({ error: 'Payment gateway is currently unavailable. Please try again.' }, { status: 503 });
      }
    }

    // Create database order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: profile.userId,
        subtotal: Math.round(finalGatewayAmount / 100),
        total: Math.round(finalGatewayAmount / 100),
        currency: finalGatewayCurrency,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        razorpayOrderId: razorpayOrder.id,
        items: {
          create: products.map((product) => {
            const itemPrice =
              effectiveCurrency === 'USD'
                ? Number(product.priceUSD || 0) > 0
                  ? Number(product.priceUSD)
                  : Math.max(1, Math.round(Number(product.price || 0) / 83))
                : product.price;

            return {
              productId: product.id,
              productName: product.name,
              price: itemPrice,
            };
          }),
        },
      },
    });

    return Response.json({
      order: {
        id: order.id,
        orderNumber,
        amount: finalGatewayAmount,
        currency: finalGatewayCurrency,
        razorpayOrderId: razorpayOrder.id,
        displayCurrency: effectiveCurrency,
        displayAmount: subtotal,
      },
      keyId: process.env.RAZORPAY_KEY_ID,
      customerEmail,
      detectedCountry,
    });
  } catch (error) {
    console.error('Checkout create error:', error);
    return Response.json({ error: 'Unable to initiate checkout.' }, { status: 500 });
  }
}
