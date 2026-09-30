import { requireAdminMedia } from '@/lib/auth';
import { deleteAsset } from '@/lib/storage/r2';
export async function DELETE(request) { const unauthorized = await requireAdminMedia(request); if (unauthorized) return unauthorized; try { const { key } = await request.json(); if (!key || !String(key).startsWith('products/')) return Response.json({ error: 'INVALID_MEDIA_KEY' }, { status: 400 }); await deleteAsset(key); return Response.json({ success: true }); } catch { return Response.json({ error: 'DELETE_FAILED' }, { status: 503 }); } }
