import { requireAdminMedia } from '@/lib/auth';
import { uploadAsset } from '@/lib/storage/r2';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 20 * 1024 * 1024; // 20MB

export async function POST(request) {
  const unauthorized = await requireAdminMedia(request);
  if (unauthorized) return unauthorized;

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file.arrayBuffer !== 'function') {
      return Response.json({ error: 'No image file uploaded' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return Response.json({ error: 'Unsupported file type. Please upload a JPG, PNG, or WebP image.' }, { status: 415 });
    }

    if (file.size > MAX_SIZE) {
      return Response.json({ error: 'Image size exceeds maximum limit of 20MB' }, { status: 413 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const key = `hero/hero-${Date.now()}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    await uploadAsset({
      key,
      body: buffer,
      contentType: file.type,
    });

    const publicUrl = `/api/media?key=${encodeURIComponent(key)}`;

    return Response.json({
      success: true,
      key,
      url: publicUrl,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (error) {
    console.error('Hero image upload failed:', error);
    return Response.json({ error: 'Failed to upload hero image to storage.' }, { status: 500 });
  }
}
