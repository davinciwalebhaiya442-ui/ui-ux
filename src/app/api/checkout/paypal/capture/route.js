import { prisma } from '@/lib/prisma';
import { capturePayPalOrder } from '@/lib/payments/paypal';
import { fulfillOrder } from '@/lib/orders';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { paypalOrderId, orderNumber } = body || {};

    if (!paypalOrderId) {
      return Response.json({ error: 'Missing PayPal Order ID' }, { status: 400 });
    }

    // Capture the authorized funds from PayPal
    const captureData = await capturePayPalOrder(paypalOrderId);

    if (captureData.status !== 'COMPLETED') {
      console.warn('PayPal capture status not completed:', captureData.status);
      return Response.json(
        { error: `Payment not completed. Status: ${captureData.status}` },
        { status: 400 }
      );
    }

    // Extract capture ID
    const captureUnit = captureData.purchase_units?.[0]?.payments?.captures?.[0];
    const paypalCaptureId = captureUnit?.id || paypalOrderId;

    // Fulfill the order (mark as PAID, grant access, send delivery email)
    const fulfillment = await fulfillOrder({
      orderNumber,
      paypalOrderId,
      paypalCaptureId,
      paymentGateway: 'PAYPAL',
    });

    if (!fulfillment.success && !fulfillment.alreadyPaid) {
      console.error('PayPal fulfillment error:', fulfillment.error);
      return Response.json({ error: 'Order fulfillment encountered an issue.' }, { status: 500 });
    }

    return Response.json({
      success: true,
      orderNumber: fulfillment.order?.orderNumber || orderNumber,
      paypalCaptureId,
    });
  } catch (error) {
    console.error('PayPal capture error:', error);
    return Response.json(
      { error: error.message || 'Unable to capture PayPal payment.' },
      { status: 500 }
    );
  }
}

