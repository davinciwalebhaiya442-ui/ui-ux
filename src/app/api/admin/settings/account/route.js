import { prisma } from '@/lib/prisma';
import { requireAdmin, getAdminUser } from '@/lib/auth';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { user, profile } = await getAdminUser();
    return Response.json({
      admin: {
        id: user.id,
        email: user.email,
        name: profile?.name || 'Administrator',
        role: profile?.role || 'admin',
        createdAt: profile?.createdAt,
      },
    });
  } catch (err) {
    return Response.json({ error: 'Failed to load admin profile' }, { status: 500 });
  }
}

export async function POST(request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { user, profile } = await getAdminUser();
    const body = await request.json();
    const { action, currentPassword, newPassword, newEmail } = body;

    // Verify current password first for authorization
    if (!currentPassword) {
      return Response.json({ error: 'Current password is required to confirm changes' }, { status: 400 });
    }

    const verifyClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { auth: { persistSession: false } }
    );

    const { error: authError } = await verifyClient.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (authError) {
      return Response.json({ error: 'Current password is incorrect. Authorization failed.' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdminClient();

    // 1. Password Update
    if (action === 'update-password') {
      if (!newPassword || newPassword.length < 8) {
        return Response.json({ error: 'New password must be at least 8 characters long' }, { status: 400 });
      }

      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
        password: newPassword,
      });

      if (updateError) {
        return Response.json({ error: updateError.message || 'Failed to update password' }, { status: 400 });
      }

      return Response.json({ success: true, message: 'Admin password updated successfully!' });
    }

    // 2. Email Update
    if (action === 'update-email') {
      const cleanEmail = String(newEmail || '').trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes('@')) {
        return Response.json({ error: 'Please provide a valid email address' }, { status: 400 });
      }

      if (cleanEmail === user.email.toLowerCase()) {
        return Response.json({ error: 'New email is identical to current email' }, { status: 400 });
      }

      // Check for conflict
      const existing = await prisma.profile.findFirst({
        where: { email: cleanEmail, NOT: { userId: user.id } },
      });
      if (existing) {
        return Response.json({ error: 'This email is already in use by another account' }, { status: 400 });
      }

      // Update in Supabase Auth
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
        email: cleanEmail,
        email_confirm: true,
      });

      if (updateError) {
        return Response.json({ error: updateError.message || 'Failed to update email in authentication service' }, { status: 400 });
      }

      // Update in Profile table
      await prisma.profile.update({
        where: { userId: user.id },
        data: { email: cleanEmail },
      });

      return Response.json({
        success: true,
        message: `Admin email successfully updated to ${cleanEmail}!`,
        newEmail: cleanEmail,
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('Admin account update error:', err);
    return Response.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

