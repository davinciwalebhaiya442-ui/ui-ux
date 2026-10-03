export const dynamic = 'force-dynamic';

async function fetchCobalt(url, options = {}) {
  const instances = [
    { url: 'http://185.197.195.62:9000', auth: null },
    { url: 'https://dwnld.nichind.dev', auth: 'Api-Key b05007aa-bb63-4267-a66e-78f8e10bf9bf' },
  ];

  for (const inst of instances) {
    try {
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };
      if (inst.auth) headers['Authorization'] = inst.auth;

      const res = await fetch(`${inst.url}/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          url,
          videoQuality: options.videoQuality || '1080',
          downloadMode: options.downloadMode || 'auto',
          filenameStyle: 'classic',
        }),
        signal: AbortSignal.timeout(8000),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url && (data.status === 'tunnel' || data.status === 'redirect' || data.status === 'stream')) {
          return {
            success: true,
            url: data.url,
            filename: data.filename || 'video.mp4',
            status: data.status,
          };
        }
      }
    } catch {
      // Try next instance
    }
  }

  return null;
}

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

      let title = `YouTube Video (${videoId})`;
      let author = 'YouTube Creator';
      let thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
      const highResThumbnail = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

      // Fetch metadata via oEmbed
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
        // Fallback
      }

      // Fetch direct video & audio tunnel streams in parallel
      const [videoTunnel, audioTunnel] = await Promise.all([
        fetchCobalt(cleanUrl, { downloadMode: 'auto', videoQuality: '1080' }),
        fetchCobalt(cleanUrl, { downloadMode: 'audio' }),
      ]);

      const formats = [];

      if (videoTunnel?.url) {
        formats.push({
          id: 'video-1080p-direct',
          label: 'Full HD 1080p MP4 (Direct)',
          quality: '1080p HD',
          ext: 'MP4',
          desc: 'Direct high-speed video download with clean stereo audio',
          downloadUrl: videoTunnel.url,
          filename: videoTunnel.filename || `${title}.mp4`,
          isDirect: true,
          badge: 'High Speed Direct',
        });
      }

      if (audioTunnel?.url) {
        formats.push({
          id: 'audio-stem-direct',
          label: 'Master 48kHz Audio Track (Direct)',
          quality: '320 kbps',
          ext: 'MP3',
          desc: 'Isolated high-bitrate audio track for timeline music sync',
          downloadUrl: audioTunnel.url,
          filename: audioTunnel.filename || `${title}.mp3`,
          isDirect: true,
          badge: 'Audio Only',
        });
      }

      // Always include backup mirrors so user never gets stuck
      formats.push(
        {
          id: 'video-backup-mirror',
          label: 'Full HD 1080p / 4K (Mirror 2)',
          quality: '1080p / 4K',
          ext: 'MP4',
          desc: 'High-speed alternative CDN render for 4K / 60fps clips',
          downloadUrl: `https://cobalt.tools/?u=${encodeURIComponent(cleanUrl)}`,
          directEngine: `https://savetube.me/`,
          isDirect: false,
          badge: 'Mirror CDN',
        },
        {
          id: 'audio-backup-mirror',
          label: 'MP3 Audio Stream (Mirror 2)',
          quality: '320 kbps',
          ext: 'MP3',
          desc: 'Fast audio extract backup mirror',
          downloadUrl: `https://y2mate.is/en/youtube-to-mp3/`,
          directEngine: `https://cobalt.tools/?u=${encodeURIComponent(cleanUrl)}`,
          isDirect: false,
          badge: 'Audio Mirror',
        }
      );

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
        formats,
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

      // Try quick backend scrapers
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
        // Fallback
      }

      // Try Cobalt fallback for Instagram
      if (!directVideoUrl) {
        const igCobalt = await fetchCobalt(cleanUrl, { downloadMode: 'auto' });
        if (igCobalt?.url) {
          directVideoUrl = igCobalt.url;
        }
      }

      const formats = [];

      if (directVideoUrl) {
        formats.push({
          id: 'ig-direct-hd',
          label: 'Original 1080x1920 HD MP4 (Direct)',
          quality: '1080×1920',
          ext: 'MP4',
          desc: 'Direct mobile vertical video with sync stereo audio',
          downloadUrl: directVideoUrl,
          filename: `Instagram_Reel_${shortcode}.mp4`,
          isDirect: true,
          badge: 'Direct Stream',
        });
      }

      // Add high-speed direct web resolver mirrors
      formats.push(
        {
          id: 'ig-fastdl',
          label: 'FastDL Instant Reel Downloader',
          quality: '1080×1920 HD',
          ext: 'MP4',
          desc: 'Direct instant vertical video deliverable with zero ads',
          downloadUrl: `https://fastdl.app/`,
          directEngine: `https://snapinsta.app/`,
          isDirect: false,
          badge: 'Fast Mirror',
        },
        {
          id: 'ig-snapinsta',
          label: 'SnapInsta Reel & Audio Extractor',
          quality: 'Original HQ',
          ext: 'MP4 / MP3',
          desc: 'High-fidelity audio & video extractor for Instagram timelines',
          downloadUrl: `https://snapinsta.app/`,
          directEngine: `https://saveig.app/`,
          isDirect: false,
          badge: 'Alternative',
        }
      );

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
        formats,
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
