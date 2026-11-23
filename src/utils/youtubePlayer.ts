export interface YouTubePlayerInstance { destroy: () => void; playVideo: () => void }
interface PlayerOptions {
  width: string; height: string; videoId: string; host: string;
  playerVars: { autoplay: number; playsinline: number; origin: string; rel: number };
  events: { onReady: (event: { target: YouTubePlayerInstance }) => void; onStateChange: (event: { data: number }) => void; onError: () => void };
}
interface YouTubeApi { Player: new (element: HTMLElement, options: PlayerOptions) => YouTubePlayerInstance }
type YouTubeWindow = Window & { YT?: YouTubeApi; onYouTubeIframeAPIReady?: () => void };
let pending: Promise<YouTubeApi> | undefined;

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
