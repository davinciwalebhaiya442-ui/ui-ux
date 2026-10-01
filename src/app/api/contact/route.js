import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, category, subject, orderNumber, message } = body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return Response.json(
        { error: 'Please provide your name, email address, and a message.' },
        { status: 400 }
      );
    }

    const user = await getAuthenticatedUser().catch(() => null);

    // Save inquiry to database using StudioRequest model for admin oversight
    try {
      await prisma.studioRequest.create({
        data: {
          userId: user?.id,
          name: name.trim(),
          email: email.trim(),
          requestType: 'Other',
          projectDetails: `[Category: ${category || 'General'}] [Subject: ${subject || 'Support'}] [Order: ${orderNumber || 'N/A'}]\n\n${message.trim()}`,
        },
      });
    } catch (dbErr) {
      console.warn('Could not persist contact inquiry to DB, continuing:', dbErr);
    }

    // Attempt to notify user or admin via email if configured
    try {
      await sendEmail({
        to: email.trim(),
        subject: `[DavinciWaleBhaiya Support] We received your message: ${subject || 'Inquiry'}`,
        html: `
          <div style="font-family: sans-serif; background-color: #030712; color: #f1f5f9; padding: 24px; border-radius: 8px;">
            <h2 style="color: #ffffff; margin-top: 0;">Inquiry Received</h2>
            <p>Hi ${name.trim()},</p>
            <p>Thank you for reaching out to DavinciWaleBhaiya. We have received your message regarding <strong>${category || 'General Support'}</strong>.</p>
            <p>Our team reviews all inquiries promptly and will get back to you within 24 hours.</p>
            <div style="background-color: #0b1120; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 12px; margin: 16px 0; font-size: 13px; color: #cbd5e1;">
              <strong>Your message:</strong><br />
              ${message.trim().replace(/\n/g, '<br />')}
            </div>
            <p style="color: #94a3b8; font-size: 12px;">DavinciWaleBhaiya Support Desk &bull; support@davinciwalebhaiya.com</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.warn('Notification email sending failed:', emailErr);
    }

    return Response.json(
      { success: true, message: 'Message successfully sent. We will respond within 24 hours.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact API error:', error);
    return Response.json(
      { error: 'Failed to process inquiry. Please email support@davinciwalebhaiya.com directly.' },
      { status: 500 }
    );
  }
}
