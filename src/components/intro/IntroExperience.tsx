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

  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video.duration && !isNaN(video.duration)) {
        const remaining = Math.max(0, Math.ceil(video.duration - video.currentTime));
        setTimeLeft(remaining);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#0B0C10] overflow-hidden select-none transition-all duration-1000 ${
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
        <div className="absolute inset-0 bg-[#0B0C10] flex flex-col items-center justify-center space-y-4 z-10">
          <div className="w-12 h-12 rounded-xl bg-[#1F2833]/80 border border-[#66FCF1]/40 flex items-center justify-center shadow-cyan-glow">
            <Sparkles className="w-6 h-6 text-[#66FCF1] animate-spin" />
          </div>
          <div className="text-center space-y-1">
            <h1 className="font-tech text-xl font-bold tracking-widest text-[#C5C6C7]">
              MISSIONMIND
            </h1>
            <p className="font-mono text-[11px] text-[#66FCF1] tracking-widest uppercase animate-pulse">
              INITIALIZING MISSION INTERFACE
            </p>
          </div>
        </div>
      )}

      {/* Autoplay Blocked - Minimal Cinematic Entry Screen */}
      {autoplayBlocked && (
        <div className="absolute inset-0 bg-[#0B0C10]/95 backdrop-blur-md flex flex-col items-center justify-center space-y-8 z-20">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#1F2833] border border-[#66FCF1]/50 flex items-center justify-center shadow-cyan-glow">
              <Shield className="w-7 h-7 text-[#66FCF1]" />
            </div>
            <h1 className="font-tech text-3xl font-extrabold tracking-widest text-[#C5C6C7] uppercase">
              MISSION<span className="text-[#66FCF1]">MIND</span>
            </h1>
            <span className="font-mono text-xs text-[#8899A6] tracking-wider">
              ORBITAL OPERATIONS SYSTEM
            </span>
          </div>

          <button
            onClick={handleManualEnter}
            className="px-8 py-3.5 bg-[#66FCF1] hover:bg-[#88FFF8] text-[#0B0C10] font-tech font-bold text-sm tracking-widest uppercase rounded-xl shadow-[0_0_20px_rgba(102,252,241,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3 cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
            <span>[ ENTER ]</span>
          </button>
        </div>
      )}

      {/* Prominent Skip Intro Button with Live Timer Count */}
      {!loading && !autoplayBlocked && (
        <button
          onClick={() => {
            setIsTransitioning(true);
            setTimeout(onComplete, 500);
          }}
          className="absolute bottom-8 right-8 z-30 px-7 py-3.5 rounded-xl bg-black/80 hover:bg-black border-2 border-[#66FCF1] text-white font-mono text-sm font-bold tracking-wider backdrop-blur-md shadow-[0_0_25px_rgba(102,252,241,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3 cursor-pointer"
        >
          <span>SKIP INTRO</span>
          <span className="px-2.5 py-0.5 rounded-md bg-[#66FCF1]/20 text-[#66FCF1] border border-[#66FCF1]/40 text-xs font-mono font-bold">
            {timeLeft > 0 ? `${String(timeLeft).padStart(2, '0')}s` : '00s'}
          </span>
          <span className="text-[#66FCF1]">→</span>
        </button>
      )}
    </div>
  );
};
