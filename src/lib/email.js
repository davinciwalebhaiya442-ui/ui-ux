import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';
import { createSignedDownloadUrl } from '@/lib/storage/r2';

export async function sendEmail({ to, subject, html }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('sendEmail skipped: RESEND_API_KEY is not configured');
    return null;
  }
  const from = process.env.RESEND_FROM_EMAIL?.trim() || 'Davinci Wale Bhaiya <onboarding@resend.dev>';
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const result = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });
    return result;
  } catch (error) {
    console.error('Failed to send email via Resend:', error);
    return null;
  }
}

export function renderOrderDownloadEmail({ orderNumber, itemsWithDownloads, siteUrl }) {
  const downloadItemsHtml = itemsWithDownloads.map((item) => `
    <div style="background-color: #0b1120; border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; padding: 20px; margin-bottom: 16px;">
      <h3 style="margin: 0 0 6px 0; color: #ffffff; font-size: 16px; font-weight: 600;">${item.name}</h3>
      <p style="margin: 0 0 16px 0; color: #94a3b8; font-size: 13px;">
        File Archive: <strong style="color: #cbd5e1;">${item.fileName || 'Archive.zip'}</strong> ${item.fileSize ? `&bull; ${item.fileSize}` : ''}
      </p>
      ${item.downloadUrl ? `
        <a href="${item.downloadUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-weight: 600; font-size: 13px; text-decoration: none; padding: 12px 24px; border-radius: 8px; box-shadow: 0 4px 14px rgba(37,99,235,0.4);">
          Download Zip Package &rarr;
        </a>
      ` : `
        <p style="color: #f59e0b; font-size: 12px; margin: 0;">Digital package will be available in your library shortly.</p>
      `}
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Your Download is Ready</title></head>
    <body style="background-color: #030712; color: #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 30px 15px; margin: 0;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #080d1a; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
        
        <div style="border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 20px; margin-bottom: 24px;">
          <h1 style="margin: 0; color: #ffffff; font-size: 20px; letter-spacing: -0.5px;">
            Davinci Wale Bhaiya <span style="color: #3b82f6; font-size: 11px; font-weight: 600; margin-left: 8px; border: 1px solid rgba(59,130,246,0.4); padding: 2px 8px; border-radius: 4px; text-transform: uppercase;">Payment Confirmed</span>
          </h1>
        </div>

        <h2 style="color: #ffffff; font-size: 22px; margin: 0 0 8px 0;">Your Download is Ready!</h2>
        <p style="color: #94a3b8; font-size: 14px; margin: 0 0 24px 0; line-height: 1.5;">
          Thank you for your purchase! Your payment for order <strong style="color: #ffffff;">#${orderNumber}</strong> has been successfully verified. Click below to download your digital zip files.
        </p>

        <div style="margin-bottom: 28px;">
          ${downloadItemsHtml}
        </div>

        <div style="background-color: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 16px; margin-bottom: 24px;">
          <p style="margin: 0 0 6px 0; color: #ffffff; font-size: 13px; font-weight: 600;">⚡ Perpetual Access Guarantee</p>
          <p style="margin: 0; color: #64748b; font-size: 12px; line-height: 1.4;">
            Your direct download links above are active for 7 days. You can also log into your <a href="${siteUrl}/account/library" style="color: #60a5fa; text-decoration: underline;">Account Library</a> at any time to generate fresh download links perpetually.
          </p>
        </div>

        <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 20px; text-align: center; color: #64748b; font-size: 12px;">
          <p style="margin: 0 0 4px 0;">Davinci Wale Bhaiya &bull; Cinematic Color Science & Tools</p>
          <p style="margin: 0;">If you have any questions or need technical support, simply reply to this email.</p>
        </div>

      </div>
    </body>
    </html>
  `;
}

export async function sendOrderDeliveryEmail(orderId) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        user: true,
      },
    });

    if (!order || !order.user?.email) {
      console.warn(`sendOrderDeliveryEmail skipped: Order ${orderId} not found or has no user email`);
      return null;
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://creative-404-main.vercel.app';
    const productIds = order.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const itemsWithDownloads = [];

    for (const item of order.items) {
      const prod = products.find((p) => p.id === item.productId);
      let downloadUrl = null;

      if (prod?.downloadFileKey) {
        try {
          downloadUrl = await createSignedDownloadUrl(
            prod.downloadFileKey,
            7 * 24 * 3600, // 7 days expiration
            prod.downloadFileName || `${prod.slug || 'product'}.zip`
          );
        } catch (storageErr) {
          console.error(`Failed to generate signed download URL for product ${prod.id}:`, storageErr);
        }
      }

      itemsWithDownloads.push({
        name: prod?.name || item.productName,
        fileName: prod?.downloadFileName || `${prod?.slug || 'package'}.zip`,
        fileSize: prod?.fileSize || null,
        downloadUrl,
      });
    }

    const html = renderOrderDownloadEmail({
      orderNumber: order.orderNumber,
      itemsWithDownloads,
      siteUrl,
    });

    const subject = `[Davinci Wale Bhaiya] Download Your Files - Order #${order.orderNumber}`;
    return await sendEmail({ to: order.user.email, subject, html });
  } catch (error) {
    console.error(`Error in sendOrderDeliveryEmail for order ${orderId}:`, error);
    return null;
  }
}
