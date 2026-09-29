import { useEffect, useRef, type CSSProperties } from 'react';
import { useLenis } from 'lenis/react';

/**
 * Fixed background layer that sits behind the whole landing page and
 * transitions as the visitor scrolls:
 *   - three glowing colour orbs cross-fade (violet -> cyan -> emerald/rose)
 *   - the orbs drift across the screen at different speeds (parallax)
 *   - a faint dot grid slides slowly underneath
 *
 * It updates DOM styles directly (no React re-render per scroll frame).
 */

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const smooth = (n: number) => {
  const t = clamp01(n);
  return t * t * (3 - 2 * t);
};

interface ScrollBackdropProps {
  reducedMotion?: boolean;
}

export function ScrollBackdrop({ reducedMotion = false }: ScrollBackdropProps) {
  const violetRef = useRef<HTMLDivElement>(null);
  const cyanRef = useRef<HTMLDivElement>(null);
  const warmRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const apply = (p: number) => {
    const violet = violetRef.current;
    const cyan = cyanRef.current;
    const warm = warmRef.current;
    const grid = gridRef.current;
    if (!violet || !cyan || !warm || !grid) return;

    // Colour cross-fade across the page
    const vOpacity = 1 - smooth(p / 0.5);
    const cOpacity = 1 - Math.abs(p - 0.5) / 0.4;
    const wOpacity = smooth((p - 0.55) / 0.45);

    violet.style.opacity = String(clamp01(vOpacity));
    cyan.style.opacity = String(clamp01(cOpacity));
    warm.style.opacity = String(clamp01(wOpacity));

    // Parallax drift (each orb moves at its own pace)
    violet.style.transform = `translate3d(${-10 + p * 55}vw, ${-15 + p * 55}vh, 0)`;
    cyan.style.transform = `translate3d(${70 - p * 60}vw, ${5 + p * 45}vh, 0)`;
    warm.style.transform = `translate3d(${20 + p * 45}vw, ${60 - p * 45}vh, 0)`;

    grid.style.backgroundPosition = `0px ${-p * 320}px`;
  };

  // Set the starting state (also handles page refresh mid-scroll)
  useEffect(() => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    apply(reducedMotion || total <= 0 ? 0.15 : clamp01(window.scrollY / total));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  // Follow the (smoothed) Lenis scroll position
  useLenis((lenis) => {
    if (reducedMotion) return;
    apply(clamp01(lenis.progress ?? 0));
  });

  const orbBase: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '70vmax',
    height: '70vmax',
    borderRadius: '9999px',
    willChange: 'transform, opacity',
    pointerEvents: 'none',
  };

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
    >
      <div
        ref={violetRef}
        style={{
          ...orbBase,
          background:
            'radial-gradient(circle, rgba(139,92,246,0.28) 0%, rgba(139,92,246,0.10) 40%, transparent 68%)',
        }}
      />
      <div
        ref={cyanRef}
        style={{
          ...orbBase,
          opacity: 0,
          background:
            'radial-gradient(circle, rgba(34,211,238,0.22) 0%, rgba(34,211,238,0.08) 40%, transparent 68%)',
        }}
      />
      <div
        ref={warmRef}
        style={{
          ...orbBase,
          opacity: 0,
          background:
            'radial-gradient(circle, rgba(244,63,94,0.20) 0%, rgba(16,185,129,0.10) 45%, transparent 68%)',
        }}
      />
      <div
        ref={gridRef}
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'radial-gradient(rgba(148,163,184,0.16) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          maskImage:
            'radial-gradient(ellipse at center, black 30%, transparent 80%)',
          WebkitMaskImage:
            'radial-gradient(ellipse at center, black 30%, transparent 80%)',
        }}
      />
    </div>
  );
}
