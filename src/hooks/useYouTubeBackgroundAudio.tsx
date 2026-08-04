import { useCallback, useEffect, useRef } from 'react';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiLoadPromise: Promise<void> | null = null;

function loadYouTubeApi(): Promise<void> {
  if (window.YT?.Player) {
    return Promise.resolve();
  }

  if (apiLoadPromise) {
    return apiLoadPromise;
  }

  apiLoadPromise = new Promise((resolve) => {
    const existingScript = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]'
    );

    const previousReady = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      resolve();
    };

    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(script);
    }
  });

  return apiLoadPromise;
}

export function useYouTubeBackgroundAudio(videoId: string) {
  const playerRef = useRef<any>(null);
  const readyRef = useRef(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Create our own hidden container.
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.width = '1px';
    container.style.height = '1px';
    container.style.pointerEvents = 'none';

    document.body.appendChild(container);
    containerRef.current = container;

    loadYouTubeApi().then(() => {
      if (cancelled) return;

      playerRef.current = new window.YT.Player(container, {
        videoId,
        width: 1,
        height: 1,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          fs: 0,
          rel: 0,
        },
        events: {
          onReady: () => {
            readyRef.current = true;
          },
        },
      });
    });

    return () => {
      cancelled = true;
      readyRef.current = false;

      try {
        playerRef.current?.destroy?.();
      } catch {
        // ignore YouTube cleanup errors
      }

      playerRef.current = null;

      if (
        containerRef.current &&
        document.body.contains(containerRef.current)
      ) {
        document.body.removeChild(containerRef.current);
      }

      containerRef.current = null;
    };
  }, [videoId]);

  const playFrom = useCallback((seconds: number) => {
    const player = playerRef.current;

    if (!player || !readyRef.current) return;

    try {
      player.seekTo(seconds, true);
      player.playVideo();
    } catch {}
  }, []);

  const stop = useCallback(() => {
    const player = playerRef.current;

    if (!player || !readyRef.current) return;

    try {
      player.pauseVideo();
    } catch {}
  }, []);

  return {
    playFrom,
    stop,
  };
}