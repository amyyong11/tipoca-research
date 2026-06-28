'use client';

import { useEffect, useRef } from 'react';

// Each waypoint: scroll progress (0–1), viewport x (vw%), viewport y (vh%)
// Path stays at the right edge (91–95vw) where no content lives.
const WAYPOINTS = [
  { t: 0.00, x: 93, y: 14 },
  { t: 0.14, x: 91, y: 27 },
  { t: 0.28, x: 95, y: 40 },
  { t: 0.42, x: 90, y: 54 },
  { t: 0.57, x: 94, y: 65 },
  { t: 0.72, x: 91, y: 77 },
  { t: 0.86, x: 95, y: 87 },
  { t: 1.00, x: 92, y: 94 },
];

function smoothstep(t: number) {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

function getPosition(progress: number): { x: number; y: number } {
  const p = Math.max(0, Math.min(1, progress));
  let i = 0;
  while (i < WAYPOINTS.length - 2 && WAYPOINTS[i + 1].t <= p) i++;
  const a = WAYPOINTS[i];
  const b = WAYPOINTS[i + 1];
  const seg = (b.t - a.t) > 0 ? (p - a.t) / (b.t - a.t) : 1;
  const e = smoothstep(seg);
  return { x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e };
}

export function ScrollStar() {
  const starRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 93, y: 14 });
  const current = useRef({ x: 93, y: 14 });
  const rafId = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      target.current = getPosition(max > 0 ? window.scrollY / max : 0);
    };

    const tick = () => {
      const EASE = 0.055;
      current.current.x += (target.current.x - current.current.x) * EASE;
      current.current.y += (target.current.y - current.current.y) * EASE;
      if (starRef.current) {
        starRef.current.style.left = `${current.current.x}vw`;
        starRef.current.style.top = `${current.current.y}vh`;
      }
      rafId.current = requestAnimationFrame(tick);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    rafId.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <div
      ref={starRef}
      className="fixed pointer-events-none"
      style={{ transform: 'translate(-50%, -50%)', zIndex: 35 }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        style={{ animation: 'scrollStarPulse 2.6s ease-in-out infinite' }}
      >
        <defs>
          <filter id="scroll-star-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* 4-point star */}
        <path
          d="M12 1 L13.8 9.2 L22 12 L13.8 14.8 L12 23 L10.2 14.8 L2 12 L10.2 9.2 Z"
          fill="#5BC8E8"
          filter="url(#scroll-star-glow)"
        />
        {/* Bright centre dot */}
        <circle cx="12" cy="12" r="2" fill="#ffffff" opacity="0.9" />
      </svg>
    </div>
  );
}
