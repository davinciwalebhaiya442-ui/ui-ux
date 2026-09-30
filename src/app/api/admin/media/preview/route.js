import { requireAdminMedia } from '@/lib/auth';
import { createSignedDownloadUrl } from '@/lib/storage/r2';
export async function GET(request) { const unauthorized = await requireAdminMedia(request); if (unauthorized) return unauthorized; const key = new URL(request.url).searchParams.get('key'); if (!key || !key.startsWith('products/')) return Response.json({ error: 'INVALID_MEDIA_KEY' }, { status: 400 }); try { return Response.json({ url: await createSignedDownloadUrl(key, 3600) }); } catch { return Response.json({ error: 'PREVIEW_UNAVAILABLE' }, { status: 503 }); } }
