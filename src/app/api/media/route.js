import { getAssetObject } from '@/lib/storage/r2';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key || typeof key !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing key parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!key.startsWith('products/') && !key.startsWith('hero/')) {
      return new Response(JSON.stringify({ error: 'Forbidden media path' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const obj = await getAssetObject(key);
    const buffer = Buffer.from(await obj.Body.transformToByteArray());

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': obj.ContentType || 'image/jpeg',
        'Content-Length': String(buffer.length),
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error) {
    console.error('Media proxy error:', error);
    return new Response(JSON.stringify({ error: 'Unable to load media' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
