import React, { createContext, useContext, useEffect, useState } from 'react';
import { audioEngine } from '../services/audioSystem';

interface AudioContextType {
  audioEnabled: boolean;
  volume: number;
  toggleAudio: () => void;
  setVolume: (vol: number) => void;
  playClickSound: () => void;
  startAmbient: () => void;
  stopAmbient: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [audioEnabled, setAudioEnabled] = useState<boolean>(audioEngine.isEnabled());
  const [volume, setVolumeState] = useState<number>(audioEngine.getVolume());

  const toggleAudio = () => {
    const next = !audioEnabled;
    setAudioEnabled(next);
    audioEngine.setEnabled(next);
  };

  const handleSetVolume = (vol: number) => {
    setVolumeState(vol);
    audioEngine.setVolume(vol);
  };

  const playClickSound = () => {
    audioEngine.playClickSound();
  };

  const startAmbient = () => {
    audioEngine.startAmbient();
  };

  const stopAmbient = () => {
    audioEngine.stopAmbient();
  };

  // Attach global click event listener for interactive UI elements
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest(
        'button, a, input[type="submit"], input[type="button"], [role="button"], [data-clickable="true"], select, input[type="checkbox"], input[type="range"]'
      );

      if (interactive) {
        audioEngine.playClickSound();
      }
    };

    window.addEventListener('click', handleGlobalClick, { capture: true, passive: true });
    return () => {
      window.removeEventListener('click', handleGlobalClick, { capture: true });
    };
  }, []);

  return (
    <AudioContext.Provider
      value={{
        audioEnabled,
        volume,
        toggleAudio,
        setVolume: handleSetVolume,
        playClickSound,
        startAmbient,
        stopAmbient
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
