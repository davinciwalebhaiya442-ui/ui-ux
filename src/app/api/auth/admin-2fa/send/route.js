import { getAdminUser } from '@/lib/auth';
import { generateAndSendAdminOtp } from '@/lib/admin-2fa';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const { user, profile } = await getAdminUser();
    if (!user || profile?.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const res = await generateAndSendAdminOtp(user);
    return Response.json(res);
  } catch (err) {
    console.error('Error sending 2FA OTP:', err);
    return Response.json({ error: 'Failed to dispatch verification code' }, { status: 500 });
  }
}

