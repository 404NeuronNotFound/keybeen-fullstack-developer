import { useCallback, useEffect, useRef } from 'react';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

let apiLoadPromise: Promise<void> | null = null;

function loadYouTubeApi(): Promise<void> {
  if (apiLoadPromise) return apiLoadPromise;
  apiLoadPromise = new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve();
      return;
    }
    const prevCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prevCallback?.();
      resolve();
    };
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  });
  return apiLoadPromise;
}

/**
 * Loads a hidden YouTube IFrame player and exposes simple playFrom/stop
 * controls. This plays the track through YouTube's own official embed —
 * nothing is downloaded, ripped, or redistributed, the audio stream stays
 * entirely on YouTube's platform and is just remote-controlled here.
 *
 * NOTE on autoplay: browsers restrict unmuted programmatic playback unless
 * there's been a real user gesture on the page. If you've already clicked
 * the mute/unmute button elsewhere in the app this session, that usually
 * satisfies Chrome's "user has interacted with this site" allowance for
 * subsequent JS-triggered playback. If audio doesn't start on first hover,
 * that's the browser autoplay policy — the same class of issue we hit
 * with the Web Audio hover sounds earlier.
 */
export function useYouTubeBackgroundAudio(videoId: string) {
  const playerRef      = useRef<any>(null);
  const containerIdRef = useRef(`yt-audio-${Math.random().toString(36).slice(2)}`);
  const readyRef        = useRef(false);

  useEffect(() => {
    let cancelled = false;
    loadYouTubeApi().then(() => {
      if (cancelled) return;
      playerRef.current = new window.YT.Player(containerIdRef.current, {
        videoId,
        width: 1,
        height: 1,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          fs: 0,
        },
        events: {
          onReady: () => { readyRef.current = true; },
        },
      });
    });
    return () => {
      cancelled = true;
      playerRef.current?.destroy?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  const playFrom = useCallback((seconds: number) => {
    const p = playerRef.current;
    if (!p || !readyRef.current) return;
    p.seekTo(seconds, true);
    p.playVideo();
  }, []);

  const stop = useCallback(() => {
    const p = playerRef.current;
    if (!p || !readyRef.current) return;
    p.pauseVideo();
  }, []);

  return { containerId: containerIdRef.current, playFrom, stop };
}