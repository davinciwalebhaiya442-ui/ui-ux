export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const mediaUrl = searchParams.get('url');
    const filename = searchParams.get('filename') || 'video.mp4';

    if (!mediaUrl) {
      return new Response('Missing media URL', { status: 400 });
    }

    const upstreamRes = await fetch(mediaUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!upstreamRes.ok) {
      return new Response('Failed to stream media from source', {
        status: upstreamRes.status,
      });
    }

    const contentType = upstreamRes.headers.get('content-type') || (filename.endsWith('.mp3') ? 'audio/mpeg' : 'video/mp4');
    const contentLength = upstreamRes.headers.get('content-length');

    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', contentType);
    responseHeaders.set(
      'Content-Disposition',
      `attachment; filename="${filename.replace(/"/g, '')}"`
    );
    if (contentLength) {
      responseHeaders.set('Content-Length', contentLength);
    }
    responseHeaders.set('Cache-Control', 'public, max-age=3600');

    return new Response(upstreamRes.body, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (err) {
    console.error('Download stream error:', err);
    return new Response('Internal streaming error', { status: 500 });
  }
}
