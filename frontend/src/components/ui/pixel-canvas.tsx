import React, { useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';

interface PixelCanvasProps {
  colors?: string[];
  speed?: number;
  gap?: number;
  className?: string;
}

interface Pixel {
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
  targetOpacity: number;
}

export function PixelCanvas({ 
  colors = ['#8b5cf6', '#06b6d4', '#1e293b'], 
  speed = 0.02, 
  gap = 6, 
  className 
}: PixelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const pixelsRef = useRef<Pixel[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;
    
    const size = 10;
    const spacing = size + gap;

    const initPixels = () => {
      pixelsRef.current = [];
      const cols = Math.ceil(width / spacing);
      const rows = Math.ceil(height / spacing);

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if (Math.random() > 0.3) {
            pixelsRef.current.push({
              x: x * spacing,
              y: y * spacing,
              size,
              color: colors[Math.floor(Math.random() * colors.length)],
              opacity: Math.random() * 0.5,
              targetOpacity: Math.random() * 0.5
            });
          }
        }
      }
    };

    initPixels();

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      pixelsRef.current.forEach(p => {
        // Change target opacity randomly
        if (Math.random() < 0.01) {
          p.targetOpacity = Math.random() > 0.8 ? (Math.random() * 0.8 + 0.2) : (Math.random() * 0.2);
        }

        // Lerp towards target
        p.opacity += (p.targetOpacity - p.opacity) * speed;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });

      ctx.globalAlpha = 1;
      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
      initPixels();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [colors, speed, gap]);

  return (
    <canvas 
      ref={canvasRef} 
      className={cn("w-full h-full block", className)}
    />
  );
}
