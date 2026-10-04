import crypto from 'node:crypto';
import Razorpay from 'razorpay';

export function getRazorpay() {
  const key_id = process.env.RAZORPAY_KEY_ID?.trim();
  const key_secret = process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!key_id || !key_secret) throw new Error('Razorpay is not configured');
  return new Razorpay({ key_id, key_secret });
}

export function verifyPaymentSignature(orderId, paymentId, signature) {
  if (!orderId || !paymentId || !signature || !process.env.RAZORPAY_KEY_SECRET) return false;
  const cleanSecret = String(process.env.RAZORPAY_KEY_SECRET).trim();
  const cleanOrderId = String(orderId).trim();
  const cleanPaymentId = String(paymentId).trim();
  const cleanSignature = String(signature).trim();

  try {
    const digest = crypto
      .createHmac('sha256', cleanSecret)
      .update(`${cleanOrderId}|${cleanPaymentId}`)
      .digest('hex');

    if (digest.toLowerCase() === cleanSignature.toLowerCase()) {
      return true;
    }

    const digestBuf = Buffer.from(digest);
    const sigBuf = Buffer.from(cleanSignature);
    if (digestBuf.length === sigBuf.length && crypto.timingSafeEqual(digestBuf, sigBuf)) {
      return true;
    }
  } catch (err) {
    console.error('Signature verification error:', err);
  }

  return false;
}

export function verifyWebhookSignature(payload, signature) {
  if (!payload || !signature || !process.env.RAZORPAY_WEBHOOK_SECRET) return false;
  const cleanSecret = String(process.env.RAZORPAY_WEBHOOK_SECRET).trim();
  const cleanSignature = String(signature).trim();

  try {
    const digest = crypto
      .createHmac('sha256', cleanSecret)
      .update(payload)
      .digest('hex');

    if (digest.toLowerCase() === cleanSignature.toLowerCase()) {
      return true;
    }

    const digestBuf = Buffer.from(digest);
    const sigBuf = Buffer.from(cleanSignature);
    if (digestBuf.length === sigBuf.length && crypto.timingSafeEqual(digestBuf, sigBuf)) {
      return true;
    }
  } catch (err) {
    console.error('Webhook signature verification error:', err);
  }

  return false;
}
