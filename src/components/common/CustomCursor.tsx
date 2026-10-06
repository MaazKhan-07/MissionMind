import React, { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
}

export const CustomCursor: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const cursorDotRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const mousePos = useRef({ x: -100, y: -100 });
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Disable on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Red stardust dust cluster palette
    const colors = ['#EF4444', '#F87171', '#DC2626', '#FCA5A5', '#B91C1C'];

    const spawnParticles = (x: number, y: number, count = 2) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 1.6 + 0.4;
        particlesRef.current.push({
          x: x + (Math.random() - 0.5) * 8,
          y: y + (Math.random() - 0.5) * 8,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: Math.random() * 0.85 + 0.25,
          size: Math.random() * 2.8 + 1.2,
          life: 0,
          maxLife: Math.random() * 25 + 20,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
      // Cap max particles for high performance
      if (particlesRef.current.length > 80) {
        particlesRef.current.splice(0, particlesRef.current.length - 80);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      // Spawn red dust cluster around cursor
      spawnParticles(e.clientX, e.clientY, isHovered ? 3 : 1);

      // Check if target or parent is interactive
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest(
          'button, a, input, textarea, select, [role="button"], .interactive, .cursor-pointer'
        );
        setIsHovered(!!interactive);
      }
    };

    const handleMouseDown = () => {
      setIsMouseDown(true);
      spawnParticles(mousePos.current.x, mousePos.current.y, 8);
    };

    const handleMouseUp = () => {
      setIsMouseDown(false);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.body.addEventListener('mouseleave', handleMouseLeave);

    // Animation Loop
    const render = () => {
      if (cursorDotRef.current) {
        const scale = isMouseDown ? 0.75 : isHovered ? 1.65 : 1.0;
        cursorDotRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0px) translate(-50%, -50%) scale(${scale})`;
      }

      // Draw red dust particle cluster
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const remaining: Particle[] = [];

      for (let i = 0; i < particlesRef.current.length; i++) {
        const p = particlesRef.current[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.95;
        p.vy *= 0.95;

        const progress = p.life / p.maxLife;
        const currentAlpha = Math.max(0, p.alpha * (1 - progress));

        if (progress < 1.0 && currentAlpha > 0.01) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (1 - progress * 0.4), 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = currentAlpha;
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.color;
          ctx.fill();
          remaining.push(p);
        }
      }
      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;
      particlesRef.current = remaining;

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isVisible, isHovered, isMouseDown]);

  return (
    <>
      {/* Red Stardust Canvas Overlay */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[99998] bg-transparent"
      />

      {/* Main Cursor Center Red Dot */}
      <div
        ref={cursorDotRef}
        className={`fixed top-0 left-0 w-3 h-3 rounded-full pointer-events-none z-[99999] transition-opacity duration-200 bg-[#EF4444] shadow-[0_0_14px_#EF4444] ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ willChange: 'transform' }}
      />
    </>
  );
};
