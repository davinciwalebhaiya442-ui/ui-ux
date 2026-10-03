import { requireAdminMedia } from '@/lib/auth';
import { uploadAsset, createSignedUploadUrl } from '@/lib/storage/r2';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const FONT_EXTENSIONS = ['ttf', 'otf', 'woff', 'woff2'];
const ALLOWED_FONT_TYPES = [
  'font/ttf',
  'font/otf',
  'font/woff',
  'font/woff2',
  'application/font-woff',
  'application/font-woff2',
  'application/x-font-ttf',
  'application/x-font-truetype',
  'application/x-font-opentype',
  'application/octet-stream',
];

const MAX_SIZE = 25 * 1024 * 1024; // 25MB

export async function POST(request) {
  const unauthorized = await requireAdminMedia(request);
  if (unauthorized) return unauthorized;

  try {
    const contentTypeHeader = request.headers.get('content-type') || '';

    // Handle Presigned URL Request (Zero Vercel payload limit)
    if (contentTypeHeader.includes('application/json')) {
      const body = await request.json();
      const { fileName, fileType, uploadKind } = body;

      const ext = fileName?.split('.').pop()?.toLowerCase() || 'webp';
      const isFont = uploadKind === 'font' || FONT_EXTENSIONS.includes(ext);

      if (isFont) {
        if (!FONT_EXTENSIONS.includes(ext)) {
          return Response.json({ error: 'Unsupported font format. Please upload a .ttf, .otf, .woff, or .woff2 file.' }, { status: 415 });
        }
      } else {
        if (!fileType || !ALLOWED_IMAGE_TYPES.includes(fileType)) {
          return Response.json({ error: 'Unsupported file type. Please upload a JPG, PNG, or WebP image.' }, { status: 415 });
        }
      }

      const keyPrefix = isFont ? 'hero/fonts' : 'hero';
      const key = `${keyPrefix}/${isFont ? 'font' : 'hero'}-${Date.now()}.${ext}`;

      const uploadUrl = await createSignedUploadUrl(key, fileType, 900);
      const publicUrl = `/api/media?key=${encodeURIComponent(key)}`;

      return Response.json({
        success: true,
        presigned: true,
        uploadUrl,
        key,
        url: publicUrl,
        isFont,
        fontName: fileName?.replace(/\.[^.]+$/, '') || 'Custom Font',
      });
    }

    // Handle Direct Multipart Upload
    const formData = await request.formData();
    const file = formData.get('file');
    const uploadKind = formData.get('uploadKind');

    if (!file || typeof file.arrayBuffer !== 'function') {
      return Response.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return Response.json({ error: 'File size exceeds maximum limit of 25MB' }, { status: 413 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const isFont = uploadKind === 'font' || FONT_EXTENSIONS.includes(ext);

    if (isFont) {
      if (!FONT_EXTENSIONS.includes(ext)) {
        return Response.json({ error: 'Unsupported font format. Please upload a .ttf, .otf, .woff, or .woff2 file.' }, { status: 415 });
      }
    } else {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return Response.json({ error: 'Unsupported file type. Please upload a JPG, PNG, or WebP image.' }, { status: 415 });
      }
    }

    const keyPrefix = isFont ? 'hero/fonts' : 'hero';
    const key = `${keyPrefix}/${isFont ? 'font' : 'hero'}-${Date.now()}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    await uploadAsset({
      key,
      body: buffer,
      contentType: file.type || (isFont ? `font/${ext}` : 'image/jpeg'),
    });

    const publicUrl = `/api/media?key=${encodeURIComponent(key)}`;

    return Response.json({
      success: true,
      key,
      url: publicUrl,
      fileName: file.name,
      fileSize: file.size,
      isFont,
      fontName: file.name.replace(/\.[^.]+$/, ''),
    });
  } catch (error) {
    console.error('Hero file upload failed:', error);
    return Response.json({ error: 'Failed to upload file to storage.' }, { status: 500 });
  }
}
