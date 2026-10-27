import { getAdminUser } from '@/lib/auth';
import { verifyAdminOtp } from '@/lib/admin-2fa';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { user, profile } = await getAdminUser();
    if (!user || profile?.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code } = await request.json().catch(() => ({}));
    const result = await verifyAdminOtp(user.id, code);

    if (!result.success) {
      return Response.json({ error: result.error || 'Invalid code' }, { status: 400 });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error('Error verifying 2FA OTP:', err);
    return Response.json({ error: 'Verification failed' }, { status: 500 });
  }
}
