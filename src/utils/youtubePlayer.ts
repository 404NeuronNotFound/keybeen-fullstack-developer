export interface YouTubePlayerInstance { destroy: () => void; playVideo: () => void; mute: () => void; unMute: () => void }
interface PlayerOptions {
  width: string; height: string; videoId: string; host: string;
  playerVars: { autoplay: number; playsinline: number; origin: string; rel: number };
  events: { onReady: (event: { target: YouTubePlayerInstance }) => void; onStateChange: (event: { data: number; target: YouTubePlayerInstance }) => void; onError: (event: { data: number }) => void; onAutoplayBlocked?: () => void };
}
interface YouTubeApi { Player: new (element: HTMLElement, options: PlayerOptions) => YouTubePlayerInstance }
type YouTubeWindow = Window & { YT?: YouTubeApi; onYouTubeIframeAPIReady?: () => void };
let pending: Promise<YouTubeApi> | undefined;

/** Set identification and permissions before the first iframe navigation. */
export function createYouTubeFrame(videoId: string, title: string, origin: string): HTMLIFrameElement {
  if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) throw new Error('Invalid YouTube video ID.');
  const iframe = document.createElement('iframe');
  iframe.title = `YouTube player: ${title}`;
  iframe.width = '100%'; iframe.height = '200';
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  iframe.allowFullscreen = true;
  // Start only after onReady applies the master mute state, avoiding an audio flash.
  const params = new URLSearchParams({ enablejsapi: '1', autoplay: '0', mute: '1', playsinline: '1', origin: new URL(origin).origin, rel: '0' });
  iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?${params}`;
  return iframe;
}

export function youtubePlaybackError(code: number): string {
  switch (code) {
    case 2: return 'Invalid video link (YouTube error 2). Choose another track.';
    case 5: return 'YouTube could not start video playback (error 5). Retry or open it on YouTube.';
    case 100: return 'This video was removed or made private (YouTube error 100).';
    case 101:
    case 150: return `The uploader does not allow this video to play on other websites (YouTube error ${code}). Open it on YouTube or choose another upload.`;
    case 153: return 'YouTube could not identify this embedded player (error 153). Retry; if it persists, check browser referrer/privacy settings.';
    default: return `YouTube could not play this track${Number.isFinite(code) ? ` (error ${code})` : ''}. Open it on YouTube or try another upload.`;
  }
}

export function loadYouTubePlayer(): Promise<YouTubeApi> {
  const target = window as YouTubeWindow;
  if (target.YT?.Player) return Promise.resolve(target.YT);
  pending ??= new Promise<YouTubeApi>((resolve, reject) => {
    const previous = target.onYouTubeIframeAPIReady;
    const timer = window.setTimeout(() => { document.getElementById('mixtape-youtube-api')?.remove(); pending = undefined; reject(new Error('The player could not connect to YouTube.')); }, 15000);
    target.onYouTubeIframeAPIReady = () => {
      clearTimeout(timer);
      previous?.();
      if (target.YT) resolve(target.YT);
      else { pending = undefined; reject(new Error('The player could not connect to YouTube.')); }
    };
    if (!document.getElementById('mixtape-youtube-api')) {
      const script = document.createElement('script'); script.id = 'mixtape-youtube-api';
      script.src = 'https://www.youtube.com/iframe_api'; script.async = true;
      script.onerror = () => { clearTimeout(timer); script.remove(); pending = undefined; reject(new Error('The player could not connect to YouTube.')); };
      document.head.appendChild(script);
    }
  });
  return pending;
}
