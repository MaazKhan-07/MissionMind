import React, { useRef, useEffect, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export const GlobalVideoBackground: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { effectiveTheme } = useTheme();
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    // Check system & stored reduced motion preference
    const checkMotion = () => {
      const storedPref = localStorage.getItem('missionmind_pref_reduced_motion') === 'true';
      const systemPref = typeof window !== 'undefined' && window.matchMedia
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;
      setReducedMotion(storedPref || systemPref);
    };

    checkMotion();

    if (typeof window !== 'undefined' && window.matchMedia) {
      const media = window.matchMedia('(prefers-reduced-motion: reduce)');
      const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      if (media.addEventListener) {
        media.addEventListener('change', listener);
      } else {
        media.addListener(listener);
      }
      return () => {
        if (media.removeEventListener) {
          media.removeEventListener('change', listener);
        } else {
          media.removeListener(listener);
        }
      };
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (reducedMotion) {
      video.pause();
    } else {
      video.play().catch(() => {
        // Autoplay policy or low battery mode; gracefully silent
      });
    }
  }, [reducedMotion, isLoaded]);

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 1. Underlying Cinematic Fallback Canvas */}
      <div className="absolute inset-0 bg-[#0B0F19]" />

      {/* 2. Persistent Global Background Video Asset */}
      {!hasError && (
        <video
          ref={videoRef}
          src="/media/missionmind-background.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onCanPlayThrough={() => setIsLoaded(true)}
          onLoadedData={() => setIsLoaded(true)}
          onError={() => {
            console.warn('MissionMind: Background video failed to load, falling back to ambient space gradient.');
            setHasError(true);
          }}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            isLoaded ? 'opacity-70' : 'opacity-0'
          }`}
        />
      )}

      {/* 3. Theme-Responsive Cinematic Readability Overlay */}
      {effectiveTheme === 'dark' ? (
        /* Dark Theme Void Black Overlay with subtle Cyan & Violet orbital glow */
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 90% 70% at 50% 30%, rgba(11, 15, 25, 0.45) 0%, rgba(11, 15, 25, 0.78) 75%, rgba(11, 15, 25, 0.92) 100%),
              linear-gradient(180deg, rgba(11, 15, 25, 0.55) 0%, rgba(17, 24, 39, 0.65) 50%, rgba(11, 15, 25, 0.85) 100%)
            `
          }}
        />
      ) : (
        /* Light Theme Daylight Aerospace Translucent Tint */
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(180deg, rgba(244, 247, 250, 0.82) 0%, rgba(244, 247, 250, 0.88) 100%),
              radial-gradient(ellipse at 50% 20%, rgba(255, 255, 255, 0.4) 0%, rgba(244, 247, 250, 0.85) 100%)
            `
          }}
        />
      )}

      {/* 4. Fine Atmospheric Grid Scanline Layer */}
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#06b6d4_1px,transparent_1px),linear-gradient(to_bottom,#06b6d4_1px,transparent_1px)] bg-[size:48px_48px]" />
    </div>
  );
};
