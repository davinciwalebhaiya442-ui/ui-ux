import { getAssetObject } from '@/lib/storage/r2';

export const dynamic = 'force-dynamic';

function getMimeType(key, defaultType) {
  const ext = key.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'woff2':
      return 'font/woff2';
    case 'woff':
      return 'font/woff';
    case 'ttf':
      return 'font/ttf';
    case 'otf':
      return 'font/otf';
    case 'webp':
      return 'image/webp';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'svg':
      return 'image/svg+xml';
    default:
      return defaultType || 'application/octet-stream';
  }
}

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

    const isAllowed = key.startsWith('products/') || key.startsWith('hero/') || key.startsWith('comparison/');
    if (!isAllowed) {
      return new Response(JSON.stringify({ error: 'Forbidden media path' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const obj = await getAssetObject(key);
    const buffer = Buffer.from(await obj.Body.transformToByteArray());
    const contentType = getMimeType(key, obj.ContentType);

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(buffer.length),
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        'Access-Control-Allow-Origin': '*',
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
