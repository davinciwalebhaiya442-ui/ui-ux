export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const rawUrl = String(body.url || '').trim();

    if (!rawUrl) {
      return Response.json(
        { error: 'Please enter a valid video link.' },
        { status: 400 }
      );
    }

    // 1. Check for YouTube
    const ytMatch = rawUrl.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/))([a-zA-Z0-9_-]{11})/i
    );

    if (ytMatch) {
      const videoId = ytMatch[1];
      const cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;

      let title = `YouTube Reference Video (${videoId})`;
      let author = 'YouTube Creator';
      let thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
      const highResThumbnail = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

      // Try fetching metadata via oEmbed
      try {
        const oembedRes = await fetch(
          `https://noembed.com/embed?url=${encodeURIComponent(cleanUrl)}`,
          { signal: AbortSignal.timeout(4000) }
        );
        if (oembedRes.ok) {
          const oembedData = await oembedRes.json();
          if (oembedData.title) title = oembedData.title;
          if (oembedData.author_name) author = oembedData.author_name;
          if (oembedData.thumbnail_url) thumbnail = oembedData.thumbnail_url;
        }
      } catch {
        // Fallback to default metadata
      }

      return Response.json({
        success: true,
        platform: 'youtube',
        platformLabel: 'YouTube Video & Shorts',
        id: videoId,
        title,
        author,
        thumbnail,
        highResThumbnail,
        cleanUrl,
        formats: [
          {
            id: 'video-1080p',
            label: '1080p / 4K Full HD Video',
            quality: '1080p / 4K',
            ext: 'MP4',
            desc: 'Best visual fidelity for timeline grading & reference cuts',
            downloadUrl: `https://www.ssyoutube.com/watch?v=${videoId}`,
            directEngine: `https://cobalt.tools/?u=${encodeURIComponent(cleanUrl)}`,
          },
          {
            id: 'video-720p',
            label: '720p HD Proxy (Fast)',
            quality: '720p',
            ext: 'MP4',
            desc: 'Fast lightweight proxy file for rapid timeline preview',
            downloadUrl: `https://y2mate.is/en/youtube-downloader/`,
            directEngine: `https://savetube.me/`,
          },
          {
            id: 'audio-stem',
            label: '320kbps Audio / Stem Extract',
            quality: '320 kbps',
            ext: 'MP3 / WAV',
            desc: 'Clean 48kHz audio track for audio sync and stem isolation',
            downloadUrl: `https://y2mate.is/en/youtube-to-mp3/`,
            directEngine: `https://cobalt.tools/?u=${encodeURIComponent(cleanUrl)}`,
          },
        ],
      });
    }

    // 2. Check for Instagram
    const igMatch = rawUrl.match(
      /(?:instagram\.com\/(?:reel|p|tv)\/)([a-zA-Z0-9_-]+)/i
    );

    if (igMatch) {
      const shortcode = igMatch[1];
      const cleanUrl = `https://www.instagram.com/reel/${shortcode}/`;

      let directVideoUrl = null;
      let thumbnail = null;

      // Try quick backend scraper with tight timeout
      try {
        const igRes = await fetch(
          `https://backend1.tioo.eu.org/igdl?url=${encodeURIComponent(cleanUrl)}`,
          { signal: AbortSignal.timeout(4500) }
        );
        if (igRes.ok) {
          const igData = await igRes.json();
          if (Array.isArray(igData) && igData.length > 0 && igData[0]?.url) {
            directVideoUrl = igData[0].url;
            if (igData[0]?.thumbnail) thumbnail = igData[0].thumbnail;
          }
        }
      } catch {
        // Fallback to rapid mirror generators
      }

      return Response.json({
        success: true,
        platform: 'instagram',
        platformLabel: 'Instagram Reel & Post',
        id: shortcode,
        title: `Instagram Reel (${shortcode})`,
        author: 'Instagram Creator',
        thumbnail: thumbnail || null,
        cleanUrl,
        directUrl: directVideoUrl,
        formats: [
          {
            id: 'ig-video-hd',
            label: 'Original 1080x1920 HD Video',
            quality: '1080×1920',
            ext: 'MP4',
            desc: 'Direct mobile vertical video with original audio sync',
            downloadUrl: directVideoUrl || `https://snapinsta.app/`,
            directEngine: `https://fastdl.app/`,
            isDirect: Boolean(directVideoUrl),
          },
          {
            id: 'ig-audio',
            label: 'Reel Audio / Music Stem',
            quality: '320 kbps',
            ext: 'MP3',
            desc: 'Isolated audio track for timeline sound design',
            downloadUrl: `https://saveig.app/`,
            directEngine: `https://snapinsta.app/`,
          },
        ],
      });
    }

    return Response.json(
      {
        error:
          'Unsupported link. Please paste a valid YouTube video/shorts link or an Instagram reel/post link.',
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Video extraction error:', error);
    return Response.json(
      { error: 'Failed to process media link. Please verify the URL and try again.' },
      { status: 500 }
    );
  }
}
