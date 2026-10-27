import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

const COOKIE_NAME = 'dwb_admin_2fa';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getSecret() {
  return (
    process.env.RAZORPAY_KEY_SECRET ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'fallback-internal-secret-davinci-2fa'
  );
}

export function sign2FAToken(userId) {
  const issuedAt = Date.now();
  const data = `${userId}:${issuedAt}`;
  const sig = crypto.createHmac('sha256', getSecret()).update(data).digest('hex');
  return `${data}:${sig}`;
}

export function verify2FAToken(userId, token) {
  if (!userId || !token) return false;
  const parts = String(token).split(':');
  if (parts.length !== 3) return false;
  const [tokenUserId, issuedAtStr, sig] = parts;
  if (tokenUserId !== userId) return false;

  const issuedAt = Number(issuedAtStr);
  if (isNaN(issuedAt)) return false;

  // Max age: 7 days
  if (Date.now() - issuedAt > COOKIE_MAX_AGE * 1000) return false;

  const data = `${tokenUserId}:${issuedAtStr}`;
  const expectedSig = crypto.createHmac('sha256', getSecret()).update(data).digest('hex');

  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return false;
  }

  return true;
}

export async function verifyAdmin2FACookie(userId) {
  try {
    const cookieStore = cookies();
    const cookie = cookieStore.get(COOKIE_NAME);
    if (!cookie?.value) return false;
    return verify2FAToken(userId, cookie.value);
  } catch {
    return false;
  }
}

export async function setAdmin2FACookie(userId) {
  const token = sign2FAToken(userId);
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });
  return token;
}

export async function clearAdmin2FACookie() {
  try {
    const cookieStore = cookies();
    cookieStore.delete(COOKIE_NAME);
  } catch {}
}

export function renderAdmin2FAEmail({ code, email }) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; background-color: #080c16; border: 1px solid rgba(255,255,255,0.12); border-radius: 20px; overflow: hidden; color: #ffffff;">
      <div style="background: linear-gradient(180deg, #0e172a 0%, #080c16 100%); padding: 32px 24px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.08);">
        <p style="font-size: 11px; font-family: monospace; letter-spacing: 0.24em; text-transform: uppercase; color: #60a5fa; margin: 0 0 8px 0;">ADMIN TWO-FACTOR AUTH</p>
        <h1 style="font-size: 22px; font-weight: 700; margin: 0; color: #ffffff;">Login Verification Code</h1>
      </div>
      <div style="padding: 32px 24px; text-align: center;">
        <p style="font-size: 14px; color: rgba(255,255,255,0.7); margin: 0 0 24px 0; line-height: 1.6;">
          An administrator sign-in was requested for <strong style="color: #ffffff;">${email}</strong>. Use the 6-digit verification code below to complete login:
        </p>
        <div style="background: rgba(59,130,246,0.12); border: 1px solid rgba(59,130,246,0.35); border-radius: 14px; padding: 20px 24px; margin: 0 auto 24px auto; display: inline-block;">
          <span style="font-family: monospace; font-size: 34px; font-weight: 800; letter-spacing: 0.35em; color: #93c5fd; padding-left: 0.35em;">${code}</span>
        </div>
        <p style="font-size: 12px; color: rgba(255,255,255,0.5); margin: 0 0 16px 0;">
          This code will expire in <strong>10 minutes</strong> and can only be used once.
        </p>
        <p style="font-size: 11px; color: rgba(255,255,255,0.35); margin: 0; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px;">
          If you did not attempt to log in, please secure your account immediately.
        </p>
      </div>
    </div>
  `;
}

export async function generateAndSendAdminOtp(user) {
  const email = user.email;
  const userId = user.id;

  // 1. Check rate-limit: Do not send more than 1 email every 45 seconds
  const recent = await prisma.adminOtp.findFirst({
    where: {
      userId,
      createdAt: { gt: new Date(Date.now() - 45 * 1000) },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (recent) {
    return {
      success: true,
      rateLimited: true,
      message: 'A code was recently sent. Please check your inbox or wait a moment.',
    };
  }

  // 2. Generate random 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // 3. Invalidate previous OTPs for this user
  await prisma.adminOtp.deleteMany({
    where: { userId },
  }).catch(() => {});

  // 4. Save to database
  await prisma.adminOtp.create({
    data: {
      userId,
      email,
      code,
      expiresAt,
    },
  });

  // 5. Send via Resend
  const html = renderAdmin2FAEmail({ code, email });
  await sendEmail({
    to: email,
    subject: `Your Admin Verification Code: ${code}`,
    html,
  });

  return { success: true };
}

export async function verifyAdminOtp(userId, code) {
  const cleanCode = String(code || '').trim();
  if (!cleanCode || cleanCode.length !== 6) {
    return { success: false, error: 'Please enter a valid 6-digit code' };
  }

  const record = await prisma.adminOtp.findFirst({
    where: {
      userId,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!record) {
    return { success: false, error: 'Verification code has expired. Please request a new one.' };
  }

  if (record.attempts >= 5) {
    await prisma.adminOtp.delete({ where: { id: record.id } }).catch(() => {});
    return { success: false, error: 'Too many failed attempts. Please request a new code.' };
  }

  if (record.code !== cleanCode) {
    await prisma.adminOtp.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    }).catch(() => {});
    return { success: false, error: 'Incorrect verification code. Please try again.' };
  }

  // Success: Delete used OTP
  await prisma.adminOtp.delete({ where: { id: record.id } }).catch(() => {});

  // Issue verified session cookie
  await setAdmin2FACookie(userId);

  return { success: true };
}
