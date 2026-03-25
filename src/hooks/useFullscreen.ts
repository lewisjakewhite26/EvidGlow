import { useCallback, useEffect, useState, type RefObject } from 'react';

function isActive() {
  return !!(
    document.fullscreenElement ??
    (document as Document & { webkitFullscreenElement?: Element }).webkitFullscreenElement
  );
}

async function enterFullscreen(el: HTMLElement) {
  if (el.requestFullscreen) return el.requestFullscreen();
  const wk = (el as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> })
    .webkitRequestFullscreen;
  if (wk) return wk.call(el);
  return Promise.reject(new Error('Fullscreen not supported'));
}

async function exitFullscreen() {
  if (document.exitFullscreen) return document.exitFullscreen();
  const wk = (document as Document & { webkitExitFullscreen?: () => Promise<void> })
    .webkitExitFullscreen;
  if (wk) return wk.call(document);
  return Promise.reject(new Error('Exit fullscreen not supported'));
}

/**
 * Toggle browser fullscreen on a container element. Syncs when user presses Esc.
 */
export function useFullscreen(containerRef: RefObject<HTMLElement | null>) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const sync = () => setIsFullscreen(isActive());
    document.addEventListener('fullscreenchange', sync);
    document.addEventListener('webkitfullscreenchange', sync as EventListener);
    sync();
    return () => {
      document.removeEventListener('fullscreenchange', sync);
      document.removeEventListener('webkitfullscreenchange', sync as EventListener);
    };
  }, []);

  const toggle = useCallback(async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (isActive()) await exitFullscreen();
      else await enterFullscreen(el);
    } catch {
      /* user gesture / policy */
    }
  }, [containerRef]);

  return { isFullscreen, toggle };
}
