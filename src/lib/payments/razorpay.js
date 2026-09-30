import crypto from 'node:crypto';
import Razorpay from 'razorpay';

export function getRazorpay() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) throw new Error('Razorpay is not configured');
  return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
}

export function verifyPaymentSignature(orderId, paymentId, signature) {
  const digest = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${orderId}|${paymentId}`).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature || ''));
}

export function verifyWebhookSignature(payload, signature) {
  const digest = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || '').update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature || ''));
}
