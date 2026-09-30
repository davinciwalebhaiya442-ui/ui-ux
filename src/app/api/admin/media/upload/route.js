import { requireAdminMedia } from '@/lib/auth';
import { uploadAsset, createSignedDownloadUrl } from '@/lib/storage/r2';

const rules = {
  image: { types: ['image/jpeg', 'image/png', 'image/webp'], max: 15 * 1024 * 1024 },
  video: { types: ['video/mp4', 'video/webm'], max: 500 * 1024 * 1024 },
};

export async function POST(request) {
  const unauthorized = await requireAdminMedia(request);
  if (unauthorized) return unauthorized;
  try {
    const form = await request.formData();
    const file = form.get('file');
    const mediaType = form.get('mediaType') || 'image';
    const slug = String(form.get('slug') || 'untitled').toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const rule = rules[mediaType];
    if (!rule || !file || typeof file.arrayBuffer !== 'function') return Response.json({ error: 'INVALID_UPLOAD' }, { status: 400 });
    if (!rule.types.includes(file.type)) return Response.json({ error: `Unsupported ${mediaType} file type` }, { status: 415 });
    if (file.size > rule.max) return Response.json({ error: `File is too large. Maximum is ${Math.round(rule.max / 1024 / 1024)}MB.` }, { status: 413 });
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
    const key = `products/${slug}/${mediaType}/${Date.now()}-${safeName}`;
    await uploadAsset({ key, body: Buffer.from(await file.arrayBuffer()), contentType: file.type });
    const previewUrl = await createSignedDownloadUrl(key, 3600);
    return Response.json({ key, name: file.name, size: file.size, type: file.type, previewUrl });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'UPLOAD_FAILED. Check R2 configuration and try again.' }, { status: 503 });
  }
}
