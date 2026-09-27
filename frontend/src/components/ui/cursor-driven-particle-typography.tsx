import React, { useRef, useEffect } from 'react';

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
}

export function CursorDrivenParticleTypography({ 
  text, 
  className 
}: { 
  text: string; 
  className?: string 
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;

    const initParticles = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
      if (width === 0 || height === 0) return;

      particlesRef.current = [];
      const offCanvas = document.createElement('canvas');
      const offCtx = offCanvas.getContext('2d');
      if (!offCtx) return;

      offCanvas.width = width;
      offCanvas.height = height;

      // Ensure the text fits comfortably horizontally with 10% safety margin (5% each side)
      // This completely eliminates any clipping of first/last letters.
      const targetMaxWidth = width * 0.88;

      // Reference measurement at 100px font
      const testFontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      offCtx.font = `900 100px ${testFontFamily}`;
      const measuredAt100 = offCtx.measureText(text).width || 1000;

      // Calculate font size that ensures the text never exceeds targetMaxWidth or 75% of height
      const calculatedByWidth = (targetMaxWidth / measuredAt100) * 100;
      const maxByHeight = height * 0.72;
      const maxCap = 96; // Premium crisp headline size cap
      const minCap = 20; // Mobile minimum
      const fontSize = Math.floor(Math.max(minCap, Math.min(calculatedByWidth, maxByHeight, maxCap)));

      // Render text onto offscreen canvas for sampling
      offCtx.font = `900 ${fontSize}px ${testFontFamily}`;
      offCtx.fillStyle = 'white';
      offCtx.textAlign = 'center';
      offCtx.textBaseline = 'middle';
      offCtx.fillText(text, width / 2, height / 2);

      // Sample pixels
      const imgData = offCtx.getImageData(0, 0, width, height).data;
      // Adaptive step size based on fontSize for high particle fidelity
      const step = Math.max(3, Math.min(5, Math.floor(fontSize / 20)));

      // Bounding box of text to center particles perfectly
      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const index = (y * width + x) * 4;
          if (imgData[index + 3] > 140) {
            // Smooth gradient color from violet (#8b5cf6) to cyan (#06b6d4)
            const ratio = Math.max(0, Math.min(1, x / width));
            const r = Math.floor(139 * (1 - ratio) + 6 * ratio);
            const g = Math.floor(92 * (1 - ratio) + 182 * ratio);
            const b = Math.floor(246 * (1 - ratio) + 212 * ratio);

            // Small initial random jitter without displacing beyond bounds
            particlesRef.current.push({
              x: x + (Math.random() - 0.5) * 8,
              y: y + (Math.random() - 0.5) * 8,
              originX: x,
              originY: y,
              vx: 0,
              vy: 0,
              color: `rgb(${r}, ${g}, ${b})`,
              size: Math.random() * 1.5 + 1.2
            });
          }
        }
      }
    };

    initParticles();

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;
      const radius = Math.min(90, Math.max(50, width * 0.08));
      const spring = 0.06;
      const friction = 0.82;

      const particles = particlesRef.current;
      const len = particles.length;

      for (let i = 0; i < len; i++) {
        const p = particles[i];

        // Mouse displacement
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const distSq = dx * dx + dy * dy;
        const radiusSq = radius * radius;

        if (distSq < radiusSq && distSq > 0) {
          const dist = Math.sqrt(distSq);
          const force = (radius - dist) / radius;
          p.vx -= (dx / dist) * force * 3;
          p.vy -= (dy / dist) * force * 3;
        }

        // Return to origin with spring physics
        p.vx += (p.originX - p.x) * spring;
        p.vy += (p.originY - p.y) * spring;

        p.vx *= friction;
        p.vy *= friction;

        p.x += p.vx;
        p.y += p.vy;

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    // Use ResizeObserver for accurate sizing across all breakpoints
    const ro = new ResizeObserver(() => {
      initParticles();
    });
    ro.observe(canvas);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      ro.disconnect();
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [text]);

  return (
    <canvas 
      ref={canvasRef} 
      className={`w-full h-full block touch-none select-none ${className || ''}`}
    />
  );
}
