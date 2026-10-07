import { useCallback, useEffect, useRef } from 'react';
import { useSoundStore } from '../store/soundStore';

interface YouTubePlayer {
  loadVideoById(options: { videoId: string; startSeconds: number }): void;
  pauseVideo(): void;
  mute(): void;
  unMute(): void;
  destroy(): void;
}

interface YouTubePlayerOptions {
  width: number;
  height: number;
  playerVars: Record<string, number>;
  events: {
    onReady(event: { target: YouTubePlayer }): void;
    onStateChange(event: { target: YouTubePlayer; data: number }): void;
  };
}

declare global {
  interface Window {
    YT?: { Player: new (container: HTMLElement, options: YouTubePlayerOptions) => YouTubePlayer };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiLoadPromise: Promise<void> | null = null;
function loadYouTubeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve();
  if (apiLoadPromise) return apiLoadPromise;
  apiLoadPromise = new Promise((resolve, reject) => {
    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      try { previousReady?.(); } finally { resolve(); }
    };
    let script = document.querySelector<HTMLScriptElement>('script[src="https://www.youtube.com/iframe_api"]');
    if (!script) {
      script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(script);
    }
    script.addEventListener('error', () => {
      script.remove();
      apiLoadPromise = null;
      reject(new Error('YouTube could not load'));
    }, { once: true });
  });
  return apiLoadPromise;
}

// All avatars share one player. The latest hovered avatar owns playback.
let player: YouTubePlayer | null = null;
let container: HTMLDivElement | null = null;
let loading = false;
let ready = false;
let generation = 0;
let consumers = 0;
let timer: ReturnType<typeof setTimeout> | null = null;
let request: { owner: symbol; videoId: string; seconds: number } | null = null;

function allowed() {
  const { muted, musicOptedIn } = useSoundStore.getState();
  return !muted && musicOptedIn;
}

function silence() {
  if (!player || !ready) return;
  // Muting also covers a play command still being processed by the iframe.
  try { player.mute(); } catch { /* A disconnected iframe is already silent. */ }
  try { player.pauseVideo(); } catch { /* The iframe may have been removed. */ }
}

function cancel() {
  if (timer !== null) clearTimeout(timer);
  timer = null;
  request = null;
  silence();
}

function playPending() {
  if (!allowed() || !request || !ready || !player || timer !== null) return;
  try {
    player.unMute();
    player.loadVideoById({ videoId: request.videoId, startSeconds: request.seconds });
  } catch {
    // Playback is optional; browser autoplay restrictions can prevent it.
    cancel();
  }
}

function initialize() {
  if (player || loading || !allowed() || !request) return;
  loading = true;
  const startedGeneration = generation;
  void loadYouTubeApi().then(() => {
    if (startedGeneration !== generation) return;
    loading = false;
    if (!allowed() || !request || !window.YT) return;
    container = document.createElement('div');
    Object.assign(container.style, {
      position: 'fixed', left: '-9999px', top: '-9999px',
      width: '1px', height: '1px', pointerEvents: 'none',
    });
    document.body.appendChild(container);
    player = new window.YT.Player(container, {
      width: 1, height: 1,
      playerVars: { autoplay: 0, controls: 0, disablekb: 1, fs: 0, rel: 0 },
      events: {
        onReady: ({ target }) => {
          if (startedGeneration !== generation) {
            target.destroy();
            return;
          }
          player = target;
          ready = true;
          if (allowed() && request) playPending();
          else silence();
        },
        onStateChange: ({ target, data }) => {
          if (data === 1 && (!allowed() || !request || timer !== null || startedGeneration !== generation)) {
            target.mute();
            target.pauseVideo();
          }
        },
      },
    });
  }).catch(() => {
    if (startedGeneration !== generation) return;
    loading = false;
    cancel();
    try { player?.destroy(); } catch { /* Failed initialization needs no playback. */ }
    player = null;
    ready = false;
    container?.remove();
    container = null;
  });
}

useSoundStore.subscribe(() => {
  if (!allowed()) cancel();
});

export function useYouTubeBackgroundAudio(videoId: string) {
  const owner = useRef(Symbol('avatar-audio'));
  const stop = useCallback(() => {
    if (request?.owner === owner.current) cancel();
  }, []);

  useEffect(() => {
    consumers += 1;
    const instanceOwner = owner.current;
    return () => {
      if (request?.owner === instanceOwner) cancel();
      consumers -= 1;
      if (consumers === 0) {
        cancel();
        generation += 1;
        loading = false;
        ready = false;
        try { player?.destroy(); } catch { /* The iframe may already be gone. */ }
        player = null;
        container?.remove();
        container = null;
      }
    };
  }, []);

  const playFrom = useCallback((seconds: number, delayMs = 0) => {
    if (!allowed()) return;
    cancel();
    request = { owner: owner.current, videoId, seconds };
    timer = setTimeout(() => {
      timer = null;
      if (!allowed() || !request) return;
      if (ready) playPending();
      else initialize();
    }, delayMs);
  }, [videoId]);

  return { playFrom, stop };
}
