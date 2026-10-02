import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim();
    const projectDetails = String(body.projectDetails || body.details || '').trim();
    const requestType = String(body.requestType || 'Client Project').trim();
    const budget = String(body.budget || '').trim();
    const portfolioUrl = String(body.portfolioUrl || body.portfolio || '').trim();

    if (!name || !email || !projectDetails) {
      return Response.json({ error: 'Please provide your name, email, and project details.' }, { status: 400 });
    }

    const user = await getAuthenticatedUser().catch(() => null);

    const item = await prisma.studioRequest.create({
      data: {
        userId: user?.id || null,
        name,
        email,
        requestType,
        budget: budget || null,
        projectDetails,
        portfolioUrl: portfolioUrl || null,
        status: 'NEW',
      },
    });

    // Send confirmation email to client
    try {
      await sendEmail({
        to: item.email,
        subject: 'Davinci Wale Bhaiya — We received your Studio project brief',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #000; color: #fff; border-radius: 12px;">
            <h2 style="color: #60a5fa; margin-top: 0;">Project Inquiry Received</h2>
            <p>Hi ${item.name},</p>
            <p>Thank you for reaching out to DaVinci Wale Bhaiya Studio. We have received your brief for <strong>${item.requestType}</strong>.</p>
            <div style="background: #111; padding: 16px; border-radius: 8px; border: 1px solid #333; margin: 16px 0;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #aaa;"><strong>Scope:</strong> ${item.requestType}</p>
              ${item.budget ? `<p style="margin: 0 0 8px 0; font-size: 13px; color: #aaa;"><strong>Budget:</strong> ${item.budget}</p>` : ''}
              <p style="margin: 0; font-size: 13px; color: #aaa;"><strong>Details:</strong> ${item.projectDetails}</p>
            </div>
            <p>Our lead colorist will review your brief and follow up with you directly within 24 hours.</p>
            <p style="color: #888; font-size: 12px; margin-top: 24px;">— DaVinci Wale Bhaiya Studio Lab</p>
          </div>
        `,
      });
    } catch (e) {
      console.warn('Failed to send confirmation email to client:', e);
    }

    return Response.json({ success: true, request: { id: item.id, status: item.status } }, { status: 201 });
  } catch (error) {
    console.error('Error creating studio request:', error);
    return Response.json({ error: 'Failed to submit studio request. Please try again.' }, { status: 500 });
  }
}
