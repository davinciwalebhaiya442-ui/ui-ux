import { getAssetObject } from '@/lib/storage/r2';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    let key = searchParams.get('key');

    if (!key || typeof key !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing key parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
      key = decodeURIComponent(key);
    } catch {}

    const isAllowed =
      key.startsWith('products/') ||
      key.startsWith('hero/') ||
      key.startsWith('fonts/');

    if (!isAllowed) {
      return new Response(JSON.stringify({ error: 'Forbidden media path' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const obj = await getAssetObject(key);
    const buffer = Buffer.from(await obj.Body.transformToByteArray());

    let contentType = obj.ContentType;
    if (!contentType || contentType === 'application/octet-stream') {
      if (key.endsWith('.webp')) contentType = 'image/webp';
      else if (key.endsWith('.png')) contentType = 'image/png';
      else if (key.endsWith('.jpg') || key.endsWith('.jpeg')) contentType = 'image/jpeg';
      else if (key.endsWith('.woff2')) contentType = 'font/woff2';
      else if (key.endsWith('.woff')) contentType = 'font/woff';
      else if (key.endsWith('.ttf')) contentType = 'font/ttf';
      else if (key.endsWith('.otf')) contentType = 'font/otf';
      else contentType = 'image/webp';
    }

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
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
