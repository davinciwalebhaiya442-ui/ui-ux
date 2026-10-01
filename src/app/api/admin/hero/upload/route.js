import { requireAdminMedia } from '@/lib/auth';
import { uploadAsset, createSignedUploadUrl } from '@/lib/storage/r2';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 25 * 1024 * 1024; // 25MB

export async function POST(request) {
  const unauthorized = await requireAdminMedia(request);
  if (unauthorized) return unauthorized;

  try {
    const contentTypeHeader = request.headers.get('content-type') || '';

    // Handle Presigned URL Request (Zero Vercel payload limit)
    if (contentTypeHeader.includes('application/json')) {
      const body = await request.json();
      const { fileName, fileType } = body;

      if (!fileType || !ALLOWED_TYPES.includes(fileType)) {
        return Response.json({ error: 'Unsupported file type. Please upload a JPG, PNG, or WebP image.' }, { status: 415 });
      }

      const ext = fileName?.split('.').pop()?.toLowerCase() || 'webp';
      const key = `hero/hero-${Date.now()}.${ext}`;

      const uploadUrl = await createSignedUploadUrl(key, fileType, 900);
      const publicUrl = `/api/media?key=${encodeURIComponent(key)}`;

      return Response.json({
        success: true,
        presigned: true,
        uploadUrl,
        key,
        url: publicUrl,
      });
    }

    // Handle Direct Multipart Upload (for images <= 4MB)
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file.arrayBuffer !== 'function') {
      return Response.json({ error: 'No image file uploaded' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return Response.json({ error: 'Unsupported file type. Please upload a JPG, PNG, or WebP image.' }, { status: 415 });
    }

    if (file.size > MAX_SIZE) {
      return Response.json({ error: 'Image size exceeds maximum limit of 25MB' }, { status: 413 });
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
