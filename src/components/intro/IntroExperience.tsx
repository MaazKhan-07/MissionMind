import React, { useRef, useState, useEffect } from 'react';
import { Sparkles, Volume2, Shield } from 'lucide-react';

interface IntroExperienceProps {
  onComplete: () => void;
}

export const IntroExperience: React.FC<IntroExperienceProps> = ({ onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [autoplayBlocked, setAutoplayBlocked] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;

    // Attempt autoplay (with automatic muted fallback to conform to browser autoplay policies)
    const startPlayback = async () => {
      try {
        video.muted = false;
        await video.play();
        setLoading(false);
        setAutoplayBlocked(false);
      } catch (err) {
        // Browser requires user gesture for unmuted sound; play muted automatically so video plays smoothly
        try {
          video.muted = true;
          await video.play();
          setLoading(false);
          setAutoplayBlocked(false);
        } catch (mutedErr) {
          setLoading(false);
          setAutoplayBlocked(true);
        }
      }
    };

    startPlayback();

    const handleEnded = () => {
      // Trigger cinematic fade, slight blur, slight scale transition
      setIsTransitioning(true);
      setTimeout(() => {
        onComplete();
      }, 950);
    };

    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('ended', handleEnded);
      video.pause();
    };
  }, [onComplete]);

  const handleManualEnter = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      video.muted = false;
      video.currentTime = 0;
      await video.play();
      setAutoplayBlocked(false);
    } catch (e) {
      // If still blocked, fallback to muted play
      video.muted = true;
      await video.play();
      setAutoplayBlocked(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#0B0F19] overflow-hidden select-none transition-all duration-1000 ${
        isTransitioning ? 'opacity-0 scale-105 filter blur-sm' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background Video Element */}
      <video
        ref={videoRef}
        src="/media/missionmind-intro.mp4"
        playsInline
        preload="auto"
        className="w-full h-full object-cover"
        onCanPlay={() => setLoading(false)}
      />

      {/* Loading State Overlay */}
      {loading && !autoplayBlocked && (
        <div className="absolute inset-0 bg-[#0B0F19] flex flex-col items-center justify-center space-y-4 z-10">
          <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center shadow-cyan-glow">
            <Sparkles className="w-6 h-6 text-cyan-400 animate-spin" />
          </div>
          <div className="text-center space-y-1">
            <h1 className="font-tech text-xl font-bold tracking-widest text-slate-100">
              MISSIONMIND
            </h1>
            <p className="font-mono text-[11px] text-cyan-400 tracking-widest uppercase animate-pulse">
              INITIALIZING MISSION INTERFACE
            </p>
          </div>
        </div>
      )}

      {/* Autoplay Blocked - Minimal Cinematic Entry Screen */}
      {autoplayBlocked && (
        <div className="absolute inset-0 bg-[#0B0F19]/95 backdrop-blur-md flex flex-col items-center justify-center space-y-8 z-20">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center shadow-cyan-glow">
              <Shield className="w-7 h-7 text-cyan-400" />
            </div>
            <h1 className="font-tech text-3xl font-extrabold tracking-widest text-slate-100 uppercase">
              MISSION<span className="text-cyan-400">MIND</span>
            </h1>
            <span className="font-mono text-xs text-slate-400 tracking-wider">
              ORBITAL OPERATIONS SYSTEM
            </span>
          </div>

          <button
            onClick={handleManualEnter}
            className="px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-tech font-bold text-sm tracking-widest uppercase rounded-xl shadow-cyan-glow hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
          >
            <Volume2 className="w-4 h-4" />
            <span>[ ENTER ]</span>
          </button>
        </div>
      )}

      {/* Skip Button for Accessibility */}
      {!loading && !autoplayBlocked && (
        <button
          onClick={() => {
            setIsTransitioning(true);
            setTimeout(onComplete, 500);
          }}
          className="absolute bottom-6 right-6 z-20 px-3.5 py-1.5 rounded-lg bg-black/40 hover:bg-black/70 border border-white/10 hover:border-cyan-500/40 text-slate-400 hover:text-white font-mono text-xs backdrop-blur-md transition-all"
        >
          SKIP INTRO →
        </button>
      )}
    </div>
  );
};
